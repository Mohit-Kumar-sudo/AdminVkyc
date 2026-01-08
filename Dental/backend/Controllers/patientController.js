const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Patient = require('../Models/Patient');
const { incrementImageConversionUsage } = require('../Helpers/imageConversionLimits');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function canAccessPatient(req, patient) {
  const role = req.user.role;
  if (role === 'admin') return true;
  if (role === 'subadmin') {
    return patient.client?.toString() === req.user.client;
  }
  // doctor
  return patient.doctor?.toString() === req.user.id;
}

async function listPatients(req, res) {
  try {
    const { doctorId, clientId, q } = req.query;
    const filter = {};

    const role = req.user.role;
    if (role === 'doctor') {
      filter.doctor = req.user.id;
      if (req.user.client) filter.client = req.user.client;
    } else if (role === 'subadmin') {
      filter.client = req.user.client;
      if (doctorId) filter.doctor = doctorId;
    } else if (role === 'admin') {
      if (clientId) filter.client = clientId;
      if (doctorId) filter.doctor = doctorId;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { contact: { $regex: q, $options: 'i' } },
      ];
    }

    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    return res.json(patients);
  } catch (err) {
    console.error('List patients error:', err);
    return res.status(500).json({ error: 'Failed to list patients' });
  }
}

async function getPatient(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });
    return res.json(patient);
  } catch (err) {
    console.error('Get patient error:', err);
    return res.status(500).json({ error: 'Failed to get patient' });
  }
}

async function createPatient(req, res) {
  try {
    const { name, dob, email, contact, disease, history, prescription, doctorId, clientId } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const role = req.user.role;
    let doctor = req.user.id;
    let client = req.user.client || undefined;

    if (role === 'admin') {
      if (doctorId) doctor = doctorId;
      if (clientId) client = clientId;
    } else if (role === 'subadmin') {
      client = req.user.client;
      if (doctorId) doctor = doctorId;
    }

    const patient = await Patient.create({
      name,
      dob: dob ? new Date(dob) : undefined,
      email,
      contact,
      disease,
      history,
      prescription,
      doctor,
      client,
      createdBy: req.user.id,
    });

    // handle images if any
    if (req.files && req.files.length) {
      const savedImages = await saveImagesForPatient(patient._id.toString(), req.files);
      patient.images.push(...savedImages);
      await patient.save();
    }

    return res.status(201).json(patient);
  } catch (err) {
    console.error('Create patient error:', err);
    return res.status(500).json({ error: 'Failed to create patient' });
  }
}

async function updatePatient(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    const { name, dob, email, contact, disease, history, prescription, doctorId, clientId } = req.body;

    if (name !== undefined) patient.name = name;
    if (dob !== undefined) patient.dob = dob ? new Date(dob) : undefined;
    if (email !== undefined) patient.email = email;
    if (contact !== undefined) patient.contact = contact;
    if (disease !== undefined) patient.disease = disease;
    if (history !== undefined) patient.history = history;
    if (prescription !== undefined) patient.prescription = prescription;

    // allow reassignment by admin; subadmin within client
    if (doctorId !== undefined) {
      if (req.user.role === 'admin' || req.user.role === 'subadmin') {
        patient.doctor = doctorId || patient.doctor;
      }
    }
    if (clientId !== undefined) {
      if (req.user.role === 'admin') {
        patient.client = clientId || patient.client;
      }
    }

    if (req.files && req.files.length) {
      const savedImages = await saveImagesForPatient(patient._id.toString(), req.files);
      patient.images.push(...savedImages);
    }

    await patient.save();
    return res.json(patient);
  } catch (err) {
    console.error('Update patient error:', err);
    return res.status(500).json({ error: 'Failed to update patient' });
  }
}

