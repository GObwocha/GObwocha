import { getAllProjectSlugs, getProjectBySlug, projects } from '../../data/projects';
import { siteConfig } from '../../data/site';
import type { PrerenderRoute, RouteMetadata } from '../../types/seo';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const base = siteConfig.siteUrl.replace(/\/+$/, '');
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${normalizedPath}`;
}

export function normalizePathname(rawUrl: string): string {
  const withoutQueryOrHash = rawUrl.split(/[?#]/)[0] ?? '/';
  const trimmed = withoutQueryOrHash.trim();
  if (!trimmed || trimmed === '/') {
    return '/';
  }
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

function buildNotFoundMetadata(): RouteMetadata {
  const title = `Page Not Found | ${siteConfig.name}`;
  const description = `The requested page could not be found on ${siteConfig.name}’s portfolio.`;
  const canonicalUrl = toAbsoluteUrl('/404');
  const ogImage = toAbsoluteUrl(siteConfig.defaultOgImage);

  return {
    title,
    description,
    canonicalUrl,
    ogType: 'website',
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: siteConfig.defaultOgImageAlt,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    robots: 'noindex, nofollow',
  };
}

export function resolveRouteMetadata(pathname: string): RouteMetadata {
  const normalized = normalizePathname(pathname);
  const defaultOgImage = toAbsoluteUrl(siteConfig.defaultOgImage);

  if (normalized === '/') {
    const title = `${siteConfig.name} — ${siteConfig.role}`;
    const description =
      'Production portfolio of Geoffrey Obwocha (GObwocha) — Systems Architect & Full-Stack Product Engineer in Nairobi, Kenya building AI fraud detection, geospatial routing, and web platforms.';
    const canonicalUrl = toAbsoluteUrl('/');

    return {
      title,
      description,
      canonicalUrl,
      ogType: 'website',
      ogTitle: title,
      ogDescription: description,
      ogImage: defaultOgImage,
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageAlt: siteConfig.defaultOgImageAlt,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: defaultOgImage,
      robots: 'index, follow',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: siteConfig.name,
          alternateName: siteConfig.handle,
          jobTitle: siteConfig.role,
          url: canonicalUrl,
          email: `mailto:${siteConfig.email}`,
          sameAs: [siteConfig.githubUrl],
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Nairobi',
            addressCountry: 'KE',
          },
          alumniOf: {
            '@type': 'CollegeOrUniversity',
            name: 'University of Nairobi',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: `${siteConfig.name} Portfolio`,
          url: canonicalUrl,
          description,
        },
      ],
    };
  }

  if (normalized === '/work') {
    const title = `Selected Engineering Work & Case Studies | ${siteConfig.name}`;
    const description =
      'Explore 7 software engineering case studies by Geoffrey Obwocha, including Halisi M-Pesa fraud detection, GreenRoute Nairobi eco-routing, Kula-Kwa-Macho, SomaStar, and GeliScope.';
    const canonicalUrl = toAbsoluteUrl('/work');

    return {
      title,
      description,
      canonicalUrl,
      ogType: 'website',
      ogTitle: title,
      ogDescription: description,
      ogImage: defaultOgImage,
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageAlt: siteConfig.defaultOgImageAlt,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: defaultOgImage,
      robots: 'index, follow',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: canonicalUrl,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projects.map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: `${project.title} — ${project.subtitle}`,
            url: toAbsoluteUrl(`/work/${project.slug}`),
          })),
        },
      },
    };
  }

  if (normalized.startsWith('/work/')) {
    const slug = normalized.slice('/work/'.length);
    if (!slug || slug.includes('/')) {
      return buildNotFoundMetadata();
    }

    const project = getProjectBySlug(slug);
    if (!project) {
      return buildNotFoundMetadata();
    }

    const canonicalUrl = toAbsoluteUrl(`/work/${project.slug}`);
    const ogImage = toAbsoluteUrl(project.ogImage);

    const contributors =
      project.teammates?.map((teammate) => ({
        '@type': 'Person',
        name: teammate.name,
        ...(teammate.githubUrl ? { sameAs: [teammate.githubUrl] } : {}),
      })) ?? [];

    return {
      title: project.seoTitle,
      description: project.seoDescription,
      canonicalUrl,
      ogType: 'article',
      ogTitle: project.seoTitle,
      ogDescription: project.seoDescription,
      ogImage,
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageAlt: project.altText,
      twitterCard: 'summary_large_image',
      twitterTitle: project.seoTitle,
      twitterDescription: project.seoDescription,
      twitterImage: ogImage,
      robots: 'index, follow',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': project.repositoryUrl ? 'SoftwareSourceCode' : 'CreativeWork',
        name: project.title,
        headline: `${project.title} — ${project.subtitle}`,
        description: project.summary,
        datePublished: project.publishedAt,
        url: canonicalUrl,
        image: ogImage,
        author: {
          '@type': 'Person',
          name: siteConfig.name,
          url: toAbsoluteUrl('/'),
        },
        ...(contributors.length > 0 ? { contributor: contributors } : {}),
        ...(project.repositoryUrl ? { codeRepository: project.repositoryUrl } : {}),
        keywords: project.technologies.join(', '),
      },
    };
  }

  if (normalized === '/about') {
    const title = `About & Engineering Capabilities | ${siteConfig.name}`;
    const description =
      'Background, architectural principles, and full-stack capabilities of Geoffrey Obwocha — Systems Architect & Product Engineer at the University of Nairobi and Chiromo Tech Club.';
    const canonicalUrl = toAbsoluteUrl('/about');

    return {
      title,
      description,
      canonicalUrl,
      ogType: 'profile',
      ogTitle: title,
      ogDescription: description,
      ogImage: defaultOgImage,
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageAlt: siteConfig.defaultOgImageAlt,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: defaultOgImage,
      robots: 'index, follow',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        name: title,
        description,
        url: canonicalUrl,
        mainEntity: {
          '@type': 'Person',
          name: siteConfig.name,
          alternateName: siteConfig.handle,
          jobTitle: siteConfig.role,
          url: toAbsoluteUrl('/'),
          sameAs: [siteConfig.githubUrl],
        },
      },
    };
  }

  if (normalized === '/contact') {
    const title = `Contact & Project Enquiries | ${siteConfig.name}`;
    const description =
      'Start a conversation with Geoffrey Obwocha regarding backend systems, full-stack web architecture, AI integrations, or software engineering collaborations in Nairobi and beyond.';
    const canonicalUrl = toAbsoluteUrl('/contact');

    return {
      title,
      description,
      canonicalUrl,
      ogType: 'website',
      ogTitle: title,
      ogDescription: description,
      ogImage: defaultOgImage,
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageAlt: siteConfig.defaultOgImageAlt,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: defaultOgImage,
      robots: 'index, follow',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: title,
        description,
        url: canonicalUrl,
      },
    };
  }

  return buildNotFoundMetadata();
}

export function serializeHeadTags(meta: RouteMetadata): string {
  const tags: string[] = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`,
    `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`,
    `<link rel="manifest" href="/site.webmanifest" />`,
    `<meta property="og:type" content="${escapeHtml(meta.ogType)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteConfig.name)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.ogDescription)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`,
    `<meta property="og:image:width" content="${String(meta.ogImageWidth)}" />`,
    `<meta property="og:image:height" content="${String(meta.ogImageHeight)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="${escapeHtml(meta.twitterCard)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.twitterTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.twitterDescription)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.twitterImage)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(meta.ogImageAlt)}" />`,
  ];

  if (meta.jsonLd) {
    const serializedJson = JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c');
    tags.push(`<script type="application/ld+json">${serializedJson}</script>`);
  }

  return tags.join('\n    ');
}

