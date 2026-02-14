// build.js — Génère docs/*.html à partir de Chapitres-Volumes/*.md + templates + chapters.json
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = __dirname;
const CHAPTERS_DIR = path.join(ROOT, 'Chapitres-Volumes');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const DOCS_DIR = path.join(ROOT, 'docs');
const PUBLIC_SRC = path.join(ROOT, 'public');
const PUBLIC_DEST = path.join(DOCS_DIR, 'public');

// Charger les métadonnées des chapitres
const chapters = JSON.parse(fs.readFileSync(path.join(ROOT, 'chapters.json'), 'utf8'));

// Charger les templates
const indexTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.html'), 'utf8');
const chapterTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'chapter.html'), 'utf8');

// Créer le répertoire docs s'il n'existe pas
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Copier les assets public/ vers docs/public/
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(PUBLIC_SRC, PUBLIC_DEST);

// Générer un identifiant d'ancre à partir du texte d'un titre h2
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[']/g, '-39-')
    .replace(/[àâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Exclure les volumes (type: "volume") de la génération
const normalChapters = chapters.filter(c => c.type !== 'volume');

// --- Générer la page d'accueil ---

function buildCardHtml(ch) {
  const badgeHtml = ch.badge
    ? `<span class="tag" style="background:${ch.color};">${ch.badge}</span>`
    : '';
  const romanHtml = ch.roman ? `<span class="numeral">${ch.roman}</span>` : '';
  return `      <a href="${ch.slug}.html" class="card" style="--card-accent:${ch.color};">
        <div class="card-badge">
          ${romanHtml}${badgeHtml}
        </div>
        <h3>${ch.title}</h3>
      </a>`;
}

const chaptersGridHtml = normalChapters.map(buildCardHtml).join('\n\n');

const indexHtml = indexTemplate
  .replace('{{CHAPTERS_GRID}}', chaptersGridHtml);

fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), indexHtml, 'utf8');
console.log('index.html généré');

// --- Générer les pages de chapitres ---

const navGroups = [normalChapters];

for (const ch of normalChapters) {
  const mdPath = path.join(CHAPTERS_DIR, ch.source);
  if (!fs.existsSync(mdPath)) {
    console.warn(`ATTENTION: ${ch.source} introuvable, ignoré`);
    continue;
  }

  const md = fs.readFileSync(mdPath, 'utf8');
  const htmlContent = marked.parse(md);

  // Extraire les titres h2 pour la sidebar
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const headings = [];
  // D'abord, ajouter les ancres aux h2 et collecter les titres
  let contentWithAnchors = htmlContent;
  const h2Matches = [...htmlContent.matchAll(/<h2>(.*?)<\/h2>/gi)];
  for (const match of h2Matches) {
    const text = match[1].replace(/<[^>]+>/g, ''); // Retirer le HTML interne
    const id = slugify(text);
    headings.push({ id, text });
    contentWithAnchors = contentWithAnchors.replace(
      match[0],
      `<h2 id="${id}">${match[1]}</h2>`
    );
  }

  // Construire la sidebar
  const sidebarHtml = headings
    .map(h => `        <li><a href="#${h.id}">${h.text}</a></li>`)
    .join('\n');

  // Déterminer la navigation précédent/suivant
  const group = navGroups.find(g => g.includes(ch));
  const idx = group ? group.indexOf(ch) : -1;

  let prevHtml = '';
  let nextHtml = '';

  if (group && idx > 0) {
    const prev = group[idx - 1];
    const label = prev.type === 'volume' ? `Vol. ${prev.roman}` : (prev.roman ? `Ch. ${prev.roman}` : prev.shortTitle);
    prevHtml = `        <a href="${prev.slug}.html" class="nav-link">&larr; ${label}</a>`;
  }

  if (group && idx < group.length - 1) {
    const next = group[idx + 1];
    const label = next.type === 'volume' ? `Vol. ${next.roman}` : (next.roman ? `Ch. ${next.roman}` : next.shortTitle);
    nextHtml = `        <a href="${next.slug}.html" class="nav-link">${label} &rarr;</a>`;
  }

  // Assembler la page
  const pageHtml = chapterTemplate
    .replace('{{TITLE}}', ch.title)
    .replace('{{SIDEBAR}}', sidebarHtml)
    .replace('{{CONTENT}}', contentWithAnchors)
    .replace('{{PREV_LINK}}', prevHtml)
    .replace('{{NEXT_LINK}}', nextHtml);

  fs.writeFileSync(path.join(DOCS_DIR, `${ch.slug}.html`), pageHtml, 'utf8');
  console.log(`${ch.slug}.html généré`);
}

console.log('\nBuild terminé avec succès.');