async function deletePatient(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    // delete images on disk
    try {
      const patientDir = path.join(process.cwd(), 'public', 'uploads', 'patients', patient._id.toString());
      if (fs.existsSync(patientDir)) {
        fs.rmSync(patientDir, { recursive: true, force: true });
      }
    } catch {}

    await Patient.deleteOne({ _id: patient._id });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete patient error:', err);
    return res.status(500).json({ error: 'Failed to delete patient' });
  }
}

async function addPatientImages(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    if (!req.files || !req.files.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const savedImages = await saveImagesForPatient(patient._id.toString(), req.files);
    patient.images.push(...savedImages);
    await patient.save();
    return res.json(patient);
  } catch (err) {
    console.error('Add images error:', err);
    return res.status(500).json({ error: 'Failed to add images' });
  }
}

async function saveImagesForPatient(patientId, files) {
  const baseDir = path.join(process.cwd(), 'public', 'uploads', 'patients', patientId);
  ensureDirSync(baseDir);
  const outputs = [];
  for (const file of files) {
    const ts = Date.now();
    // Create simple, clean filename with just timestamp
    const outName = `${ts}.jpg`;
    const outPath = path.join(baseDir, outName);
    const pipeline = sharp(file.buffer).rotate().resize({ width: 1280, withoutEnlargement: true }).jpeg({ quality: 85 });
    const { width, height, size } = await pipeline.toFile(outPath);
    // Use forward slashes for web URLs
    const relPath = `uploads/patients/${patientId}/${outName}`;
    outputs.push({ filename: outName, path: relPath, size, width, height, mimeType: 'image/jpeg' });
  }
  return outputs;
}

async function addBeforeAfterImages(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    if (!req.files || !req.files.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { type, treatmentDate, notes } = req.body;
    if (!type || !['before', 'after'].includes(type)) {
      return res.status(400).json({ error: 'type must be "before" or "after"' });
    }

    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'patients', patient._id.toString(), 'before-after');
    ensureDirSync(baseDir);

    let uploadedImagePath = null;

    for (const file of req.files) {
      const ts = Date.now();
      // Remove ALL extensions and clean the filename completely
      // If originalname is "after-123-before-456.jpg.jpg.png", this will extract just the base
      const cleanName = file.originalname
        .replace(/\.(jpg|jpeg|png|gif|webp)+$/gi, '') // Remove all image extensions
        .replace(/\s+/g, '_') // Replace spaces with underscore
        .substring(0, 50); // Limit length to prevent overly long filenames
      
      // Create simple, clean filename with just type and timestamp
      const outName = `${type}-${ts}.jpg`;
      const outPath = path.join(baseDir, outName);
      const pipeline = sharp(file.buffer).rotate().resize({ width: 1280, withoutEnlargement: true }).jpeg({ quality: 85 });
      const { width, height, size } = await pipeline.toFile(outPath);
      // Use forward slashes for web URLs
      const relPath = `uploads/patients/${patient._id.toString()}/before-after/${outName}`;
      
      console.log(`[Image Upload] Saved ${type} image:`, {
        originalName: file.originalname,
        savedAs: outName,
        filePath: outPath,
        relativePath: relPath,
        size: `${(size / 1024).toFixed(2)}KB`,
        dimensions: `${width}x${height}`
      });
      
      uploadedImagePath = relPath;
      
      patient.beforeAfterImages.push({
        type,
        filename: outName,
        path: relPath,
        size,
        width,
        height,
        mimeType: 'image/jpeg',
        treatmentDate: treatmentDate ? new Date(treatmentDate) : new Date(),
        notes: notes || '',
      });
    }

    await patient.save();
    
    return res.json({ 
      ...patient.toObject(), 
      imagePath: uploadedImagePath,
      imageId: patient.beforeAfterImages[patient.beforeAfterImages.length - 1]._id 
    });
  } catch (err) {
    console.error('Add before/after images error:', err);
    return res.status(500).json({ error: 'Failed to add before/after images' });
  }
}

