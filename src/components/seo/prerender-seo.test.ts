// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { projects } from '../../data/projects';
import { siteConfig } from '../../data/site';

const ROOT_DIR = path.resolve(__dirname, '../../..');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');

const MAX_IMAGE_PAYLOAD_BYTES = 300 * 1024; // 300 KB NFR release gate (§4.1)
const PNG_MAGIC_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function parsePngDimensions(buffer: Buffer): { width: number; height: number; chunkType: string } {
  const chunkType = buffer.subarray(12, 16).toString('ascii');
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height, chunkType };
}

describe('S4-T1: Media Asset & Open Graph Payload Budget Verification', () => {
  it('verifies every project coverImage and gallery asset exists in public/ and is non-empty', () => {
    expect(projects.length).toBe(7);

    for (const project of projects) {
      const coverRelative = project.coverImage.replace(/^\//, '');
      const coverPath = path.join(PUBLIC_DIR, coverRelative);

      expect(fs.existsSync(coverPath), `Missing coverImage: ${coverPath}`).toBe(true);
      const stats = fs.statSync(coverPath);
      expect(stats.size).toBeGreaterThan(100);

      for (const galleryItem of project.gallery) {
        const galleryPath = path.join(PUBLIC_DIR, galleryItem.replace(/^\//, ''));
        expect(fs.existsSync(galleryPath), `Missing gallery image: ${galleryPath}`).toBe(true);
        const galleryStats = fs.statSync(galleryPath);
        expect(galleryStats.size).toBeGreaterThan(100);
      }
    }
  });

  it('verifies public/og/default.png and all 7 project ogImage PNGs are valid 1200x630 PNGs <= 300 KB', () => {
    const ogRelativePaths = [
      siteConfig.defaultOgImage,
      ...projects.map((project) => project.ogImage),
    ];

    expect(new Set(ogRelativePaths).size).toBe(8);

    for (const ogRel of ogRelativePaths) {
      const fullPath = path.join(PUBLIC_DIR, ogRel.replace(/^\//, ''));
      expect(fs.existsSync(fullPath), `Missing OG PNG asset: ${fullPath}`).toBe(true);

      const buffer = fs.readFileSync(fullPath);
      expect(buffer.byteLength).toBeGreaterThan(500);
      expect(buffer.byteLength).toBeLessThanOrEqual(MAX_IMAGE_PAYLOAD_BYTES);

      // Verify PNG magic signature
      const signature = buffer.subarray(0, 8);
      expect(signature.equals(PNG_MAGIC_BYTES)).toBe(true);

      // Verify IHDR chunk dimensions (1200 x 630)
      const { chunkType, width, height } = parsePngDimensions(buffer);
      expect(chunkType).toBe('IHDR');
      expect(width).toBe(1200);
      expect(height).toBe(630);
    }
  });
});

describe('S5-T2: Pre-rendered SSG HTML, Social Cards & Crawlability Verification', () => {
  const indexablePages = [
    {
      route: '/',
      filePath: path.join(DIST_DIR, 'index.html'),
      canonical: 'https://gobwocha.vercel.app/',
      expectedOgImage: 'https://gobwocha.vercel.app/og/default.png',
    },
    {
      route: '/work',
      filePath: path.join(DIST_DIR, 'work', 'index.html'),
      canonical: 'https://gobwocha.vercel.app/work',
      expectedOgImage: 'https://gobwocha.vercel.app/og/default.png',
    },
    {
      route: '/about',
      filePath: path.join(DIST_DIR, 'about', 'index.html'),
      canonical: 'https://gobwocha.vercel.app/about',
      expectedOgImage: 'https://gobwocha.vercel.app/og/default.png',
    },
    {
      route: '/contact',
      filePath: path.join(DIST_DIR, 'contact', 'index.html'),
      canonical: 'https://gobwocha.vercel.app/contact',
      expectedOgImage: 'https://gobwocha.vercel.app/og/default.png',
    },
    ...projects.map((project) => ({
      route: `/work/${project.slug}`,
      filePath: path.join(DIST_DIR, 'work', project.slug, 'index.html'),
      canonical: `https://gobwocha.vercel.app/work/${project.slug}`,
      expectedOgImage: `https://gobwocha.vercel.app${project.ogImage}`,
    })),
  ];

  const notFoundPage = {
    route: '/404',
    filePath: path.join(DIST_DIR, '404.html'),
    canonical: 'https://gobwocha.vercel.app/404',
    expectedOgImage: 'https://gobwocha.vercel.app/og/default.png',
  };

  it('verifies all 12 pre-rendered HTML files exist and contain semantic HTML5 landmarks and a single <h1>', () => {
    const allPages = [...indexablePages, notFoundPage];
    expect(allPages.length).toBe(12);

    for (const page of allPages) {
      expect(fs.existsSync(page.filePath), `Missing pre-rendered file: ${page.filePath}`).toBe(
        true,
      );
      const html = fs.readFileSync(page.filePath, 'utf-8');

      // Semantic landmarks
      expect(html).toContain('<header class="site-header">');
      expect(html).toContain('<nav aria-label="Primary navigation"');
      expect(html).toContain('<main id="main-content"');
      expect(html).toContain('<footer class="site-footer">');

      // Non-empty <main> content
      const mainMatch = html.match(/<main id="main-content"[^>]*>([\s\S]*?)<\/main>/);
      expect(mainMatch, `Missing <main> content in ${page.route}`).not.toBeNull();
      expect((mainMatch?.[1] ?? '').trim().length).toBeGreaterThan(200);

      // Exactly one <h1> element per page
      const h1Matches = html.match(/<h1\b[^>]*>/g) ?? [];
      expect(h1Matches.length, `Expected exactly 1 <h1> in ${page.route}`).toBe(1);
    }
  });

  it('verifies unique titles, descriptions, canonical URLs, 1200x630 OG/Twitter cards, and JSON-LD across all 11 public routes', () => {
    const seenTitles = new Set<string>();
    const seenDescriptions = new Set<string>();
    const seenCanonicals = new Set<string>();

    for (const page of indexablePages) {
      const html = fs.readFileSync(page.filePath, 'utf-8');

      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      expect(titleMatch, `Missing <title> in ${page.route}`).not.toBeNull();
      const title = (titleMatch?.[1] ?? '').trim();
      expect(title.length).toBeGreaterThan(15);
      seenTitles.add(title);

      const descMatch = html.match(/<meta name="description" content="([^"]+)"\s*\/?>/);
      expect(descMatch, `Missing meta description in ${page.route}`).not.toBeNull();
      const description = (descMatch?.[1] ?? '').trim();
      expect(description.length).toBeGreaterThan(40);
      seenDescriptions.add(description);

      expect(html).toContain(`<link rel="canonical" href="${page.canonical}"`);
      seenCanonicals.add(page.canonical);

      expect(html).toContain('<meta name="robots" content="index, follow"');
      expect(html).toContain(`<meta property="og:url" content="${page.canonical}"`);
      expect(html).toContain(`<meta property="og:image" content="${page.expectedOgImage}"`);
      expect(html).toContain('<meta property="og:image:width" content="1200"');
      expect(html).toContain('<meta property="og:image:height" content="630"');
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image"');
      expect(html).toContain(`<meta name="twitter:image" content="${page.expectedOgImage}"`);

      // Verify JSON-LD structured data is present and parses as valid JSON
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      expect(jsonLdMatch, `Missing JSON-LD script in ${page.route}`).not.toBeNull();
      const parsedJsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}') as Record<string, unknown>;
      expect(parsedJsonLd).toBeTruthy();
    }

    expect(seenTitles.size).toBe(11);
    expect(seenDescriptions.size).toBe(11);
    expect(seenCanonicals.size).toBe(11);
  });

  it('verifies dist/404.html enforces noindex, nofollow and includes valid social metadata', () => {
    const html = fs.readFileSync(notFoundPage.filePath, 'utf-8');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow"');
    expect(html).toContain('<link rel="canonical" href="https://gobwocha.vercel.app/404"');
    expect(html).toContain('<meta property="og:image:width" content="1200"');
    expect(html).toContain('<meta property="og:image:height" content="630"');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image"');
  });

  it('verifies dist/sitemap.xml and public/robots.txt include all 11 canonical public URLs', () => {
    const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
    const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');

    expect(fs.existsSync(robotsPath)).toBe(true);
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const robotsTxt = fs.readFileSync(robotsPath, 'utf-8');
    expect(robotsTxt).toContain('User-agent: *');
    expect(robotsTxt).toContain('Allow: /');
    expect(robotsTxt).toContain('Disallow: /404');
    expect(robotsTxt).toContain('Sitemap: https://gobwocha.vercel.app/sitemap.xml');

    const sitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
    for (const page of indexablePages) {
      expect(sitemapXml).toContain(`<loc>${page.canonical}</loc>`);
    }
    expect(sitemapXml).not.toContain('https://gobwocha.vercel.app/404');
  });
});
