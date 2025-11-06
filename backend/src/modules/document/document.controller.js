const path = require("path");
const fs = require("fs");
const fsPromises = fs.promises;
const cheerio = require("cheerio");
const mammoth = require("mammoth");
const Document = require("./document.model");
const { uploadsHtml, uploadsImages } = require("../../config/paths");
const { writeBase64ToFileChunked } = require('../../utilities/base64ChunkWriter');
const crypto = require('crypto');
const { streamExtractImagesToPlaceholders } = require('../../utilities/streamHtmlImageExtractor');
const tocModel = require('../table_of_contents/toc.model');
const { run } = require("mammoth/lib/transforms");


async function uploadDocx(req, res) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "❌ No file uploaded" });

    // Ensure uploads/html directory exists
    if (!fs.existsSync(uploadsHtml)) fs.mkdirSync(uploadsHtml, { recursive: true });

    // Convert DOCX → HTML using Mammoth (no LibreOffice)
    const result = await mammoth.convertToHtml({ path: file.path });
    const mammothHtml = result.value; // Clean structured HTML — no images extracted

  // Save the converted HTML file (async) without extracting images.
  // Image extraction will be done lazily when `getSection` is called.
  const baseName = path.basename(file.path, path.extname(file.path));
  const outputFile = path.join(uploadsHtml, baseName + ".html");
  await fsPromises.writeFile(outputFile, mammothHtml, "utf8");

    // Save document info in MongoDB
    const doc = new Document({
      fileName: file.originalname,
      filePath: file.path,
      htmlPath: outputFile,
      reportTitle: file.originalname,
      sections: [],
    });

    const savedDoc = await doc.save();

    // Send response
    res.json({
      message: "✅ File uploaded successfully (images ignored)",
      documentId: savedDoc._id,
      fileName: savedDoc.fileName,
      htmlPath: savedDoc.htmlPath,
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "❌ Unexpected error", error: err.message });
  }
}