async function generateImage(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    const { type, imageId, imagePath, treatmentType } = req.body;
    
    if (!type || !['before', 'after'].includes(type)) {
      return res.status(400).json({ error: 'type must be "before" or "after"' });
    }

    if (!imagePath) {
      return res.status(400).json({ error: 'Missing imagePath in request body' });
    }

    const apiKey = process.env.GENAI_API_KEY;
    if (!apiKey) {
      console.warn('GENAI_API_KEY not set. Returning original image.');
      const originalUrl = `${process.env.BASE_URL || 'http://localhost:8080'}/${imagePath}`;
      return res.json({
        success: true,
        generatedImage: originalUrl,
        warning: 'GENAI_API_KEY not set on backend. Returned original image.',
        type,
        patientId: patient._id
      });
    }

    // Read the uploaded image and convert to base64
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Image file not found' });
    }

    const imageBuffer = fs.readFileSync(fullPath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg';

    try {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      // Define prompts based on treatment type
      const treatmentPrompts = {
        'IMPLANTS': [
          "You are a professional dental image editor. Using the provided photo of a patient's smile,",
          "generate a realistic 'after' result showing dental implant treatment with these constraints:",
          "1) Add realistic dental implants to replace missing teeth. Match the color and shape of surrounding teeth.",
          "2) Ensure implants look natural with proper alignment and spacing.",
          "3) Preserve patient identity: do NOT alter facial features, skin tone, or change hair.",
          "4) Keep the gums and soft tissue natural-looking around implants.",
          "5) Maintain natural lighting and shadows. No artificial effects or jewelry.",
          "Return a single photorealistic edited image showing successful implant placement."
        ].join(' '),
        'SMILE DESIGNING': [
          "You are a professional dental image editor. Using the provided photo of a patient's smile,",
          "generate a realistic 'after' result showing complete smile makeover with these constraints:",
          "1) Create perfectly aligned, symmetrical, and proportionate teeth.",
          "2) Apply subtle tooth whitening for a bright, natural Hollywood smile.",
          "3) Fix gaps, crowding, and uneven edges for an aesthetically pleasing smile.",
          "4) Preserve patient identity: do NOT alter facial features, skin tone, or change hair.",
          "5) Ensure teeth look natural, not artificially white. Keep lighting & shadows realistic.",
          "Return a single photorealistic edited image showing a beautiful designed smile."
        ].join(' '),
        'TEETH WHITENING': [
          "You are a professional dental image editor. Using the provided photo of a patient's smile,",
          "generate a realistic 'after' result showing professional teeth whitening with these constraints:",
          "1) Brighten and whiten the teeth to a natural, healthy shade (not artificially bright).",
          "2) Maintain the natural tooth shape, alignment, and texture - only change the color.",
          "3) Keep slight natural variation in tooth color for realism.",
          "4) Preserve patient identity: do NOT alter facial features, skin tone, lips, or hair.",
          "5) Do NOT change tooth alignment, gaps, or add any other dental work.",
          "Return a single photorealistic edited image showing naturally whitened teeth."
        ].join(' '),
        'BRACES': [
          "You are a professional dental image editor. Using the provided photo of a patient's smile,",
          "generate a realistic 'after' result showing orthodontic treatment completion with these constraints:",
          "1) Straighten and align all teeth perfectly with proper spacing.",
          "2) Close any gaps and correct overcrowding or misalignment.",
          "3) Ensure teeth are in proper occlusion with even incisal edges.",
          "4) Preserve patient identity: do NOT alter facial features, skin tone, or change hair.",
          "5) Show the final result AFTER braces are removed - no braces visible.",
          "Return a single photorealistic edited image showing perfectly aligned teeth."
        ].join(' ')
      };

      const promptText = treatmentPrompts[treatmentType] || treatmentPrompts['SMILE DESIGNING'];

      // Build request contents (text prompt + inline image data)
      const contents = [
        { text: promptText },
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
      ];

      // Call the image model
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents,
      });

      // Robustly extract the first image from response
      let outBase64 = null;
      let outMime = mimeType;

      // Helper to scan possible shapes
      const tryExtractFromCandidate = (cand) => {
        if (!cand) return null;
        const parts = cand.content?.parts || cand?.content || [];
        if (Array.isArray(parts)) {
          for (const part of parts) {
            if (part?.inlineData?.data) {
              return { data: part.inlineData.data, mime: part.inlineData.mimeType || outMime };
            }
            if (part?.data && typeof part.data === 'string' && part.data.startsWith('/9')) {
              return { data: part.data, mime: outMime };
            }
            if (part?.image && typeof part.image === 'string' && part.image.startsWith('data:')) {
              const m = /^data:(.+);base64,(.*)$/i.exec(part.image);
              if (m) return { data: m[2], mime: m[1] };
            }
          }
        } else if (typeof parts === 'string' && parts.startsWith('data:')) {
          const m = /^data:(.+);base64,(.*)$/i.exec(parts);
          if (m) return { data: m[2], mime: m[1] };
        }
        if (cand.inlineData?.data) return { data: cand.inlineData.data, mime: cand.inlineData.mimeType || outMime };
        if (cand.image && typeof cand.image === 'string' && cand.image.startsWith('data:')) {
          const m = /^data:(.+);base64,(.*)$/i.exec(cand.image);
          if (m) return { data: m[2], mime: m[1] };
        }
        return null;
      };

      const candidates = response?.candidates || [];
      for (const cand of candidates) {
        const got = tryExtractFromCandidate(cand);
        if (got) {
          outBase64 = got.data;
          outMime = got.mime || outMime;
          break;
        }
      }

      // Extra fallback: response.output_image or response.outputs
      if (!outBase64) {
        if (response?.output_image && typeof response.output_image === 'string') {
          const m = /^data:(.+);base64,(.*)$/i.exec(response.output_image);
          if (m) {
            outBase64 = m[2];
            outMime = m[1];
          }
        }
        if (!outBase64 && Array.isArray(response?.outputs)) {
          for (const out of response.outputs) {
            if (typeof out === 'string' && out.startsWith('data:')) {
              const m = /^data:(.+);base64,(.*)$/i.exec(out);
              if (m) {
                outBase64 = m[2];
                outMime = m[1];
                break;
              }
            }
            if (out?.image && typeof out.image === 'string' && out.image.startsWith('data:')) {
              const m = /^data:(.+);base64,(.*)$/i.exec(out.image);
              if (m) {
                outBase64 = m[2];
                outMime = m[1];
                break;
              }
            }
            if (out?.data && typeof out.data === 'string' && out.data.startsWith('/9')) {
              outBase64 = out.data;
              break;
            }
          }
        }
      }

      if (!outBase64) {
        console.warn('[generateImage] No image bytes found in GenAI response:', JSON.stringify(response, null, 2));
        const originalUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/${imagePath}`;
        return res.json({
          success: false,
          generatedImage: originalUrl,
          warning: 'GenAI returned no image bytes. Check server logs for full response.',
          type,
          patientId: patient._id
        });
      }

      // Construct data URL and return
      const generatedImage = `data:${outMime};base64,${outBase64}`;
      
      // Increment usage count for this doctor
      await incrementImageConversionUsage(req.user.id);
      
      return res.json({
        success: true,
        generatedImage,
        type,
        patientId: patient._id
      });
    } catch (err) {
      console.error('[generateImage] GenAI SDK call failed:', err && err.stack ? err.stack : err);
      const originalUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/${imagePath}`;
      return res.json({
        success: false,
        generatedImage: originalUrl,
        warning: 'GenAI SDK call failed on backend. See logs.',
        sdkError: err?.message || String(err),
        type,
        patientId: patient._id
      });
    }
  } catch (err) {
    console.error('Generate image error:', err);
    return res.status(500).json({ error: 'Failed to generate image' });
  }
}

