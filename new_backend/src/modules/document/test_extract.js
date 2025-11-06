const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

function cleanHtml(html) {
  html = html.replace(/<a\b[^>]*\bname=["'][^"']*["'][^>]*>\s*<\/a>/gi, "");
  html = html.replace(/<\/?font\b[^>]*>/gi, "");
  html = html.replace(/<p>\s*<\/p>/gi, "");
  html = html.replace(/[\n\t]+/g, " ");
  html = html.replace(/\s{2,}/g, " ");
  return html.trim();
}

function extractSectionsFromHtml(html, sectionName) {
  html = cleanHtml(html);
  console.log("html",html)
  let imgCounter = 1;
  html = html.replace(/<img[^>]*>/gi, () => `[IMAGE ${imgCounter++}]`);
  const $ = cheerio.load(html);

  const tocMap = {};
  $("a[href^=\"#_Toc\"]").each((i, a) => {
    const href = $(a).attr('href') || '';
    const key = href.replace(/^#/, '');
    const text = $(a).text().trim().replace(/\s+/g, ' ');
    const m = text.match(/^(\d+(?:\.\d+)*)(?:[\.\s:-]+)?(.*?)(?:\s+\d+)?$/);
    if (m) {
      const number = m[1];
      const titleRaw = (m[2] || '').trim().replace(/\s+\d+$/, '').trim();
      if (titleRaw && /[A-Za-z]/.test(titleRaw)) {
        tocMap[key] = { number, title: titleRaw };
      }
    }
  });

  const elements = $("p, h1, h2, h3, h4, h5, h6, li").toArray();
  const root = [];
  const stack = [];
  // Find where the Table of Contents ends so we don't treat TOC entries as headings.
  let tocEndIndex = -1;
  elements.forEach((el, idx) => {
    const $el = $(el);
    if ($el.find("a[href^=\"#_Toc\"]").length) tocEndIndex = idx;
  });
  const startIndex = Math.min(elements.length, tocEndIndex + 1);

  elements.slice(startIndex).forEach((el) => {
    const $el = $(el);
    // Skip TOC entries (they have href anchors)
    if ($el.find('a[href]').length) return;
    let text = $el.text().trim().replace(/[\n\t]+/g, ' ').replace(/\s+/g, ' ');

    let foundNumber = null;
    let foundTitle = null;

    const anchors = $el.find('a[id]').toArray();
    if (anchors.length) {
      for (const a of anchors) {
        const idAttr = $(a).attr('id');
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
        const candidateTitle = (m[2] || '').trim().replace(/\s+\d+$/, '').trim() || null;
        if (candidateTitle && /[A-Za-z]/.test(candidateTitle)) {
          foundNumber = candidateNumber;
          foundTitle = candidateTitle;
        }
      }
    }

    if (foundNumber) {
      const depth = foundNumber.split('.').length;
      const node = { number: foundNumber, title: foundTitle || foundNumber, content: '', subSections: [], depth };
      while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
      if (stack.length === 0) root.push(node); else stack[stack.length - 1].subSections.push(node);
      stack.push(node);
    } else {
      if (stack.length) {
        const curr = stack[stack.length - 1];
        curr.content += (curr.content ? '\n' : '') + $.html($el);
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

  // Helpful debug: if special arg requested, return the parsed section tree
  if (sectionName === '__debug') {
    return { sectionTree };
  }

  if (!sectionName) return { html };

  function findSection(nodes, key) {
    const lower = (key || '').toString().toLowerCase();
    for (const n of nodes) {
      if (n.number === key || (n.number && n.number.toString() === key)) return n;
      if ((n.title || '').toLowerCase().includes(lower) || (n.title || '').toLowerCase() === lower) return n;
      const f = findSection(n.subSections || [], key);
      if (f) return f;
    }
    return null;
  }

  const target = findSection(sectionTree, sectionName);
  return { section: target };
}

// --- Runner ---
const filePath = path.join(__dirname, 'Untitled-1.html');
const raw = fs.readFileSync(filePath, 'utf8');
let html = raw;
const rawTrim = raw.trim();
if (rawTrim.startsWith('"html":') || rawTrim.startsWith('{"html"')) {
  try {
    const obj = JSON.parse(rawTrim.startsWith('{') ? rawTrim : `{${rawTrim}}`);
    if (obj && obj.html) html = obj.html;
  } catch (e) {
    const idx = raw.indexOf('<');
    html = idx >= 0 ? raw.slice(idx).replace(/\\"/g, '"').replace(/\\n/g, '\n') : raw;
  }
} else {
  // If file already contains raw HTML, keep it
  html = raw;
}

const arg = process.argv[2];
const res = extractSectionsFromHtml(html, arg);
console.log(JSON.stringify(res, null, 2));