// 🔹 Get Section (structured JSON)
async function getSection(req, res) {
  try {
    // Get path params (like /document/:id/:sectionName)
    const { id, sectionName, reportId } = req.params;

    console.log("📄 Document ID:", id);
    console.log("📑 Section name:", sectionName);
    console.log("🧾 Report ID (query param):", reportId);

    // Base URL used when constructing absolute image URLs.
    // Priority:
    // 1. Explicit env var BACKEND_BASE_URL (recommended in production)
    // 2. X-Forwarded-Proto + X-Forwarded-Host (set by proxies)
    // 3. Fallback to req.protocol + req.get('host')
    let baseUrl = process.env.BACKEND_BASE_URL || '';
    if (!baseUrl) {
      const forwardedProto = req.get('x-forwarded-proto') || req.protocol;
      const forwardedHost = req.get('x-forwarded-host') || req.get('x-forwarded-server') || req.get('host');
      baseUrl = `${forwardedProto}://${forwardedHost}`;
    }
    // normalize: remove trailing slash if present
    baseUrl = baseUrl.replace(/\/+$/, '');

    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ message: "❌ Document not found" });
    if (!doc.htmlPath || !fs.existsSync(doc.htmlPath))
      return res.status(404).json({ message: "❌ HTML version not found" });

    // Basic protection: avoid loading extremely large files into memory
    const stat = await fsPromises.stat(doc.htmlPath);
    const MAX_HTML_BYTES = 200 * 1024 * 1024; // 200 MB guard
    if (stat.size > MAX_HTML_BYTES) {
      return res.status(413).json({ message: '❌ HTML file too large to process on this endpoint. Use offline processing or increase server memory.' });
    }

    let html = await fsPromises.readFile(doc.htmlPath, "utf-8");

    const rawTrim = html.trim();
    if (rawTrim.startsWith('"html":') || rawTrim.startsWith('{"html"')) {
      try {
        const obj = JSON.parse(rawTrim.startsWith('{') ? rawTrim : `{${rawTrim}}`);
        if (obj && obj.html) html = obj.html;
      } catch (e) {
        const first = rawTrim.indexOf('<');
        if (first >= 0)
          html = rawTrim.slice(first)
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');
      }
    }

    html = cleanHtml(html);

    // Stream-extract images to avoid holding base64 data in memory.
    if (!fs.existsSync(uploadsImages)) fs.mkdirSync(uploadsImages, { recursive: true });
    const tmpOutput = path.join(path.dirname(doc.htmlPath), `${path.basename(doc.htmlPath, path.extname(doc.htmlPath))}.placeholders.html`);
    let imageFilenames = [];
    try {
      imageFilenames = await streamExtractImagesToPlaceholders(doc.htmlPath, tmpOutput, uploadsImages);
      // Read the placeholder HTML back (much smaller because images removed)
      html = await fsPromises.readFile(tmpOutput, 'utf8');
    } catch (e) {
      console.error('Error during streaming image extraction:', e && e.message);
      // fallback to original html if streaming extraction fails
      imageFilenames = [];
    }
    // -----------------------------

    const $ = cheerio.load(html);
    const tocMap = {};

    $("a[href^=\"#_Toc\"]").each((i, a) => {
      const href = $(a).attr("href") || "";
      const key = href.replace(/^#/, "");
      const text = $(a).text().trim().replace(/\s+/g, " ");
      const m = text.match(/^(\d+(?:\.\d+)*)(?:[\.\s:-]+)?(.*?)(?:\s+\d+)?$/);
      if (m) {
        const number = m[1];
        const titleRaw = (m[2] || "").trim().replace(/\s+\d+$/, "").trim();
        if (titleRaw && /[A-Za-z]/.test(titleRaw)) {
          tocMap[key] = { number, title: titleRaw };
        }
      }
    });

    const elements = $("p, h1, h2, h3, h4, h5, h6, li").toArray();
    let tocEndIndex = -1;
    elements.forEach((el, idx) => {
      if ($(el).find("a[href^=\"#_Toc\"]").length) tocEndIndex = idx;
    });

    const startIndex = Math.min(elements.length, tocEndIndex + 1);
    const root = [];
    const stack = [];

    function pushNode(node) {
      if (stack.length === 0) root.push(node);
      else stack[stack.length - 1].subSections.push(node);
      stack.push(node);
    }

    elements.slice(startIndex).forEach((el) => {
      const $el = $(el);
      if ($el.find("a[href]").length) return;
      let text = $el.text().trim().replace(/[\n\t]+/g, " ").replace(/\s+/g, " ");

      let foundNumber = null;
      let foundTitle = null;

      const anchors = $el.find("a[id]").toArray();
      if (anchors.length) {
        for (const a of anchors) {
          const idAttr = $(a).attr("id");
          if (idAttr && tocMap[idAttr]) {
            foundNumber = tocMap[idAttr].number;
            foundTitle = tocMap[idAttr].title || null;
            break;
          }
        }
      }

      if (!foundNumber) {
        const m = text.match(/^(\d+(?:\.\d+)*)(?:[\.\s:-]+)?(.*?)(?:\s+\d+)?$/);
        if (m) {
          const candidateNumber = m[1];
          const candidateTitle = (m[2] || "").trim().replace(/\s+\d+$/, '').trim() || null;
          if (candidateTitle && /[A-Za-z]/.test(candidateTitle)) {
            foundNumber = candidateNumber;
            foundTitle = candidateTitle;
          }
        }
      }

      if (foundNumber) {
        const depth = foundNumber.split(".").length;
        const node = { number: foundNumber, title: foundTitle || foundNumber, content: "", subSections: [], depth };
        while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
        if (stack.length === 0) root.push(node);
        else stack[stack.length - 1].subSections.push(node);
        stack.push(node);
      } else {
        if (stack.length) {
          const curr = stack[stack.length - 1];
          curr.content += (curr.content ? "\n" : "") + $.html($el);
        }
      }
    });

    function stripDepth(nodes) {
      return nodes.map((n) => {
        const { depth, ...rest } = n;
        return { ...rest, subSections: stripDepth(n.subSections || []) };
      });
    }

    const sectionTree = stripDepth(root);

    if (sectionName) {
      function findSection(nodes, key) {
        const lower = (key || "").toString().toLowerCase();
        for (const n of nodes) {
          if (n.number === key || (n.number && n.number.toString() === key)) return n;
          if ((n.title || "").toLowerCase().includes(lower) || (n.title || "").toLowerCase() === lower) return n;
          const f = findSection(n.subSections || [], key);
          if (f) return f;
        }
        return null;
      }

      const target = findSection(sectionTree, sectionName);
      if (!target) return res.status(404).json({ message: "❌ Section not found" });

      // Replace [IMAGE N] placeholders inside the target section (and its
      // subsections) with concrete <img> tags that point to the extracted
      // image files so the client/editor can render them. If a filename is
      // missing for an index, keep the placeholder.
      function replacePlaceholdersInNode(node) {
        if (!node || !node.content) return;
        node.content = node.content.replace(/\[IMAGE\s*(\d+)\]/gi, (m, g1) => {
          const idx = parseInt(g1, 10) - 1;
          const fname = Array.isArray(imageFilenames) && imageFilenames[idx] ? imageFilenames[idx] : null;
          if (!fname) return m; // leave placeholder if not available
          // Build absolute URL using configured baseUrl to ensure client gets
          // a full path (including domain and port) rather than a bare path.
          const url = `${baseUrl}/api/v1/documents/${doc._id}/images/${encodeURIComponent(fname)}`;
          return `<img src="${url}" alt="Image ${idx + 1}" />`;
        });
        if (Array.isArray(node.subSections)) {
          for (const s of node.subSections) replacePlaceholdersInNode(s);
        }
      }

      replacePlaceholdersInNode(target);

      // const report = await reportModel.Reports.findById(reportId);

      // --- Convert the `target` section tree into flat TOC entries ---
      function parentPidFrom(sectionId) {
        if (!sectionId) return null;
        const parts = sectionId.split('.');
        if (parts.length === 1) return String(parts[0]);
        parts.pop();
        return parts.join('.');
      }

      function bumpLeading(sectionId, offset) {
        if (!sectionId) return sectionId;
        const parts = sectionId.toString().split('.');
        const first = parseInt(parts[0], 10);
        if (Number.isNaN(first)) return sectionId;
        parts[0] = String(first + offset);
        return parts.join('.');
      }

      function splitContentHtmlIntoParts(html) {
        const parts = [];
        if (!html) return parts;
        const pRegex = /<p[\s\S]*?<\/p>/gi;
        let match;
        let lastIndex = 0;
        while ((match = pRegex.exec(html)) !== null) {
          const seg = match[0];
          const between = html.slice(lastIndex, match.index).trim();
          if (between) {
            const imageMatches = [...between.matchAll(/\[IMAGE\s*(\d+)\]/gi)];
            if (imageMatches.length) {
              for (const im of imageMatches) parts.push({ type: 'IMAGE', imageIndex: parseInt(im[1], 10) });
            } else {
              parts.push({ type: 'TEXT', html: between });
            }
          }
          if (/\[IMAGE\s*\d+\]/i.test(seg)) {
            const im = seg.match(/\[IMAGE\s*(\d+)\]/i);
            parts.push({ type: 'IMAGE', imageIndex: parseInt(im[1], 10) });
          } else {
            parts.push({ type: 'TEXT', html: seg });
          }
          lastIndex = pRegex.lastIndex;
        }
        const tail = html.slice(lastIndex).trim();
        if (tail) {
          const imageMatches = [...tail.matchAll(/\[IMAGE\s*(\d+)\]/gi)];
          if (imageMatches.length) {
            for (const im of imageMatches) parts.push({ type: 'IMAGE', imageIndex: parseInt(im[1], 10) });
          } else {
            parts.push({ type: 'TEXT', html: tail });
          }
        }
        return parts;
      }

      function buildTocEntriesFromSection(section, tocArray, OFFSET = 1) {
        const rawId = String(section.number).trim();
        const sectionId = bumpLeading(rawId, OFFSET);
        const sectionPidRaw = parentPidFrom(rawId);
        const bumpedPid = sectionPidRaw ? bumpLeading(sectionPidRaw, OFFSET) : parentPidFrom(sectionId);

        const entry = {
          status: 'NOT STARTED',
          section_id: sectionId,
          section_name: section.title ? section.title.trim() : section.title,
          main_section_id: parseInt(sectionId.split('.')[0], 10) || 0,
          section_pid: bumpedPid,
          content: [],
          meta_info: section.meta_info || null
        };

        const parts = splitContentHtmlIntoParts(section.content || '');
        let order = 1;
        for (const p of parts) {
          if (p.type === 'TEXT') {
            entry.content.push({ order_id: order++, type: 'TEXT', data: { content: p.html } });
          } else if (p.type === 'IMAGE') {
            const idx = parseInt(p.imageIndex || 0, 10) - 1;
            const srcFile = Array.isArray(imageFilenames) && imageFilenames[idx] ? imageFilenames[idx] : '';
            entry.content.push({ order_id: order++, type: 'IMAGE', data: { title: '', source: srcFile, type: String(p.imageIndex || '') } });
          } else {
            entry.content.push({ order_id: order++, type: 'TEXT', data: { content: p.html || '' } });
          }
        }

        tocArray.push(entry);

        if (Array.isArray(section.subSections)) {
          for (const sub of section.subSections) {
            buildTocEntriesFromSection(sub, tocArray, OFFSET);
          }
        }
      }

      // build toc array from target node
      const tocArray = [];
      buildTocEntriesFromSection(target, tocArray, 1); // default OFFSET +1

      // Persist using existing toc model helper (addContent will update or push)
      let updateRes = {};
      try {
        updateRes = await tocModel.addContent(tocArray, reportId, {});
      } catch (e) {
        console.error('Error saving TOC entries:', e);
        return res.status(500).json({ message: '❌ Error saving TOC entries', error: e.message });
      }

      return res.json({ message: '✅ Section converted and saved to report.toc', reportId, saved: updateRes, section: target });
    }

    return res.json({ reportId, section: sectionTree });
  } catch (err) {
    console.error("❌ Error fetching section:", err);
    return res.status(500).json({ message: "❌ Unexpected error", error: err.message });
  }
}



