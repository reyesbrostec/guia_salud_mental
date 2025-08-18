// build.js - Generador de blog estático para Guía de Salud Mental
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const MarkdownIt = require('markdown-it');

// Actualiza el submódulo antes de procesar
try {
  console.log('Actualizando submódulo publicaciones...');
  execSync('git submodule update --init --remote', { stdio: 'inherit' });
} catch (err) {
  console.error('Error actualizando submódulo:', err.message);
  process.exit(1);
}

const md = new MarkdownIt({ html: true });
const articlesPath = path.join(__dirname, 'src', 'publicaciones');
const templatePath = path.join(__dirname, 'index.html');
let templateHtml = fs.readFileSync(templatePath, 'utf8');

const blogPosts = [];

function collectMarkdownFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...collectMarkdownFiles(full));
    } else if (e.isFile() && path.extname(e.name).toLowerCase() === '.md') {
      results.push(full);
    }
  }
  return results;
}

function parseFrontmatter(markdown) {
  const fmRegex = /^---\s*([\s\S]*?)\s*---\s*/;
  const res = { meta: {}, body: markdown };
  const m = markdown.match(fmRegex);
  if (!m) return res;
  const fm = m[1];
  res.body = markdown.slice(m[0].length).trim();
  const lines = fm.split(/\r?\n/);
  lines.forEach(line => {
    const kv = line.match(/^\s*([^\s:]+)\s*:\s*(.*)$/);
    if (!kv) return;
    const rawKey = kv[1].trim();
    const key = rawKey.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let value = kv[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key === 'tags') {
      value = value.trim();
      try {
        if (value.startsWith('[')) {
          const normalized = value.replace(/(['"])?([a-zA-Z0-9_\-\s]+)(['"])?/g, (s, q1, inner) => {
            if (/^\s*[\[,\]]\s*$/.test(s)) return s;
            return `"${inner.trim()}"`;
          });
          res.meta.tags = JSON.parse(normalized);
        } else {
          res.meta.tags = value.split(',').map(t => t.replace(/['"]/g, '').trim()).filter(Boolean);
        }
      } catch (e) {
        res.meta.tags = value.replace(/[\[\]']/g, '').split(',').map(t => t.trim()).filter(Boolean);
      }
    } else if (key === 'category' || key === 'categories' || key === 'cat' || key === 'categoria') {
      try {
        if (value.startsWith('[')) {
          const normalized = value.replace(/(['"])?([a-zA-Z0-9_\-\s]+)(['"])?/g, (s, q1, inner) => {
            if (/^\s*[\[,\]]\s*$/.test(s)) return s;
            return `"${inner.trim()}"`;
          });
          const arr = JSON.parse(normalized);
          res.meta.category = Array.isArray(arr) ? (arr[0] || '') : String(arr);
        } else if (value.indexOf(',') !== -1) {
          res.meta.category = value.split(',').map(t => t.replace(/['"]/g, '').trim()).filter(Boolean)[0] || value;
        } else {
          res.meta.category = value.replace(/['"]/g, '').trim();
        }
      } catch (e) {
        res.meta.category = value.replace(/[\[\]']/g, '').split(',').map(t => t.trim()).filter(Boolean)[0] || value;
      }
    } else {
      res.meta[key] = value;
    }
  });
  return res;
}

function extractSummaryFromBody(body) {
  const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';
  for (let line of lines) {
    if (!/^#{1,6}\s+/.test(line)) return line.replace(/[`*_>~\-]{1,}/g, '').slice(0, 200);
  }
  return lines[0].replace(/[`*_>~\-]{1,}/g, '').slice(0, 200);
}

function makeUniqueSlug(base, existing) {
  let slug = base;
  let i = 1;
  while (existing.has(slug)) {
    slug = `${base}-${i++}`;
  }
  existing.add(slug);
  return slug;
}

const existingSlugs = new Set();
const mdFiles = collectMarkdownFiles(articlesPath);
mdFiles.forEach(filePath => {
  try {
    const markdownContent = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFrontmatter(markdownContent);
    const body = parsed.body || '';
    const contentHtml = md.render(body);
    const rel = path.relative(articlesPath, filePath);
    const dirName = path.dirname(rel);
    const folderCategory = (dirName && dirName !== '.' ) ? path.basename(dirName) : '';
    const filenameTitle = path.basename(filePath).replace(/\.md$/i, '').replace(/[-_]+/g, ' ').trim();
    const title = (parsed.meta.title && String(parsed.meta.title).trim()) || filenameTitle || 'Sin título';
    const description = (parsed.meta.description && String(parsed.meta.description).trim()) || extractSummaryFromBody(body);
    const tags = Array.isArray(parsed.meta.tags) ? parsed.meta.tags : (parsed.meta.tags ? String(parsed.meta.tags).split(',').map(t => t.trim()).filter(Boolean) : []);
    const categoryFromFM = parsed.meta.category || parsed.meta.cat || '';
    const category = (categoryFromFM && String(categoryFromFM).trim()) || (tags[0] ? String(tags[0]).trim() : '') || folderCategory || '';
    const summary = description ? (description.length > 140 ? description.slice(0, 140) + '...' : description) : (extractSummaryFromBody(body).slice(0, 140) + '...');
    const baseSlug = filenameTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const slug = makeUniqueSlug((parsed.meta.slug && String(parsed.meta.slug).trim()) || baseSlug || title.toLowerCase().replace(/\s+/g, '-'), existingSlugs);
    blogPosts.push({
      title,
      description,
      tags,
      category: category || '',
      summary,
      slug,
      raw: markdownContent,
      content: contentHtml
    });
  } catch (err) {
    console.error('Error procesando', filePath, err.message);
  }
});

let postsData = JSON.stringify(blogPosts, null, 2);
postsData = postsData.replace(/<\/script>/gi, '<\\/script>');

// Elimina la variable let blogPosts del HTML final, solo deja el HTML renderizado
const varRegex = /let\s+blogPosts\s*=\s*\[.*?\];?/s;
if (varRegex.test(templateHtml)) {
  templateHtml = templateHtml.replace(varRegex, '');
}

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, templateHtml, 'utf8');

// Copiar carpeta assets (si existe) a dist/assets para que scripts/estilos personalizados estén disponibles en producción
const assetsSrc = path.join(__dirname, 'assets');
const assetsDest = path.join(distDir, 'assets');
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDirRecursive(assetsSrc, assetsDest);
if (fs.existsSync(assetsSrc)) console.log('Assets copiados a dist/assets');

console.log('Blog generado con éxito en la carpeta dist!');
console.log(`Archivos encontrados (md): ${mdFiles.length}`);
mdFiles.forEach(f => console.log(`- ${path.relative(articlesPath, f)}`));

console.log(`Posts procesados: ${blogPosts.length}`);
blogPosts.forEach(p => console.log(`- ${p.title} (slug: ${p.slug}) category: ${p.category || 'Sin categoría'}`));


// Copiar inclusion.html a dist/ e inyectar protocolo de accesibilidad
const inclusionSrc = path.join(__dirname, 'src', 'inclusion.html');
const inclusionDest = path.join(distDir, 'inclusion.html');
if (fs.existsSync(inclusionSrc)) {
  let inclusionHtml = fs.readFileSync(inclusionSrc, 'utf8');
  // Extraer bloque de accesibilidad de index.html generado
  const distIndexPath = path.join(distDir, 'index.html');
  let distIndexHtml = fs.existsSync(distIndexPath) ? fs.readFileSync(distIndexPath, 'utf8') : '';
  // Extraer el botón, panel y script de accesibilidad
  const btnRegex = /<button id="accessibility-btn"[\s\S]*?<\/button>/;
  const panelRegex = /<div id="accessibility-panel"[\s\S]*?<\/div>/;
  const scriptRegex = /<script>[\s\S]*?const accBtn = document.getElementById\('accessibility-btn'\);[\s\S]*?disabilityType\.onchange[\s\S]*?};[\s\S]*?<\/script>/;
  const btnMatch = distIndexHtml.match(btnRegex);
  const panelMatch = distIndexHtml.match(panelRegex);
  const scriptMatch = distIndexHtml.match(scriptRegex);
  // Insertar después de <body ...>
  if (btnMatch && panelMatch) {
    inclusionHtml = inclusionHtml.replace(/(<body[^>]*>)/i, `$1
${btnMatch[0]}
${panelMatch[0]}`);
  }
  // Insertar botón flotante después de <main> o al inicio de <main>
  const floatingBtn = `\n<a href=\"index.html\" class=\"fixed bottom-6 right-6 z-50 bg-[#0d9488] hover:bg-[#0d7a6b] text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors\" style=\"box-shadow: 0 2px 8px rgba(0,0,0,0.15);\">\n    Prisma: Salud Mental\n</a>\n`;
  if (/<main[^>]*>/.test(inclusionHtml)) {
    inclusionHtml = inclusionHtml.replace(/(<main[^>]*>)/i, `$1${floatingBtn}`);
  } else {
    // fallback: insert before first <section>
    inclusionHtml = inclusionHtml.replace(/(<section[^>]*>)/i, `${floatingBtn}$1`);
  }
  // Insertar script antes de </body>
  if (scriptMatch) {
    inclusionHtml = inclusionHtml.replace(/<\/body>/i, `${scriptMatch[0]}\n</body>`);
  }

  // Ensure contact form has id contact-form so our script runs
  inclusionHtml = inclusionHtml.replace(/<form class=\"space-y-6\">/i, '<form id="contact-form" class="space-y-6">');

  fs.writeFileSync(inclusionDest, inclusionHtml, 'utf8');
  console.log('inclusion.html copiado a dist/ e integrado protocolo de accesibilidad');
}