async function deleteSavedImage(req, res) {
  try {
    const { id } = req.params;
    const { imagePath, type } = req.body;

    if (!imagePath || !type) {
      return res.status(400).json({ error: 'Missing imagePath or type' });
    }

    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    // Remove from database array - filter out the image with matching path
    patient.beforeAfterImages = patient.beforeAfterImages.filter(
      img => img.path !== imagePath
    );

    await patient.save();

    // Delete the physical file
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Delete image error:', err);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
}

async function addMonthlyTreatment(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    const { month, year, treatmentType, treatmentsPlan, treatmentsCompleted, improvements, notes, nextSteps } = req.body;
    
    if (!month || !year || !treatmentType || !treatmentsPlan) {
      return res.status(400).json({ error: 'month, year, treatmentType, and treatmentsPlan are required' });
    }

    const monthlyRecord = {
      month: parseInt(month),
      year: parseInt(year),
      treatmentType,
      treatmentsPlan,
      treatmentsCompleted,
      improvements,
      notes,
      nextSteps,
      recordedBy: req.user.id,
    };

    patient.monthlyTreatments.push(monthlyRecord);
    await patient.save();

    return res.json(patient);
  } catch (err) {
    console.error('Add monthly treatment error:', err);
    return res.status(500).json({ error: 'Failed to add monthly treatment' });
  }
}

