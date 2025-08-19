const fs = require('fs');
const path = require('path');

async function build() {
  const input = path.resolve(__dirname, '..', 'src', 'styles', 'tailwind.css');
  const outputDir = path.resolve(__dirname, '..', 'dist', 'assets', 'css');
  const output = path.resolve(outputDir, 'tailwind.css');

  try {
  const tailwindPostcss = require('@tailwindcss/postcss');
  const postcss = require('postcss');
  const autoprefixer = require('autoprefixer');

  const css = fs.readFileSync(input, 'utf8');
  const result = await postcss([tailwindPostcss, autoprefixer]).process(css, { from: input, to: output });

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(output, result.css, 'utf8');
    console.log('CSS generado en', output);
  } catch (err) {
    console.error('Error al generar CSS con Tailwind API:', err);
    process.exit(1);
  }
}

build();
