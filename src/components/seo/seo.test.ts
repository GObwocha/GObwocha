import { describe, expect, it } from 'vitest';
import {
  getAllProjectSlugs,
  getFeaturedProjects,
  getProjectBySlug,
  projects,
} from '../../data/projects';
import { siteConfig } from '../../data/site';
import {
  escapeHtml,
  generateSitemapXml,
  getPrerenderRoutes,
  resolveRouteMetadata,
  serializeHeadTags,
} from './seo';

describe('SEO metadata engine and verified 7-project dataset (S1-T4)', () => {
  const staticRoutes = ['/', '/work', '/about', '/contact'] as const;
  const expectedProjectSlugs = [
    'halisi-app',
    'greenroute',
    'kula-kwa-macho',
    'somastar',
    'geliscope',
    'email-analyzer',
    'ole-ken-hotel',
  ] as const;

  it('produces unique titles, descriptions, canonical URLs, 1200x630 OG tags, and summary_large_image Twitter tags for all static routes', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    const canonicals = new Set<string>();

    for (const route of staticRoutes) {
      const meta = resolveRouteMetadata(route);
      expect(meta.title.length).toBeGreaterThan(10);
      expect(meta.description.length).toBeGreaterThan(30);
      expect(meta.canonicalUrl).toMatch(/^https:\/\/gobwocha\.vercel\.app\//);
      expect(meta.ogImageWidth).toBe(1200);
      expect(meta.ogImageHeight).toBe(630);
      expect(meta.twitterCard).toBe('summary_large_image');
      expect(meta.robots).toBe('index, follow');

      titles.add(meta.title);
      descriptions.add(meta.description);
      canonicals.add(meta.canonicalUrl);

      const serialized = serializeHeadTags(meta);
      expect(serialized).toContain(`<title>${escapeHtml(meta.title)}</title>`);
      expect(serialized).toContain(
        `<meta name="description" content="${escapeHtml(meta.description)}" />`,
      );
      expect(serialized).toContain(`<link rel="canonical" href="${meta.canonicalUrl}" />`);
      expect(serialized).toContain('<meta property="og:image:width" content="1200" />');
      expect(serialized).toContain('<meta property="og:image:height" content="630" />');
      expect(serialized).toContain('<meta name="twitter:card" content="summary_large_image" />');
      expect(serialized).toContain('<script type="application/ld+json">');
    }

    expect(titles.size).toBe(staticRoutes.length);
    expect(descriptions.size).toBe(staticRoutes.length);
    expect(canonicals.size).toBe(staticRoutes.length);
  });

  it('resolves unique project-specific SEO metadata, OG images, and JSON-LD for all 7 portfolio projects', () => {
    expect(getAllProjectSlugs()).toEqual(expectedProjectSlugs);
    expect(projects).toHaveLength(7);
    expect(getFeaturedProjects()).toHaveLength(4);

    const titles = new Set<string>();
    const descriptions = new Set<string>();
    const ogImages = new Set<string>();

    for (const slug of expectedProjectSlugs) {
      const route = `/work/${slug}`;
      const meta = resolveRouteMetadata(route);
      const project = getProjectBySlug(slug);

      expect(project).toBeDefined();
      expect(meta.title).toBe(project?.seoTitle);
      expect(meta.description).toBe(project?.seoDescription);
      expect(meta.canonicalUrl).toBe(`https://gobwocha.vercel.app/work/${slug}`);
      expect(meta.ogType).toBe('article');
      expect(meta.ogImage).toBe(`https://gobwocha.vercel.app/og/projects/${slug}.png`);
      expect(meta.ogImageWidth).toBe(1200);
      expect(meta.ogImageHeight).toBe(630);
      expect(meta.twitterCard).toBe('summary_large_image');
      expect(meta.robots).toBe('index, follow');
      expect(meta.jsonLd).toBeDefined();

      const serialized = serializeHeadTags(meta);
      expect(serialized).toContain('"@context":"https://schema.org"');
      expect(serialized).toContain(`"url":"https://gobwocha.vercel.app/work/${slug}"`);

      titles.add(meta.title);
      descriptions.add(meta.description);
      ogImages.add(meta.ogImage);
    }

    expect(titles.size).toBe(7);
    expect(descriptions.size).toBe(7);
    expect(ogImages.size).toBe(7);
  });

  it('emits noindex, nofollow for /404 and unknown routes or unknown project slugs', () => {
    for (const unknownPath of ['/404', '/unknown-route', '/work/unknown-slug', '/work/a/b']) {
      const meta = resolveRouteMetadata(unknownPath);
      expect(meta.robots).toBe('noindex, nofollow');
      expect(meta.title).toContain('Page Not Found');

      const serialized = serializeHeadTags(meta);
      expect(serialized).toContain('<meta name="robots" content="noindex, nofollow" />');
    }
  });

  it('generates a complete prerender route manifest and valid XML sitemap excluding /404', () => {
    const prerenderRoutes = getPrerenderRoutes();
    expect(prerenderRoutes).toHaveLength(5 + 7);
    expect(prerenderRoutes.map((r) => r.url)).toEqual([
      '/',
      '/work',
      '/about',
      '/contact',
      '/404',
      ...expectedProjectSlugs.map((slug) => `/work/${slug}`),
    ]);

    const sitemap = generateSitemapXml();
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(sitemap).toContain('<loc>https://gobwocha.vercel.app/</loc>');
    expect(sitemap).toContain('<loc>https://gobwocha.vercel.app/work</loc>');
    expect(sitemap).toContain('<loc>https://gobwocha.vercel.app/about</loc>');
    expect(sitemap).toContain('<loc>https://gobwocha.vercel.app/contact</loc>');

    for (const slug of expectedProjectSlugs) {
      expect(sitemap).toContain(`<loc>https://gobwocha.vercel.app/work/${slug}</loc>`);
    }

    expect(sitemap).not.toContain('/404');
  });

  it('preserves verified teammate credits and forbids placeholder href="#" or fabricated percentage claims', () => {
    const halisi = getProjectBySlug('halisi-app');
    expect(halisi?.organization).toBe('Chiromo Tech Club, University of Nairobi');
    expect(halisi?.teammates?.map((t) => t.githubHandle ?? t.name)).toEqual([
      'Kimanzi-Collins',
      'sigangandegwa',
      'Dennis Kuria',
    ]);

    const greenroute = getProjectBySlug('greenroute');
    expect(greenroute?.teammates?.map((t) => t.githubHandle)).toEqual(['Bemos26', 'Tim-cm']);

    const somastar = getProjectBySlug('somastar');
    expect(somastar?.teammates?.map((t) => t.githubHandle)).toEqual(['Emmanuel-Makori-Obiero']);

    const serializedData = JSON.stringify({ siteConfig, projects });
    expect(serializedData).not.toContain('href="#"');
    expect(serializedData).not.toMatch(/\b\d+%\s+(increase|reduction|faster|growth)\b/i);
  });
});
