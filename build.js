const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();

// Ruta a la carpeta del submódulo con los archivos Markdown
const articlesPath = path.join(__dirname, 'src', 'publicaciones');

// Ruta de la plantilla HTML base
const templatePath = path.join(__dirname, 'index.html');
let templateHtml = fs.readFileSync(templatePath, 'utf8');

// Array para almacenar los posts
const blogPosts = [];

// Verificar que la carpeta de publicaciones exista
if (!fs.existsSync(articlesPath)) {
  console.error(`ERROR: La carpeta de publicaciones no existe en ${articlesPath}`);
  process.exit(1);
}

// Leer archivos Markdown y convertirlos a HTML
fs.readdirSync(articlesPath).forEach(file => {
  if (path.extname(file) === '.md') {
    const filePath = path.join(articlesPath, file);
    const markdownContent = fs.readFileSync(filePath, 'utf8');

    const htmlContent = md.render(markdownContent);

    const title = file.replace('.md', '').replace(/-/g, ' ').toUpperCase();
    const summary = markdownContent.split('\n')[0].substring(0, 100) + '...';
    const category = 'General'; // Puedes mejorar extrayendo metadatos

    blogPosts.push({ title, category, summary, content: htmlContent });
  }
});

// Serializar posts para incrustar en el HTML
const postsData = JSON.stringify(blogPosts);

// Reemplazar marcador en la plantilla con datos de posts
templateHtml = templateHtml.replace('// __BLOG_POSTS_DATA__', `const blogPosts = ${postsData};`);

// Crear carpeta dist si no existe
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Guardar el HTML generado en dist/index.html
const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, templateHtml);

console.log('Blog generado con éxito en la carpeta dist!');
console.log(`Archivos encontrados: ${fs.readdirSync(articlesPath).join(', ')}`);
console.log(`Posts procesados:`, blogPosts);
