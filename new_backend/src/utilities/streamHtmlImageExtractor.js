const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Parser } = require('htmlparser2');
const { writeBase64ToFileChunked } = require('./base64ChunkWriter');

/**
 * Stream an HTML file, extract <img src="data:..."> images to uploadsImagesDir
 * using chunked writes, and write a placeholder HTML to outputPath where each
 * extracted image is replaced by `[IMAGE N]` (1-based index). Returns an array
 * of filenames in the same order as placeholders.
 *
 * This function is stream-based and avoids loading the entire HTML into memory.
 */
async function streamExtractImagesToPlaceholders(inputPath, outputPath, uploadsImagesDir, opts = {}) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(inputPath, { encoding: 'utf8' });
    const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

    let imageIndex = 0;
    const imageFilenames = [];
    const writePromises = [];

    const voidElements = new Set([
      'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'
    ]);

    const parser = new Parser({
      onopentag(name, attribs) {
        if (name === 'img') {
          const src = (attribs.src || '').trim();
          imageIndex += 1;
          if (src.toLowerCase().startsWith('data:')) {
            // write image to disk
            const extMatch = src.match(/^data:image\/([^;]+);/i);
            const ext = extMatch ? extMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, '') : 'png';
            const filename = `${path.basename(inputPath, path.extname(inputPath))}-${Date.now()}-${imageIndex}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
            const outFile = path.join(uploadsImagesDir, filename);
            imageFilenames.push(filename);
            // schedule write (don't await here)
            const p = writeBase64ToFileChunked(src, outFile).catch((e) => {
              // log but continue
              console.error('Failed to write extracted image', e && e.message);
            });
            writePromises.push(p);
            // write placeholder instead of img tag
            writeStream.write(`[IMAGE ${imageIndex}]`);
          } else {
            // for non-data images, try to preserve tag but write as-is
            let attrText = '';
            for (const k of Object.keys(attribs)) {
              const v = attribs[k];
              attrText += ` ${k}="${v.replace(/"/g, '&quot;')}"`;
            }
            // write the img tag (self-closing to be safe)
            writeStream.write(`<img${attrText}${voidElements.has(name) ? ' />' : '>'}`);
          }
        } else {
          // write opening tag and its attributes
          let attrText = '';
          for (const k of Object.keys(attribs)) {
            const v = attribs[k];
            attrText += ` ${k}="${v.replace(/"/g, '&quot;')}"`;
          }
          writeStream.write(`<${name}${attrText}${voidElements.has(name) ? ' />' : '>'}`);
        }
      },
      ontext(text) {
        writeStream.write(text);
      },
      oncomment(data) {
        writeStream.write(`<!--${data}-->`);
      },
      onclosetag(tagname) {
        if (!voidElements.has(tagname)) writeStream.write(`</${tagname}>`);
      }
    }, { decodeEntities: true });

    readStream.on('data', (chunk) => {
      try {
        parser.write(chunk);
      } catch (e) {
        readStream.destroy(e);
      }
    });

    readStream.on('end', async () => {
      try {
        parser.end();
        // wait for all image writes to finish
        await Promise.all(writePromises);
        writeStream.end();
        writeStream.on('finish', () => resolve(imageFilenames));
      } catch (e) {
        reject(e);
      }
    });

    readStream.on('error', (err) => reject(err));
    writeStream.on('error', (err) => reject(err));
  });
}

module.exports = { streamExtractImagesToPlaceholders };
