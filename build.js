const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();

// La ruta a tus archivos de Markdown
const articlesPath = path.join(__dirname, 'src', 'articulos');

// Lee el archivo de plantilla HTML
let templateHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Array para almacenar los objetos de los artículos
const blogPosts = [];

// Lee todos los archivos de la carpeta de artículos
fs.readdirSync(articlesPath).forEach(file => {
  if (path.extname(file) === '.md') {
    const filePath = path.join(articlesPath, file);
    const markdownContent = fs.readFileSync(filePath, 'utf8');
    
    // Aquí podrías parsear un "front matter" (metadatos) si quisieras
    // Por ahora, solo convertimos el contenido
    const htmlContent = md.render(markdownContent);
    
    // Simplemente usamos el nombre del archivo como título y la primera línea como resumen
    const title = file.replace('.md', '').replace(/-/g, ' ').toUpperCase();
    const summary = markdownContent.split('\n')[0].substring(0, 100) + '...';
    const category = 'General'; // o podrías obtenerlo del front matter

    blogPosts.push({ title, category, summary, content: htmlContent });
  }
});

// Convertimos el array de JavaScript a una cadena de texto
const postsData = JSON.stringify(blogPosts);

// Reemplazamos el marcador de posición en la plantilla con los datos
templateHtml = templateHtml.replace('// __BLOG_POSTS_DATA__', `const blogPosts = ${postsData};`);

// Escribimos el archivo final que se desplegará
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), templateHtml);

console.log('Blog generado con éxito en la carpeta dist!');