import { expect, test } from '@playwright/test';

const VERIFIED_PROJECT_TITLES = [
  'Halisi',
  'GreenRoute',
  'Kula-Kwa-Macho',
  'SomaStar',
  'GeliScope',
  'Email Analyzer',
  'The Ole~Ken Hotel',
] as const;

test.describe('Project Index, Case Study Deep Links, Collaborator Credits & Invalid Slugs', () => {
  test('/work renders all 7 verified project cards with reserved width and height image attributes', async ({
    page,
  }) => {
    await page.goto('/work');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Selected Work & Engineering Case Studies',
      }),
    ).toBeVisible();

    const cards = page.locator('article.work-card');
    await expect(cards).toHaveCount(7);

    for (const title of VERIFIED_PROJECT_TITLES) {
      await expect(page.getByRole('link', { name: new RegExp(`^${title} —`) })).toBeVisible();
    }

    const images = cards.locator('img.work-card__image');
    await expect(images).toHaveCount(7);

    for (let i = 0; i < 7; i += 1) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('width', '800');
      await expect(img).toHaveAttribute('height', '500');
      const altText = await img.getAttribute('alt');
      expect(altText?.trim().length).toBeGreaterThan(15);
    }
  });

  test('direct deep links to /work/halisi-app, /work/greenroute, /work/somastar, and /work/kula-kwa-macho render full case studies', async ({
    page,
  }) => {
    const deepLinks = [
      {
        path: '/work/halisi-app',
        heading: 'Halisi — AI-Powered Brand Impersonation & M-Pesa Fraud Detection',
      },
      {
        path: '/work/greenroute',
        heading: 'GreenRoute — Eco-Routing & Carbon-Aware Navigation Engine for Nairobi',
      },
      {
        path: '/work/somastar',
        heading: 'SomaStar — Adaptive Learning & AI Exam Intelligence Platform',
      },
      {
        path: '/work/kula-kwa-macho',
        heading: 'Kula-Kwa-Macho — Interactive Kenyan Food Discovery & Culinary Platform',
      },
    ] as const;

    for (const item of deepLinks) {
      await page.goto(item.path);
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: item.heading,
        }),
      ).toBeVisible();

      await expect(
        page.getByRole('heading', { level: 2, name: '01 // Problem & Context' }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { level: 2, name: '02 // Engineering Process & Architecture' }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { level: 2, name: '03 // Solution & Verified Outcomes' }),
      ).toBeVisible();

      const coverImg = page.locator('figure.case-study__cover img');
      await expect(coverImg).toHaveAttribute('width', '1200');
      await expect(coverImg).toHaveAttribute('height', '750');
    }
  });

  test('collaborator acknowledgements and GitHub profile links render accurately on Halisi, GreenRoute, and SomaStar', async ({
    page,
  }) => {
    await page.goto('/work/halisi-app');
    const halisiTeamList = page.getByRole('list', { name: 'Halisi engineering teammates' });
    await expect(halisiTeamList).toBeVisible();

    const collinsLink = halisiTeamList.getByRole('link', { name: /Collins Kimanzi/i });
    await expect(collinsLink).toHaveAttribute('href', 'https://github.com/Kimanzi-Collins');

    const ndegwaLink = halisiTeamList.getByRole('link', { name: /Ndegwa Waudo/i });
    await expect(ndegwaLink).toHaveAttribute('href', 'https://github.com/sigangandegwa');

    await expect(halisiTeamList.getByText('Dennis Kuria')).toBeVisible();

    await page.goto('/work/greenroute');
    const greenRouteTeamList = page.getByRole('list', { name: 'GreenRoute engineering teammates' });
    await expect(greenRouteTeamList).toBeVisible();

    const bensonLink = greenRouteTeamList.getByRole('link', { name: /Benson Mose/i });
    await expect(bensonLink).toHaveAttribute('href', 'https://github.com/Bemos26');

    const timothyLink = greenRouteTeamList.getByRole('link', { name: /Timothy Mwita/i });
    await expect(timothyLink).toHaveAttribute('href', 'https://github.com/Tim-cm');

    await page.goto('/work/somastar');
    const somaStarTeamList = page.getByRole('list', { name: 'SomaStar engineering teammates' });
    await expect(somaStarTeamList).toBeVisible();

    const emmanuelLink = somaStarTeamList.getByRole('link', { name: /Emmanuel Makori Obiero/i });
    await expect(emmanuelLink).toHaveAttribute('href', 'https://github.com/Emmanuel-Makori-Obiero');
  });

  test('invalid project slug /work/invalid-project-slug renders the 404 Page Not Found view', async ({
    page,
  }) => {
    await page.goto('/work/invalid-project-slug');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Page Not Found',
      }),
    ).toBeVisible();

    await expect(page.getByRole('link', { name: 'Return to Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Selected Work' })).toBeVisible();
  });
});
