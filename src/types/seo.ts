export interface RouteMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: 'website' | 'article' | 'profile';
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageWidth: 1200;
  ogImageHeight: 630;
  ogImageAlt: string;
  twitterCard: 'summary_large_image';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robots: 'index, follow' | 'noindex, nofollow';
  jsonLd?: Record<string, unknown> | readonly Record<string, unknown>[];
}

export interface PrerenderRoute {
  url: string;
  outputPath: string;
}
