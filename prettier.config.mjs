/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss', 'prettier-plugin-organize-imports'],
};

export default config;
