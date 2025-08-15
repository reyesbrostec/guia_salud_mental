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

fs.readdirSync(articlesPath).forEach(file => {
  if (path.extname(file) === '.md') {
    const filePath = path.join(articlesPath, file);
    const markdownContent = fs.readFileSync(filePath, 'utf8');
    const htmlContent = md.render(markdownContent);
    const title = file.replace('.md', '').replace(/-/g, ' ').toUpperCase();
    const summary = markdownContent.split('\n')[0].substring(0, 100) + '...';
    const category = 'General';
    blogPosts.push({ title, category, summary, content: htmlContent });
  }
});

const postsData = JSON.stringify(blogPosts);

// Intentar reemplazar una asignación previa de blogPosts (vacía o poblada)
const varRegex = /let\s+blogPosts\s*=\s*\[.*?\];/s;
if (varRegex.test(templateHtml)) {
  templateHtml = templateHtml.replace(varRegex, `let blogPosts = ${postsData};`);
} else if (templateHtml.includes('// __BLOG_POSTS_DATA__')) {
  // respaldo: insertar donde esté el comentario marcador
  templateHtml = templateHtml.replace('// __BLOG_POSTS_DATA__', `let blogPosts = ${postsData};`);
} else {
  console.error('ERROR: No se encontró el marcador para insertar los posts en index.html');
  process.exit(1);
}

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, templateHtml);

console.log('Blog generado con éxito en la carpeta dist!');
console.log(`Archivos encontrados: ${fs.readdirSync(articlesPath).join(', ')}`);
console.log(`Posts procesados:`, blogPosts);
