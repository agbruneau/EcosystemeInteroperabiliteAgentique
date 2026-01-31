const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configuration
const CHAPTERS_FILE = path.join(__dirname, 'chapters.json');
const CHAPTERS_DIR = path.join(__dirname, 'Chapitres');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUTPUT_DIR = path.join(__dirname, 'docs');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Load data
const chapters = JSON.parse(fs.readFileSync(CHAPTERS_FILE, 'utf-8'));
const chapterTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'chapter.html'), 'utf-8');
const indexTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.html'), 'utf-8');


// Configure marked
marked.setOptions({
  gfm: true,
  breaks: false
});

// Clean and create output directory
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Extract h2 headings from HTML for sidebar TOC
function extractHeadings(html) {
  const headings = [];
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '');
    const id = text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    headings.push({ id, text });
  }
  return headings;
}

// Add IDs to h2 elements in HTML
function addHeadingIds(html) {
  return html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, text) => {
    const plainText = text.replace(/<[^>]+>/g, '');
    const id = plainText
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `<h2 id="${id}"${attrs}>${text}</h2>`;
  });
}

// Build sidebar navigation (all chapters)
function buildSidebar(chapters) {
  return chapters.map(ch => {
    return `        <li><a href="${ch.slug}.html">${ch.shortTitle}</a></li>`;
  }).join('\n');
}

// Build chapter card for index page
function buildChapterCard(ch) {
  const badgeHtml = ch.badge
    ? `\n          <span style="background:${ch.color};color:white;padding:0.2rem 0.6rem;border-radius:12px;font-size:0.75rem;font-weight:600;">${ch.badge}</span>`
    : '';

  return `      <a href="${ch.slug}.html" class="card" style="border-left: 4px solid ${ch.color};">
        <div class="card-header">
          <span class="roman">${ch.roman}</span>${badgeHtml}
        </div>
        <h3>${ch.title}</h3>
      </a>`;
}

// Separate chapters and volumes
const chaptersList = chapters.filter(ch => ch.type !== 'volume');
const volumesList = chapters.filter(ch => ch.type === 'volume');

// Build sidebar navigation with both sections
function buildFullSidebar(chaptersList, volumesList) {
  const chapterLinks = chaptersList.map(ch =>
    `        <li><a href="${ch.slug}.html">${ch.shortTitle}</a></li>`
  ).join('\n');
  const volumeLinks = volumesList.map(ch =>
    `        <li><a href="${ch.slug}.html">${ch.shortTitle}</a></li>`
  ).join('\n');
  return chapterLinks +
    '\n      </ul>\n      <h3 style="margin-top: 1.5rem;">Volumes</h3>\n      <ul>\n' +
    volumeLinks;
}

// Generate chapter and volume pages
console.log('Building chapter pages...');
const sidebar = buildFullSidebar(chaptersList, volumesList);

chapters.forEach((ch) => {
  const mdPath = path.join(CHAPTERS_DIR, ch.source);

  if (!fs.existsSync(mdPath)) {
    console.warn(`  WARNING: ${ch.source} not found, skipping.`);
    return;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf-8');

  // Remove the first h1 from markdown (it will be the title we already have)
  const mdWithoutTitle = mdContent.replace(/^#\s+.*$/m, '').trim();

  let htmlContent = marked.parse(mdWithoutTitle);
  htmlContent = addHeadingIds(htmlContent);

  // Build in-chapter TOC from headings
  const headings = extractHeadings(htmlContent);
  const tocHtml = headings.map(h =>
    `        <li><a href="#${h.id}">${h.text}</a></li>`
  ).join('\n');

  // Build prev/next navigation within the same group (chapters or volumes)
  const group = ch.type === 'volume' ? volumesList : chaptersList;
  const groupIndex = group.indexOf(ch);
  const prev = groupIndex > 0 ? group[groupIndex - 1] : null;
  const next = groupIndex < group.length - 1 ? group[groupIndex + 1] : null;

  const navPrefix = ch.type === 'volume' ? 'Vol.' : 'Ch.';

  const prevLink = prev
    ? `        <a href="${prev.slug}.html" class="nav-link">&larr; ${navPrefix} ${prev.roman || 'Annexes'}</a>`
    : '        <span></span>';
  const nextLink = next
    ? `        <a href="${next.slug}.html" class="nav-link">${navPrefix} ${next.roman || 'Annexes'} &rarr;</a>`
    : '        <span></span>';

  // Build chapter-specific sidebar: chapter list + volumes + in-page TOC
  const chapterSidebar = sidebar + '\n      </ul>\n      <h3 style="margin-top: 1.5rem;">Dans ce chapitre</h3>\n      <ul>\n' + tocHtml;

  // Assemble page
  const titleHtml = `<h1>${ch.title}</h1>`;
  const fullContent = titleHtml + '\n' + htmlContent;

  let page = chapterTemplate
    .replace('{{TITLE}}', ch.title)
    .replace('{{SIDEBAR}}', chapterSidebar)
    .replace('{{CONTENT}}', fullContent)
    .replace('{{PREV_LINK}}', prevLink)
    .replace('{{NEXT_LINK}}', nextLink);

  const outPath = path.join(OUTPUT_DIR, `${ch.slug}.html`);
  fs.writeFileSync(outPath, page, 'utf-8');
  console.log(`  ${ch.slug}.html`);
});

// Generate index page
console.log('Building index page...');
const chapterEntries = chapters.filter(ch => ch.type !== 'volume');
const volumeEntries = chapters.filter(ch => ch.type === 'volume');
const chaptersGrid = chapterEntries.map(buildChapterCard).join('\n\n');
const volumesGrid = volumeEntries.map(buildChapterCard).join('\n\n');
const indexPage = indexTemplate
  .replace('{{CHAPTERS_GRID}}', chaptersGrid)
  .replace('{{VOLUMES_GRID}}', volumesGrid);
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexPage, 'utf-8');
console.log('  index.html');

// Copy public assets
console.log('Copying public assets...');
const publicOut = path.join(OUTPUT_DIR, 'public');
fs.mkdirSync(publicOut, { recursive: true });

function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  public/${entry.name}`);
    }
  }
}

if (fs.existsSync(PUBLIC_DIR)) {
  copyDir(PUBLIC_DIR, publicOut);
} else {
  console.log('  (no public directory found, skipping asset copy)');
}

console.log(`\nBuild complete! Output in: ${OUTPUT_DIR}`);
console.log(`Total pages: ${chapters.length + 1} (${chapters.length} chapters + index)`);
