import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function prerender() {
  const templatePath = path.resolve(root, 'dist/index.html');
  const ssrBundlePath = path.resolve(root, 'dist-ssr/entry-server.js');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Client build not found at ${templatePath}. Run 'vite build' first.`);
  }

  if (!fs.existsSync(ssrBundlePath)) {
    throw new Error(`SSR bundle not found at ${ssrBundlePath}. Run 'vite build --ssr' first.`);
  }

  console.log('⚡ Prerendering SSR App Shell for instant First Contentful Paint (<100ms)...');
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Import the SSR bundle
  const { render } = await import(`file://${ssrBundlePath}`);
  const { html: appHtml } = render();

  // Replace <div id="root"></div> with the SSR pre-rendered markup
  const renderedHtml = template.replace(
    /<div id="root">([\s\S]*?)<\/div>/,
    `<div id="root">${appHtml}</div>`
  );

  fs.writeFileSync(templatePath, renderedHtml, 'utf-8');
  console.log(`✅ SSR Prerender complete! Injected ${appHtml.length} characters of initial markup into dist/index.html`);

  // Clean up temporary dist-ssr directory
  const distSsrDir = path.resolve(root, 'dist-ssr');
  if (fs.existsSync(distSsrDir)) {
    fs.rmSync(distSsrDir, { recursive: true, force: true });
    console.log('🧹 Cleaned up temporary dist-ssr directory.');
  }
}

prerender().catch((err) => {
  console.error('❌ Prerender failed:', err);
  process.exit(1);
});
