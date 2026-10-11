import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from './app/App';

export interface RenderResult {
  html: string;
  head: string;
}

export function render(url: string): RenderResult {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );

  const isNotFound = url === '/404';
  const title = isNotFound
    ? 'Page Not Found | Geoffrey Obwocha'
    : 'Geoffrey Obwocha — Systems Architect & Full-Stack Product Engineer';
  const description = isNotFound
    ? 'The requested page could not be found.'
    : 'Production portfolio of Geoffrey Obwocha — Systems Architect & Full-Stack Product Engineer.';

  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
  ].join('\n    ');

  return { html, head };
}
