import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { AxeMatchers } from 'vitest-axe/matchers';
import * as axeMatchers from 'vitest-axe/matchers';
import { App } from './App';

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends AxeMatchers {}
}
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */

expect.extend(axeMatchers);

function renderAtRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App route and layout shell (S1-T3)', () => {
  it.each([
    { path: '/', expectedH1: /geoffrey obwocha/i },
    { path: '/work', expectedH1: /selected work & engineering case studies/i },
    { path: '/work/halisi-app', expectedH1: /^halisi app$/i },
    { path: '/about', expectedH1: /about geoffrey obwocha/i },
    { path: '/contact', expectedH1: /contact & project enquiries/i },
  ])(
    'renders semantic landmarks and exactly one h1 on route $path',
    async ({ path, expectedH1 }) => {
      const { container } = renderAtRoute(path);

      // Verify exactly one h1 heading matching route expectation
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent(expectedH1);

      // Verify banner (<header>), primary navigation (<nav>), main (<main id="main-content">), and contentinfo (<footer>)
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument();

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveAttribute('id', 'main-content');

      expect(screen.getByRole('contentinfo')).toBeInTheDocument();

      // Verify zero placeholder href="#" links anywhere on the route
      const allLinks = screen.getAllByRole('link');
      for (const link of allLinks) {
        expect(link.getAttribute('href')).not.toBe('#');
      }

      // Run automated axe accessibility check
      expect(await axe(container)).toHaveNoViolations();
    },
  );

  it('renders the 404 NotFoundPage for unknown routes and invalid project slugs with recovery links', async () => {
    const { container, unmount } = renderAtRoute('/non-existent-route');

    expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /explore selected work/i })).toHaveAttribute(
      'href',
      '/work',
    );
    expect(await axe(container)).toHaveNoViolations();

    unmount();

    const invalidProjectRender = renderAtRoute('/work/unknown-slug');
    expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /explore selected work/i })).toHaveAttribute(
      'href',
      '/work',
    );
    expect(await axe(invalidProjectRender.container)).toHaveNoViolations();
  });

  it('updates aria-current="page" accurately when navigating across primary routes', async () => {
    const user = userEvent.setup();
    renderAtRoute('/');

    const primaryNav = screen.getByRole('navigation', { name: /primary navigation/i });
    const homeLink = within(primaryNav).getByRole('link', { name: /^home$/i });
    const workLink = within(primaryNav).getByRole('link', { name: /^work$/i });
    const aboutLink = within(primaryNav).getByRole('link', { name: /^about$/i });
    const contactLink = within(primaryNav).getByRole('link', { name: /^contact$/i });

    expect(homeLink).toHaveAttribute('aria-current', 'page');
    expect(workLink).not.toHaveAttribute('aria-current', 'page');

    await user.click(workLink);
    expect(workLink).toHaveAttribute('aria-current', 'page');
    expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('heading', { level: 1, name: /selected work & engineering case studies/i }),
    ).toBeInTheDocument();

    await user.click(aboutLink);
    expect(aboutLink).toHaveAttribute('aria-current', 'page');
    expect(workLink).not.toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('heading', { level: 1, name: /about geoffrey obwocha/i }),
    ).toBeInTheDocument();

    await user.click(contactLink);
    expect(contactLink).toHaveAttribute('aria-current', 'page');
    expect(aboutLink).not.toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('heading', { level: 1, name: /contact & project enquiries/i }),
    ).toBeInTheDocument();
  });

  it('toggles mobile navigation aria-expanded on click, closes on Escape, and closes on route change', async () => {
    const user = userEvent.setup();
    renderAtRoute('/');

    const toggleButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-controls', 'mobile-nav-drawer');

    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(toggleButton).toHaveAttribute('aria-label', 'Close navigation menu');

    // Pressing Escape closes the mobile menu
    await user.keyboard('{Escape}');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-label', 'Open navigation menu');

    // Re-open and navigate to another route; menu should close automatically
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    const primaryNav = screen.getByRole('navigation', { name: /primary navigation/i });
    await user.click(within(primaryNav).getByRole('link', { name: /^work$/i }));
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders an accessible skip link pointing to #main-content', () => {
    renderAtRoute('/');

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });
});
