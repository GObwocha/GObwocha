import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 568 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'ultrawide-2560', width: 2560, height: 1440 },
] as const;

const RESPONSIVE_ROUTES = ['/', '/work', '/work/halisi-app', '/about', '/contact'] as const;

const AXE_ROUTES = [
  '/',
  '/work',
  '/work/halisi-app',
  '/about',
  '/contact',
  '/non-existent-route',
] as const;

test.describe('Responsive Viewports (320px-2560px), Reduced Motion & WCAG 2.1 AA Axe Audits', () => {
  for (const viewport of VIEWPORTS) {
    test(`zero horizontal overflow at ${viewport.width}x${viewport.height} (${viewport.name}) across all core routes`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of RESPONSIVE_ROUTES) {
        await page.goto(route);
        await expect(page.locator('main#main-content h1')).toBeVisible();

        const overflowMetrics = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));

        expect(
          overflowMetrics.scrollWidth,
          `Route ${route} overflowed at ${viewport.width}px (${overflowMetrics.scrollWidth}px > ${overflowMetrics.innerWidth}px)`,
        ).toBeLessThanOrEqual(overflowMetrics.innerWidth);
      }
    });
  }

  test('interactive mobile controls meet >= 44x44px touch target requirements at 375x812', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const menuToggle = page.getByRole('button', { name: 'Open navigation menu' });
    const primaryCta = page.getByRole('link', { name: 'Start a Conversation' }).first();

    const toggleBox = await menuToggle.boundingBox();
    const ctaBox = await primaryCta.boundingBox();

    expect(toggleBox).not.toBeNull();
    expect(ctaBox).not.toBeNull();

    if (toggleBox && ctaBox) {
      expect(toggleBox.width).toBeGreaterThanOrEqual(44);
      expect(toggleBox.height).toBeGreaterThanOrEqual(44);
      expect(ctaBox.width).toBeGreaterThanOrEqual(44);
      expect(ctaBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('prefers-reduced-motion: reduce collapses transitions and keeps content immediately readable', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const heroHeading = page.getByRole('heading', {
      level: 1,
      name: 'Geoffrey Obwocha — Systems Architect & Full-Stack Product Engineer',
    });
    await expect(heroHeading).toBeVisible();

    const primaryCta = page.getByRole('link', { name: 'Start a Conversation' }).first();
    const transitionDuration = await primaryCta.evaluate(
      (el) => window.getComputedStyle(el).transitionDuration,
    );

    expect(['0s', '0.00001s', '1e-05s']).toContain(transitionDuration);

    const scrollBehavior = await page.evaluate(
      () => window.getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(scrollBehavior).toBe('auto');
  });

  for (const route of AXE_ROUTES) {
    test(`WCAG 2.1 AA axe-core audit passes with zero violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('main#main-content h1')).toBeVisible();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
