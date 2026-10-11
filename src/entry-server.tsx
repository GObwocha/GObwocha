import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './app/App';
import {
  generateSitemapXml,
  getPrerenderRoutes,
  resolveRouteMetadata,
  serializeHeadTags,
} from './components/seo/seo';
import type { RouteMetadata } from './types/seo';

export interface RenderResult {
  html: string;
  head: string;
  metadata: RouteMetadata;
}

export function render(url: string): RenderResult {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );

  const metadata = resolveRouteMetadata(url);
  const head = serializeHeadTags(metadata);

  return { html, head, metadata };
}

export { generateSitemapXml, getPrerenderRoutes, resolveRouteMetadata, serializeHeadTags };
