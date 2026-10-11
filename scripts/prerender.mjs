import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const ssrDir = path.resolve(rootDir, 'dist-ssr');

async function prerender() {
  const templatePath = path.join(distDir, 'index.html');
  const template = await fs.readFile(templatePath, 'utf-8');

  const serverEntryUrl = pathToFileURL(path.join(ssrDir, 'entry-server.js')).href;
  const { render } = await import(serverEntryUrl);

  const routes = [
    { url: '/', outputPath: 'index.html' },
    { url: '/404', outputPath: '404.html' },
  ];

  for (const route of routes) {
    const { html, head } = render(route.url);
    const renderedPage = template.replace('<!--app-head-->', head).replace('<!--app-html-->', html);

    const targetPath = path.join(distDir, route.outputPath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, renderedPage, 'utf-8');
  }

  await fs.rm(ssrDir, { recursive: true, force: true });
}

prerender().catch((error) => {
  console.error('SSG prerender failed:', error);
  process.exit(1);
});
