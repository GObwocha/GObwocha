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

  // Locate and read compiled CSS from dist/assets to inline critical CSS
  let criticalCss = '';
  try {
    const assetsDir = path.join(distDir, 'assets');
    const assetFiles = await fs.readdir(assetsDir);
    const cssFile = assetFiles.find((file) => file.endsWith('.css'));
    if (cssFile) {
      criticalCss = await fs.readFile(path.join(assetsDir, cssFile), 'utf-8');
      console.log(
        `[prerender] Inlining critical CSS from ${cssFile} (${Buffer.byteLength(criticalCss, 'utf-8')} bytes)`,
      );
    }
  } catch (err) {
    console.warn('[prerender] Warning: Could not locate compiled CSS in dist/assets:', err.message);
  }

  // Replace external render-blocking stylesheet link with inlined critical CSS
  let preparedTemplate = template;
  if (criticalCss) {
    const criticalStyleTag = `<style data-critical="true">\n${criticalCss}\n    </style>`;
    const linkStylesheetRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/i;
    if (linkStylesheetRegex.test(preparedTemplate)) {
      preparedTemplate = preparedTemplate.replace(linkStylesheetRegex, criticalStyleTag);
    } else {
      preparedTemplate = preparedTemplate.replace('</head>', `  ${criticalStyleTag}\n  </head>`);
    }
  }

  const serverEntryUrl = pathToFileURL(path.join(ssrDir, 'entry-server.js')).href;
  const { render, getPrerenderRoutes, generateSitemapXml } = await import(serverEntryUrl);

  const routes =
    typeof getPrerenderRoutes === 'function'
      ? getPrerenderRoutes()
      : [
          { url: '/', outputPath: 'index.html' },
          { url: '/404', outputPath: '404.html' },
        ];

  for (const route of routes) {
    const { html, head } = render(route.url);
    const renderedPage = preparedTemplate
      .replace('<!--app-head-->', head)
      .replace('<!--app-html-->', html);

    const targetPath = path.join(distDir, route.outputPath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, renderedPage, 'utf-8');
  }

  if (typeof generateSitemapXml === 'function') {
    const sitemapXml = generateSitemapXml();
    await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  }

  await fs.rm(ssrDir, { recursive: true, force: true });
}

prerender().catch((error) => {
  console.error('SSG prerender failed:', error);
  process.exit(1);
});
