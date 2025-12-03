const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

console.log('GENAI_API_KEY present in server?', !!process.env.GENAI_API_KEY);

// Replace your existing route with this implementation
app.post('/api/generate-after-photo', async (req, res) => {
  const { imageData } = req.body || {};
  if (!imageData) {
    return res.status(400).json({ error: 'Missing imageData in request body' });
  }

  const apiKey = process.env.GENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      generatedImage: imageData,
      warning: 'GENAI_API_KEY not set on backend. Returned original image.',
    });
  }

  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    // Normalize input: accept "data:image/..;base64,..." or plain base64
    let base64 = imageData;
    let mimeType = 'image/jpeg';
    const match = /^data:(.+);base64,(.*)$/i.exec(imageData);
    if (match) {
      mimeType = match[1];
      base64 = match[2];
    } 

    const promptText = [
      "You are a professional dental image editor. Using the provided photo of a patient's smile,",
      "generate a realistic 'after' cosmetic result with the following constraints:",
      // "1) Slightly whiten and brighten the visible teeth (natural whitening, not chalky).",
      "2) Subtly align and even out minor crowding / small gaps — do not change jaw or face shape.",
      "3) Close small diastemas (tiny gaps) and even the incisal edges where appropriate.",
      "4) Preserve patient identity: do NOT alter facial features, skin tone, or change hair.",
      "5) Do NOT add braces, jewelry, or unrealistic cosmetic effects. Keep lighting & shadows natural.",
      "Return a single photorealistic edited image as the result."
    ].join(' ');

    // Build request contents (text prompt + inline image data)
    const contents = [
      { text: promptText },
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ];

    // Call the image model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      // Optional parameters: temperature, topP, etc. Uncomment if you want to tune.
      // temperature: 0.0,
    });

    // Robustly extract the first image from response:
    // Primary expected path: response.candidates[].content.parts[].inlineData.data
    let outBase64 = null;
    let outMime = mimeType;

    // Helper to scan possible shapes
    const tryExtractFromCandidate = (cand) => {
      if (!cand) return null;
      // common shape: cand.content.parts array
      const parts = cand.content?.parts || cand?.content || [];
      if (Array.isArray(parts)) {
        for (const part of parts) {
          if (part?.inlineData?.data) {
            return { data: part.inlineData.data, mime: part.inlineData.mimeType || outMime };
          }
          // sometimes `data` might live directly under part.data (rare)
          if (part?.data && typeof part.data === 'string' && part.data.startsWith('/9')) {
            return { data: part.data, mime: outMime };
          }
          // some shapes: part.image or part.base64
          if (part?.image && typeof part.image === 'string' && part.image.startsWith('data:')) {
            const m = /^data:(.+);base64,(.*)$/i.exec(part.image);
            if (m) return { data: m[2], mime: m[1] };
          }
        }
      } else if (typeof parts === 'string' && parts.startsWith('data:')) {
        const m = /^data:(.+);base64,(.*)$/i.exec(parts);
        if (m) return { data: m[2], mime: m[1] };
      }
      // fallback: cand.image / cand.data
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

    // Extra fallback: response.output_image or response.outputs (older shapes)
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
            // if it's raw base64 without data: prefix
            outBase64 = out.data;
            break;
          }
        }
      }
    }

    if (!outBase64) {
      // Nothing usable found — return raw response so you can debug
      console.warn('[image-backend] No image bytes found in GenAI response:', JSON.stringify(response, null, 2));
      return res.status(502).json({
        generatedImage: imageData,
        warning: 'GenAI returned no image bytes. Check server logs for full response.',
        rawResponse: response,
      });
    }

    // Construct data URL and return
    const generatedImage = `data:${outMime};base64,${outBase64}`;
    return res.json({ generatedImage });
  } catch (err) {
    console.error('[image-backend] GenAI SDK call failed:', err && err.stack ? err.stack : err);
    return res.status(500).json({
      generatedImage: imageData,
      warning: 'GenAI SDK call failed on backend. See logs.',
      sdkError: err?.message || String(err),
    });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