// 🔹 Clean unwanted HTML tags
function cleanHtml(html) {
  // Remove anchor tags with only name attribute and no content
  html = html.replace(/<a\b[^>]*\bname=["'][^"']*["'][^>]*>\s*<\/a>/gi, "");
  // Remove all <font> tags
  html = html.replace(/<\/?font\b[^>]*>/gi, "");
  // Remove empty <p> tags (with only whitespace)
  html = html.replace(/<p>\s*<\/p>/gi, "");
  // Remove newlines and tabs
  html = html.replace(/[\n\t]+/g, " ");
  // Optionally, trim extra spaces
  html = html.replace(/\s{2,}/g, " ");
  return html.trim();
}

// Serve images from the document uploads directory using streaming (no in-memory base64)
async function serveImage(req, res) {
  try {
    const { id, imageName } = req.params;
    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ message: '❌ Document not found' });

    const safeImageName = path.basename(decodeURIComponent(imageName));
    const imagePath = path.join(uploadsImages, safeImageName);

    // Prevent path traversal
    if (!imagePath.startsWith(uploadsImages)) {
      return res.status(400).json({ message: 'Invalid image path' });
    }

    // Stream the file using res.sendFile (efficient) or createReadStream
    if (!fs.existsSync(imagePath)) return res.status(404).json({ message: 'Image not found' });

    return res.sendFile(imagePath);
  } catch (err) {
    console.error('Error serving image:', err);
    return res.status(500).json({ message: '❌ Error serving image', error: err.message });
  }
}


module.exports = { uploadDocx, getSection, serveImage };
