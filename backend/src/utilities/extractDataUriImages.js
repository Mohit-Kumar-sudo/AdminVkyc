const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { writeBase64ToFileChunked } = require('./base64ChunkWriter');

/**
 * Find <img src="data:..."> occurrences in html, write image files to outputDir,
 * and replace the src with the written filename (basename). Returns modified HTML.
 *
 * This intentionally writes files into outputDir so that the HTML file and images
 * live together. Filenames are prefixed by optional prefix to reduce collisions.
 */
async function extractDataUriImages(htmlString, outputDir, opts = {}) {
  if (!htmlString) return htmlString;
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const prefix = opts.prefix || String(Date.now());
  // matches src="data:..." or src='data:...'
  const imgDataRegex = /<img\b([^>]*?)\bsrc\s*=\s*(["'])(data:image\/[a-zA-Z0-9.+-]+;base64,[^"']+)\2([^>]*)>/gi;

  const tasks = [];
  const replacements = [];

  let match;
  while ((match = imgDataRegex.exec(htmlString)) !== null) {
    const fullMatch = match[0];
    const beforeAttr = match[1] || '';
    const quote = match[2];
    const dataUri = match[3];
    const afterAttr = match[4] || '';

    // determine extension
    const extMatch = dataUri.match(/^data:image\/([^;]+);/i);
    const ext = extMatch ? extMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, '') : 'png';

    const filename = `${prefix}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const filePath = path.join(outputDir, filename);

    // schedule write
    const t = writeBase64ToFileChunked(dataUri, filePath).then(() => ({ fullMatch, filename }));
    tasks.push(t);
  }

  if (tasks.length === 0) return htmlString;

  const done = await Promise.all(tasks);

  // perform replacements: replace the entire <img ...> tag with same tag but src="filename"
  let newHtml = htmlString;
  for (const r of done) {
    // replace only first occurrence of that tag text
    newHtml = newHtml.replace(r.fullMatch, (orig) => {
      // keep other attributes but replace src attr value with the basename
      const replaced = orig.replace(/src\s*=\s*(["'])(data:[^"']+)\1/i, `src="${r.filename}"`);
      return replaced;
    });
  }

  return newHtml;
}

module.exports = { extractDataUriImages };
