const fs = require('fs');
const { once } = require('events');

/**
 * Write a base64 (or data: URI) image to disk without allocating one huge Buffer.
 * Slices the base64 string into small multiples of 4 characters and decodes each slice.
 *
 * @param {string} base64String - Either the raw base64 data or a data: URI like data:image/png;base64,...
 * @param {string} filePath - Absolute path to write the decoded binary to.
 * @param {object} [options] - Optional settings: { chunkChars }
 */
async function writeBase64ToFileChunked(base64String, filePath, options = {}) {
  // strip data:<mime>;base64, prefix if present
  const match = base64String.match(/^data:[^;]+;base64,(.*)$/s);
  let b64 = match ? match[1] : base64String;

  // ensure directory exists
  const dir = require('path').dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const stream = fs.createWriteStream(filePath);
  const chunkChars = options.chunkChars || 4 * 1024; // must be multiple of 4

  let i = 0;
  while (i < b64.length) {
    // ensure slice length is a multiple of 4 (base64 quantum)
    let len = Math.min(chunkChars, b64.length - i);
    const remainder = len % 4;
    if (remainder !== 0 && i + len < b64.length) len -= remainder;
    const slice = b64.slice(i, i + len);
    const buf = Buffer.from(slice, 'base64');
    if (!stream.write(buf)) {
      // backpressure
      await once(stream, 'drain');
    }
    i += len;
  }

  stream.end();
  await once(stream, 'finish');
  return filePath;
}

module.exports = { writeBase64ToFileChunked };