export function getPrerenderRoutes(): PrerenderRoute[] {
  const staticRoutes: PrerenderRoute[] = [
    { url: '/', outputPath: 'index.html' },
    { url: '/work', outputPath: 'work/index.html' },
    { url: '/about', outputPath: 'about/index.html' },
    { url: '/contact', outputPath: 'contact/index.html' },
    { url: '/404', outputPath: '404.html' },
  ];

  const projectRoutes: PrerenderRoute[] = getAllProjectSlugs().map((slug) => ({
    url: `/work/${slug}`,
    outputPath: `work/${slug}/index.html`,
  }));

  return [...staticRoutes, ...projectRoutes];
}

export function generateSitemapXml(): string {
  const staticEntries = [
    { loc: toAbsoluteUrl('/'), lastmod: '2025-02-15', changefreq: 'weekly', priority: '1.0' },
    { loc: toAbsoluteUrl('/work'), lastmod: '2025-02-15', changefreq: 'weekly', priority: '0.9' },
    { loc: toAbsoluteUrl('/about'), lastmod: '2025-02-15', changefreq: 'monthly', priority: '0.8' },
    {
      loc: toAbsoluteUrl('/contact'),
      lastmod: '2025-02-15',
      changefreq: 'monthly',
      priority: '0.8',
    },
  ];

  const projectEntries = projects.map((project) => ({
    loc: toAbsoluteUrl(`/work/${project.slug}`),
    lastmod: project.publishedAt,
    changefreq: 'monthly',
    priority: project.featured ? '0.85' : '0.75',
  }));

  const allEntries = [...staticEntries, ...projectEntries];

  const urlNodes = allEntries
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeHtml(entry.loc)}</loc>\n    <lastmod>${escapeHtml(entry.lastmod)}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>\n`;
}