async function updateMonthlyTreatment(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    const { recordId } = req.params;
    const { month, year, treatmentType, treatmentsPlan, treatmentsCompleted, improvements, notes, nextSteps } = req.body;

    const record = patient.monthlyTreatments.id(recordId);
    if (!record) return res.status(404).json({ error: 'Monthly treatment record not found' });

    if (month !== undefined) record.month = parseInt(month);
    if (year !== undefined) record.year = parseInt(year);
    if (treatmentType) record.treatmentType = treatmentType;
    if (treatmentsPlan) record.treatmentsPlan = treatmentsPlan;
    if (treatmentsCompleted !== undefined) record.treatmentsCompleted = treatmentsCompleted;
    if (improvements !== undefined) record.improvements = improvements;
    if (notes !== undefined) record.notes = notes;
    if (nextSteps !== undefined) record.nextSteps = nextSteps;

    await patient.save();

    return res.json(patient);
  } catch (err) {
    console.error('Update monthly treatment error:', err);
    return res.status(500).json({ error: 'Failed to update monthly treatment' });
  }
}

async function deleteMonthlyTreatment(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    const { recordId } = req.params;
    const record = patient.monthlyTreatments.id(recordId);
    if (!record) return res.status(404).json({ error: 'Monthly treatment record not found' });

    record.deleteOne();
    await patient.save();

    return res.json({ message: 'Monthly treatment record deleted successfully' });
  } catch (err) {
    console.error('Delete monthly treatment error:', err);
    return res.status(500).json({ error: 'Failed to delete monthly treatment' });
  }
}

