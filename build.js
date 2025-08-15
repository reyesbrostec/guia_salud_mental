const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();

const articlesPath = path.join(__dirname, 'src', 'publicaciones');
const templatePath = path.join(__dirname, 'index.html');
let templateHtml = fs.readFileSync(templatePath, 'utf8');

const blogPosts = [];

if (!fs.existsSync(articlesPath)) {
  console.error(`ERROR: La carpeta de publicaciones no existe en ${articlesPath}`);
  process.exit(1);
}

function parseFrontmatter(markdown) {
  const fmRegex = /^---\s*([\s\S]*?)\s*---\s*/;
  const res = { meta: {}, body: markdown };
  const m = markdown.match(fmRegex);
  if (!m) return res;

  const fm = m[1];
  res.body = markdown.slice(m[0].length).trim();

  // simple key: value parser (covers title, description, tags)
  const lines = fm.split(/\r?\n/);
  lines.forEach(line => {
    const kv = line.match(/^\s*([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) return;
    const key = kv[1].trim();
    let value = kv[2].trim();

    // remove wrapping quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key.toLowerCase() === 'tags') {
      // try to parse JSON array, fallback to comma separated
      value = value.trim();
      try {
        // allow tags: ["a","b"] or tags: [a, b]
        if (value.startsWith('[')) {
          // normalize unquoted words to quoted for JSON.parse
          const normalized = value.replace(/(['"])?([a-zA-Z0-9_\-\s]+)(['"])?/g, (s, q1, inner) => {
            // preserve commas, brackets and quotes
            if (/^\s*[\[,\]]\s*$/.test(s)) return s;
            return `"${inner.trim()}"`;
          });
          res.meta[key] = JSON.parse(normalized);
        } else {
          res.meta[key] = value.split(',').map(t => t.replace(/['"]/g, '').trim()).filter(Boolean);
        }
      } catch (e) {
        res.meta[key] = value.replace(/[\[\]']/g, '').split(',').map(t => t.trim()).filter(Boolean);
      }
    } else {
      res.meta[key] = value;
    }
  });

  return res;
}

function extractSummaryFromBody(body) {
  // quitar líneas vacías y headings de primer nivel como resumen
  const lines = body.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';
  // prefer primera línea de texto no heading
  for (let line of lines) {
    if (!/^#{1,6}\s+/.test(line)) return line.replace(/[`*_>~\-]{1,}/g, '').slice(0, 200);
  }
  return lines[0].replace(/[`*_>~\-]{1,}/g, '').slice(0, 200);
}

fs.readdirSync(articlesPath).forEach(file => {
  if (path.extname(file).toLowerCase() === '.md') {
    const filePath = path.join(articlesPath, file);
    const markdownContent = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFrontmatter(markdownContent);
    const body = parsed.body || '';
    const contentHtml = md.render(body);
    const filenameTitle = file.replace(/\.md$/i, '').replace(/[-_]+/g, ' ');
    const title = (parsed.meta.title && String(parsed.meta.title).trim()) || filenameTitle;
    const description = (parsed.meta.description && String(parsed.meta.description).trim()) || extractSummaryFromBody(body);
    const tags = Array.isArray(parsed.meta.tags) ? parsed.meta.tags : (parsed.meta.tags ? String(parsed.meta.tags).split(',').map(t => t.trim()).filter(Boolean) : []);
    const summary = description ? (description.length > 140 ? description.slice(0, 140) + '...' : description) : (extractSummaryFromBody(body).slice(0, 140) + '...');
    const slug = file.replace(/\.md$/i, '').toLowerCase().replace(/\s+/g, '-');

    blogPosts.push({
      title,
      description,
      tags,
      summary,
      slug,
      raw: markdownContent,
      content: contentHtml
    });
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
  // respaldo: insertar donde esté el comentario marcador
  templateHtml = templateHtml.replace('// __BLOG_POSTS_DATA__', `let blogPosts = ${postsData};`);
} else {
  // intentar insertar antes del cierre del script principal si existe
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
console.log(`Archivos encontrados: ${fs.readdirSync(articlesPath).join(', ')}`);
console.log(`Posts procesados:`, blogPosts);
