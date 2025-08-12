const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();

// Cambié 'articulos' por 'publicaciones' para que apunte al submódulo
const articlesPath = path.join(__dirname, 'src', 'publicaciones');

// Lee el archivo de plantilla HTML
const templatePath = path.join(__dirname, 'index.html');
let templateHtml = fs.readFileSync(templatePath, 'utf8');

// Array para almacenar los objetos de los artículos
const blogPosts = [];

// Verifica que la carpeta exista para evitar errores
if (!fs.existsSync(articlesPath)) {
  console.error(`ERROR: La carpeta ${articlesPath} no existe.`);
  process.exit(1);
}

// Lee todos los archivos Markdown de la carpeta publicaciones
fs.readdirSync(articlesPath).forEach(file => {
  if (path.extname(file) === '.md') {
    const filePath = path.join(articlesPath, file);
    const markdownContent = fs.readFileSync(filePath, 'utf8');
    
    // Convierte el Markdown a HTML
    const htmlContent = md.render(markdownContent);
    
    // Obtiene título y resumen
    const title = file.replace('.md', '').replace(/-/g, ' ').toUpperCase();
    const summary = markdownContent.split('\n')[0].substring(0, 100) + '...';
    const category = 'General'; // Puedes mejorar extrayendo del front matter

    blogPosts.push({ title, category, summary, content: htmlContent });
  }
});

// Serializa el array de posts
const postsData = JSON.stringify(blogPosts);

// Reemplaza marcador en la plantilla con los datos
templateHtml = templateHtml.replace('// __BLOG_POSTS_DATA__', `const blogPosts = ${postsData};`);

// Asegura que exista la carpeta dist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Escribe el archivo final en dist/index.html
const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, templateHtml);

console.log('Blog generado con éxito en la carpeta dist!');
