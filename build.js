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

if (!templateHtml.includes('let blogPosts = [];')) {
  console.error('ERROR: No se encontró el marcador "let blogPosts = [];" en index.html');
  process.exit(1);
}

templateHtml = templateHtml.replace('let blogPosts = [];', `let blogPosts = ${postsData};`);

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, templateHtml);

console.log('Blog generado con éxito en la carpeta dist!');
console.log(`Archivos encontrados: ${fs.readdirSync(articlesPath).join(', ')}`);
console.log(`Posts procesados:`, blogPosts);