async function analyzePhoto(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    const { imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ error: 'Missing imagePath in request body' });
    }

    // The imagePath comes as 'uploads/patients/...' but files are stored in 'public/uploads/...'
    // So we need to add 'public' prefix if it's not already there
    let fullPath;
    if (imagePath.startsWith('public/')) {
      fullPath = path.join(__dirname, '..', imagePath);
    } else {
      fullPath = path.join(__dirname, '..', 'public', imagePath);
    }
    
    if (!fs.existsSync(fullPath)) {
      console.error('Image file not found at:', fullPath);
      console.error('Original imagePath:', imagePath);
      return res.status(404).json({ error: 'Image file not found', attemptedPath: fullPath });
    }

    // Read and encode the image
    const imageBuffer = fs.readFileSync(fullPath);
    const base64Image = imageBuffer.toString('base64');
    
    // Detect MIME type
    let mimeType = 'image/jpeg';
    if (imagePath.toLowerCase().endsWith('.png')) mimeType = 'image/png';
    else if (imagePath.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';

    // Initialize Google AI
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const apiKey = process.env.GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }
    const ai = new GoogleGenerativeAI(apiKey);

    // Create analysis prompt
    const analysisPrompt = [
      "You are an expert dental professional analyzing this specific dental photograph.",
      "Analyze ONLY this image and provide a detailed assessment for THIS PHOTO:",
      "",
      "1. What I See in This Photo: Describe the exact dental condition visible in this specific image",
      "   Use numbered lists (1, 2, 3, etc.) for each point, NOT asterisks or dashes:",
      "   1) Tooth alignment and positioning",
      "   2) Spacing issues or gaps",
      "   3) Color and discoloration",
      "   4) Gum health",
      "   5) Any visible damage or concerns",
      "",
      "2. Issues Identified in This Photo: List specific problems visible in this image using numbered format (1, 2, 3, etc.)",
      "",
      "3. Recommended Treatment Plan: Based on what you see in this photo, suggest appropriate treatments using numbered format (1, 2, 3, etc.)",
      "",
      "4. Expected Results: Describe the improvements possible using numbered format (1, 2, 3, etc.)",
      "",
      "IMPORTANT: Use ONLY numbered lists (1, 2, 3...) throughout your response. Do NOT use asterisks (*) or dashes (-) for bullet points.",
      "Be specific to THIS photo only. Do not make assumptions about progress over time or compare with other photos.",
      "Format your response in clear sections. Be professional, specific, and encouraging."
    ].join('\n');

    const contents = [
      { text: analysisPrompt },
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ];

    // Call Gemini for analysis
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(contents);
    const response = result.response;
    const analysis = response.text();

    return res.json({ 
      analysis,
      imagePath,
      analyzedAt: new Date()
    });
  } catch (err) {
    console.error('Analyze photo error:', err);
    return res.status(500).json({ error: 'Failed to analyze photo', details: err.message });
  }
}

