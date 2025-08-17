const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const { execSync } = require('child_process');

const md = new MarkdownIt({ html: true });

const articlesPath = path.join(__dirname, 'src', 'publicaciones');
const templatePath = path.join(__dirname, 'index.html');
let templateHtml = fs.readFileSync(templatePath, 'utf8');

const blogPosts = [];

if (!fs.existsSync(articlesPath)) {
  console.error(`ERROR: La carpeta de publicaciones no existe en ${articlesPath}`);
  process.exit(1);
}

// Actualizar submódulo antes de procesar publicaciones
try {
  console.log('Actualizando submódulo publicaciones...');
  execSync('git submodule update --init --remote', { stdio: 'inherit' });
} catch (err) {
  console.error('Error actualizando submódulo:', err.message);
  process.exit(1);
}

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
    const key = rawKey.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // normalizar acentos
    let value = kv[2].trim();

    // eliminar comillas envolventes
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

// Recoger todos los archivos .md (recursivo)
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
    // categoría: frontmatter -> primer tag -> carpeta -> vacío
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
// escapar cierre de script para insertar de forma segura en template HTML
postsData = postsData.replace(/<\/script>/gi, '<\\/script>');

// Intentar reemplazar una asignación previa de blogPosts (vacía o poblada)
const varRegex = /let\s+blogPosts\s*=\s*\[.*?\];/s;
if (varRegex.test(templateHtml)) {
  templateHtml = templateHtml.replace(varRegex, `let blogPosts = ${postsData};`);
} else if (templateHtml.includes('// __BLOG_POSTS_DATA__')) {
  templateHtml = templateHtml.replace('// __BLOG_POSTS_DATA__', `let blogPosts = ${postsData};`);
} else {
  const scriptInsertRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/i;
  const m = templateHtml.match(scriptInsertRegex);
  if (m) {
    const before = templateHtml.slice(0, m.index + m[0].indexOf(m[2]));
    const after = templateHtml.slice(m.index + m[0].indexOf(m[2]) + m[2].length);
    templateHtml = before + `\nlet blogPosts = ${postsData};\n` + after;
  } else {
    console.error('ERROR: No se encontró el marcador para insertar los posts en index.html');
    process.exit(1);
  }
}

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, templateHtml, 'utf8');

console.log('Blog generado con éxito en la carpeta dist!');
console.log(`Archivos encontrados (md): ${mdFiles.length}`);
mdFiles.forEach(f => console.log(`- ${path.relative(articlesPath, f)}`));
console.log(`Posts procesados: ${blogPosts.length}`);
blogPosts.forEach(p => console.log(`- ${p.title} (slug: ${p.slug}) category: ${p.category || 'Sin categoría'}`));
