import { expect, test } from '@playwright/test';

test.describe('Contact Form Validation, Anti-Spam Timing & Honest Fallback State', () => {
  test('/contact renders labeled form fields and direct contact channels', async ({ page }) => {
    await page.goto('/contact');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Contact & Project Enquiries',
      }),
    ).toBeVisible();

    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Project Scope \/ Category/i)).toBeVisible();
    await expect(page.getByLabel(/Project Details & Timeline/i)).toBeVisible();

    const directChannelsSection = page.locator('section.contact-channels-section');
    const emailLink = directChannelsSection.getByRole('link', {
      name: 'ondiekobwocha@gmail.com',
    });
    await expect(emailLink).toHaveAttribute('href', 'mailto:ondiekobwocha@gmail.com');

    const githubLink = directChannelsSection.getByRole('link', {
      name: 'https://github.com/GObwocha',
    });
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/GObwocha');
  });

  test('submitting an empty or invalid form sets aria-invalid="true" and renders role="alert" errors without network requests', async ({
    page,
  }) => {
    const supabaseRequests: string[] = [];

    page.on('request', (req) => {
      if (req.url().includes('supabase') || req.url().includes('contact_submissions')) {
        supabaseRequests.push(req.url());
      }
    });

    await page.goto('/contact');

    await page.waitForTimeout(1600);

    await page.getByRole('button', { name: 'Send Enquiry' }).click();

    const nameInput = page.getByLabel(/Full Name/i);
    const emailInput = page.getByLabel(/Email Address/i);
    const messageInput = page.getByLabel(/Project Details & Timeline/i);

    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(messageInput).toHaveAttribute('aria-invalid', 'true');

    await expect(page.locator('#contact-name-error[role="alert"]')).toContainText(
      'Please enter your full name',
    );
    await expect(page.locator('#contact-email-error[role="alert"]')).toContainText(
      'Please enter a valid email address',
    );
    await expect(page.locator('#contact-message-error[role="alert"]')).toContainText(
      'Please share a few more project details',
    );

    expect(supabaseRequests).toEqual([]);
  });

  test('submitting a valid form without live Supabase credentials never fakes success and shows actionable mailto fallback', async ({
    page,
  }) => {
    await page.goto('/contact');

    await page.getByLabel(/Full Name/i).fill('Wanjiku Mwangi');
    await page.getByLabel(/Email Address/i).fill('wanjiku@nairobi-ventures.co.ke');
    await page.getByLabel(/Project Scope \/ Category/i).selectOption('systems-architecture');
    await page
      .getByLabel(/Project Details & Timeline/i)
      .fill(
        'We are building a regional fintech verification platform in Nairobi and would like to discuss architecture and Q3 delivery.',
      );

    await page.waitForTimeout(1600);

    await page.getByRole('button', { name: 'Send Enquiry' }).click();

    await expect(page.getByRole('heading', { name: 'Enquiry Received' })).toHaveCount(0);

    const errorBanner = page.locator('.contact-form__error-banner[role="alert"]');
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText('You can also send your enquiry directly via email at');

    const fallbackMailto = errorBanner.getByRole('link', { name: 'ondiekobwocha@gmail.com' });
    await expect(fallbackMailto).toHaveAttribute('href', 'mailto:ondiekobwocha@gmail.com');
  });
});