async function generateProgressImages(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    const { imagePath, treatmentType } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ error: 'Missing imagePath in request body' });
    }

    // Get full path to the image
    let fullPath;
    if (imagePath.startsWith('public/')) {
      fullPath = path.join(__dirname, '..', imagePath);
    } else {
      fullPath = path.join(__dirname, '..', 'public', imagePath);
    }
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Image file not found' });
    }

    // Read and encode the image
    const imageBuffer = fs.readFileSync(fullPath);
    const base64Image = imageBuffer.toString('base64');
    
    // Detect MIME type
    let mimeType = 'image/jpeg';
    if (imagePath.toLowerCase().endsWith('.png')) mimeType = 'image/png';
    else if (imagePath.toLowerCase().endsWith('.webp')) mimeType = 'image/webp';

    // Initialize Google AI
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const apiKey = process.env.GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }
    const ai = new GoogleGenerativeAI(apiKey);

    // Define milestones with gradual improvement prompts
    const milestones = [
      {
        month: 1,
        percentage: 25,
        prompt: [
          "You are a professional dental image editor. Using the provided photo, generate a realistic 'Month 1' progress image with these constraints:",
          "1) Show EXTREMELY SUBTLE improvements - changes should be BARELY visible, almost unnoticeable (only 10-15% actual progress)",
          "2) For alignment issues: teeth VERY slightly less crowded, gaps reduced by only 1-2mm maximum",
          "3) For whitening: MINIMAL brightening - just 1-2 shades lighter, easily mistaken for lighting",
          "4) For smile design: TINY edge smoothing on 1-2 teeth only, barely perceptible symmetry change",
          "5) Preserve patient identity completely: same face, skin, hair, lighting, expression",
          "6) Keep changes ULTRA realistic and minimal - treatment has just started, results are not yet obvious",
          "7) Most of the dental issues should still be clearly visible and present",
          "Return a photorealistic edited image showing very early treatment stage with minimal visible change."
        ].join(' ')
      },
      {
        month: 3,
        percentage: 50,
        prompt: [
          "You are a professional dental image editor. Using the provided photo, generate a realistic 'Month 3' progress image with these constraints:",
          "1) Show SUBTLE to MODERATE improvements - visible progress but still conservative (30-40% actual progress)",
          "2) For alignment: teeth becoming straighter but still showing some misalignment, gaps reduced by 30-40% only",
          "3) For whitening: noticeable brightening of 2-3 shades, but not yet a bright white smile",
          "4) For smile design: improved symmetry starting to show, some tooth edges smoother but work still in progress",
          "5) Preserve patient identity completely: same face, skin, hair, lighting, expression",
          "6) Changes should be clearly visible but conservative - significant work still remains",
          "7) Some original dental issues should still be present and noticeable",
          "Return a photorealistic edited image showing early-mid treatment progress with gradual improvements."
        ].join(' ')
      },
      {
        month: 6,
        percentage: 75,
        prompt: [
          "You are a professional dental image editor. Using the provided photo, generate a realistic 'Month 6' progress image with these constraints:",
          "1) Show SIGNIFICANT improvements - nearly complete transformation (75% progress)",
          "2) For alignment: teeth mostly straight and well-aligned, minor tweaks remain",
          "3) For whitening: bright, healthy white smile with natural appearance",
          "4) For smile design: excellent symmetry and proportion, fine-tuning stage",
          "5) Preserve patient identity completely: same face, skin, hair, lighting",
          "6) Nearly perfect results with small refinements still needed",
          "Return a photorealistic edited image showing advanced treatment stage."
        ].join(' ')
      },
      {
        month: 12,
        percentage: 100,
        prompt: [
          "You are a professional dental image editor. Using the provided photo, generate a realistic 'Month 12' final result image with these constraints:",
          "1) Show COMPLETE transformation - perfect final results (100% complete)",
          "2) For alignment: perfectly straight, symmetrical, and proportionate teeth",
          "3) For whitening: bright, natural Hollywood smile",
          "4) For smile design: flawless aesthetics with ideal tooth shape and spacing",
          "5) Preserve patient identity completely: same face, skin, hair, lighting",
          "6) This is the ideal final outcome - perfection achieved",
          "Return a photorealistic edited image showing completed treatment results."
        ].join(' ')
      }
    ];

    const progressData = [];

    // Generate an image for each milestone
    for (const milestone of milestones) {
      try {
        const contents = [
          { text: milestone.prompt },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ];

        const { GoogleGenAI } = require('@google/genai');
        const genai = new GoogleGenAI({ apiKey });
        const response = await genai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents,
        });

        // Extract generated image (same logic as generateImage function)
        let outBase64 = null;
        let outMime = mimeType;

        const tryExtractFromCandidate = (cand) => {
          if (!cand) return null;
          const parts = cand.content?.parts || cand?.content || [];
          if (Array.isArray(parts)) {
            for (const part of parts) {
              if (part?.inlineData?.data) {
                return { data: part.inlineData.data, mime: part.inlineData.mimeType || outMime };
              }
              if (part?.data && typeof part.data === 'string' && part.data.startsWith('/9')) {
                return { data: part.data, mime: outMime };
              }
            }
          }
          if (cand.inlineData?.data) return { data: cand.inlineData.data, mime: cand.inlineData.mimeType || outMime };
          return null;
        };

        const candidates = response?.candidates || [];
        for (const cand of candidates) {
          const got = tryExtractFromCandidate(cand);
          if (got) {
            outBase64 = got.data;
            outMime = got.mime || outMime;
            break;
          }
        }

        if (outBase64) {
          progressData.push({
            month: milestone.month,
            percentage: milestone.percentage,
            description: `${milestone.percentage}% treatment completion - Month ${milestone.month} progress`,
            originalImage: `data:${outMime};base64,${outBase64}`
          });
        } else {
          console.warn(`No image generated for Month ${milestone.month}`);
        }
      } catch (err) {
        console.error(`Error generating image for Month ${milestone.month}:`, err);
      }
    }

    if (progressData.length === 0) {
      return res.status(500).json({ error: 'Failed to generate any progress images' });
    }

    // Increment usage count for generating progress images (counts as 1 conversion for all milestones)
    await incrementImageConversionUsage(req.user.id);

    return res.json({
      progressData,
      treatmentType: treatmentType || 'SMILE DESIGNING',
      generatedAt: new Date()
    });
  } catch (err) {
    console.error('Generate progress images error:', err);
    return res.status(500).json({ error: 'Failed to generate progress images', details: err.message });
  }
}

