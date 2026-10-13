import { expect, test } from '@playwright/test';

test.describe('Primary Navigation, Skip Link, Mobile Drawer & 404 Recovery', () => {
  test('home page loads with zero console.error or uncaught pageerror events', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Geoffrey Obwocha — Systems Architect & Full-Stack Product Engineer',
      }),
    ).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('skip link is focusable via Tab and points to #main-content', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toHaveAttribute('href', '#main-content');

    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();

    const mainLandmark = page.locator('main#main-content');
    await expect(mainLandmark).toBeVisible();
  });

  test('desktop navigation across / -> /work -> /about -> /contact updates aria-current="page" and h1 headings', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const primaryNav = page.getByRole('navigation', { name: 'Primary navigation' });
    const homeLink = primaryNav.getByRole('link', { name: 'Home', exact: true });
    const workLink = primaryNav.getByRole('link', { name: 'Work', exact: true });
    const aboutLink = primaryNav.getByRole('link', { name: 'About', exact: true });
    const contactLink = primaryNav.getByRole('link', { name: 'Contact', exact: true });

    await expect(homeLink).toHaveAttribute('aria-current', 'page');
    await expect(workLink).not.toHaveAttribute('aria-current', 'page');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Geoffrey Obwocha — Systems Architect & Full-Stack Product Engineer',
      }),
    ).toBeVisible();

    await workLink.click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(workLink).toHaveAttribute('aria-current', 'page');
    await expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Selected Work & Engineering Case Studies',
      }),
    ).toBeVisible();

    await aboutLink.click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(aboutLink).toHaveAttribute('aria-current', 'page');
    await expect(workLink).not.toHaveAttribute('aria-current', 'page');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'About Geoffrey Obwocha',
      }),
    ).toBeVisible();

    await contactLink.click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(contactLink).toHaveAttribute('aria-current', 'page');
    await expect(aboutLink).not.toHaveAttribute('aria-current', 'page');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Contact & Project Enquiries',
      }),
    ).toBeVisible();
  });

  test('mobile navigation drawer at 375x812 toggles aria-expanded, closes on Escape, and closes on link navigation', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const openButton = page.getByRole('button', { name: 'Open navigation menu' });
    await expect(openButton).toBeVisible();
    await expect(openButton).toHaveAttribute('aria-expanded', 'false');

    await openButton.click();

    const closeButton = page.getByRole('button', { name: 'Close navigation menu' });
    await expect(closeButton).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(openButton).toHaveAttribute('aria-expanded', 'false');

    await openButton.click();
    await expect(closeButton).toHaveAttribute('aria-expanded', 'true');

    const primaryNav = page.getByRole('navigation', { name: 'Primary navigation' });
    await primaryNav.getByRole('link', { name: 'Work', exact: true }).click();

    await expect(page).toHaveURL(/\/work$/);
    await expect(openButton).toHaveAttribute('aria-expanded', 'false');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Selected Work & Engineering Case Studies',
      }),
    ).toBeVisible();
  });

  test('unknown route renders Page Not Found (h1) with working recovery links back to / and /work', async ({
    page,
  }) => {
    await page.goto('/non-existent-page');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Page Not Found',
      }),
    ).toBeVisible();

    const returnHomeLink = page.getByRole('link', { name: 'Return to Home' });
    const exploreWorkLink = page.getByRole('link', { name: 'Explore Selected Work' });

    await expect(returnHomeLink).toHaveAttribute('href', '/');
    await expect(exploreWorkLink).toHaveAttribute('href', '/work');

    await returnHomeLink.click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Geoffrey Obwocha — Systems Architect & Full-Stack Product Engineer',
      }),
    ).toBeVisible();

    await page.goto('/non-existent-page');
    await page.getByRole('link', { name: 'Explore Selected Work' }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Selected Work & Engineering Case Studies',
      }),
    ).toBeVisible();
  });

  test('navigating from the bottom of one page resets scroll position to the top of the navigated page', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Scroll to the bottom of the home page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForFunction(() => window.scrollY > 400);

    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBeGreaterThan(400);

    // Click navigation link to /work in the footer
    const footerWorkLink = page.locator('footer.site-footer').getByRole('link', { name: 'Work' });
    await footerWorkLink.click();

    await expect(page).toHaveURL(/\/work$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Selected Work & Engineering Case Studies',
      }),
    ).toBeVisible();

    // Verify user was brought to the top of the navigated page
    await page.waitForFunction(() => window.scrollY === 0);
    const newScrollY = await page.evaluate(() => window.scrollY);
    expect(newScrollY).toBe(0);
  });
});
