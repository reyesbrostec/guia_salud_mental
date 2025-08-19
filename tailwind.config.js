/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,md}",
    "./assets/js/**/*.js",
    "./dist/**/*.html",
    "./index.html"
  ],
  safelist: [
    'acc-visual','acc-auditiva','acc-motriz','acc-cognitiva','acc-dislexia',
    'hidden','block','flex','grid','container','mx-auto'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