async function addTestimonial(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    const { rating, feedback, treatmentType, isPublished } = req.body;
    
    if (!rating || !feedback || !treatmentType) {
      return res.status(400).json({ error: 'rating, feedback, and treatmentType are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const testimonial = {
      rating: parseInt(rating),
      feedback,
      treatmentType,
      isPublished: isPublished || false,
      recordedBy: req.user.id,
    };

    patient.testimonials.push(testimonial);
    await patient.save();

    return res.json(patient);
  } catch (err) {
    console.error('Add testimonial error:', err);
    return res.status(500).json({ error: 'Failed to add testimonial' });
  }
}

async function updateTestimonial(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    const { testimonialId } = req.params;
    const { rating, feedback, treatmentType, isPublished } = req.body;

    const testimonial = patient.testimonials.id(testimonialId);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'rating must be between 1 and 5' });
      }
      testimonial.rating = parseInt(rating);
    }
    if (feedback !== undefined) testimonial.feedback = feedback;
    if (treatmentType !== undefined) testimonial.treatmentType = treatmentType;
    if (isPublished !== undefined) testimonial.isPublished = isPublished;

    await patient.save();

    return res.json(patient);
  } catch (err) {
    console.error('Update testimonial error:', err);
    return res.status(500).json({ error: 'Failed to update testimonial' });
  }
}

async function deleteTestimonial(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    if (!canAccessPatient(req, patient)) return res.status(403).json({ error: 'Forbidden' });

    const { testimonialId } = req.params;
    const testimonial = patient.testimonials.id(testimonialId);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });

    testimonial.deleteOne();
    await patient.save();

    return res.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    console.error('Delete testimonial error:', err);
    return res.status(500).json({ error: 'Failed to delete testimonial' });
  }
}

async function getTestimonials(req, res) {
  try {
    const { published } = req.query;
    const filter = {};

    const role = req.user.role;
    if (role === 'doctor') {
      filter.doctor = req.user.id;
      if (req.user.client) filter.client = req.user.client;
    } else if (role === 'subadmin') {
      filter.client = req.user.client;
    }

    const patients = await Patient.find(filter)
      .select('name testimonials doctor')
      .populate('doctor', 'name email');

    const allTestimonials = [];
    patients.forEach(patient => {
      patient.testimonials.forEach(testimonial => {
        if (published === 'true' && !testimonial.isPublished) return;
        
        allTestimonials.push({
          _id: testimonial._id,
          patientId: patient._id,
          patientName: patient.name,
          rating: testimonial.rating,
          feedback: testimonial.feedback,
          treatmentType: testimonial.treatmentType,
          isPublished: testimonial.isPublished,
          createdAt: testimonial.createdAt,
          doctor: patient.doctor
        });
      });
    });

    allTestimonials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json(allTestimonials);
  } catch (err) {
    console.error('Get testimonials error:', err);
    return res.status(500).json({ error: 'Failed to get testimonials' });
  }
}
  

module.exports = {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  addPatientImages,
  addBeforeAfterImages,
  generateImage,
  deleteSavedImage,
  addMonthlyTreatment,
  updateMonthlyTreatment,
  deleteMonthlyTreatment,
  analyzePhoto,
  generateProgressImages,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonials,
};
