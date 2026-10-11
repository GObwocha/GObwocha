import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { AxeMatchers } from 'vitest-axe/matchers';
import * as axeMatchers from 'vitest-axe/matchers';
import { App } from '../app/App';
import { getFeaturedProjects, getProjectBySlug } from '../data/projects';
import { siteConfig } from '../data/site';

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends AxeMatchers {}
}
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */

expect.extend(axeMatchers);

function renderRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );
}

describe('Sprint 2 Route Implementations (S2-T1, S2-T4, S2-T5)', () => {
  describe('HomePage (S2-T1)', () => {
    it('renders the hero value proposition, primary CTA to /contact, secondary CTA to /work, featured projects with width/height attributes, capabilities pillars, and passes axe', async () => {
      const { container } = renderRoute('/');
      const main = screen.getByRole('main');

      // Single H1 with owner name & role
      const h1 = within(main).getByRole('heading', {
        level: 1,
        name: /geoffrey obwocha — systems architect & full-stack product engineer/i,
      });
      expect(h1).toBeInTheDocument();

      // Location, timezone, and value proposition
      expect(within(main).getByText(/nairobi, kenya \/\/ eat \(utc\+3\)/i)).toBeInTheDocument();
      expect(within(main).getByText(siteConfig.valueProposition)).toBeInTheDocument();
      expect(within(main).getByText(siteConfig.availability)).toBeInTheDocument();

      // Primary and secondary CTAs in hero
      const startConversationLink = within(main).getByRole('link', {
        name: /start a conversation/i,
      });
      expect(startConversationLink).toHaveAttribute('href', '/contact');

      const exploreWorkLink = within(main).getByRole('link', { name: /explore selected work/i });
      expect(exploreWorkLink).toHaveAttribute('href', '/work');

      // Featured projects with aspect-ratio-locked images (width=800, height=500)
      const featuredProjects = getFeaturedProjects();
      expect(featuredProjects.length).toBeGreaterThanOrEqual(4);

      for (const project of featuredProjects) {
        const projectLink = within(main).getByRole('link', {
          name: new RegExp(`${project.title} — ${project.subtitle}`, 'i'),
        });
        expect(projectLink).toHaveAttribute('href', `/work/${project.slug}`);

        const projectImg = within(main).getByAltText(project.altText);
        expect(projectImg).toHaveAttribute('width', '800');
        expect(projectImg).toHaveAttribute('height', '500');
        expect(projectImg).toHaveAttribute('loading', 'lazy');
      }

      // View All 7 Case Studies link
      const viewAllLink = within(main).getByRole('link', { name: /view all 7 case studies/i });
      expect(viewAllLink).toHaveAttribute('href', '/work');

      // Capability pillars from siteConfig
      for (const pillar of siteConfig.capabilities) {
        expect(
          within(main).getByRole('heading', { level: 3, name: pillar.title }),
        ).toBeInTheDocument();
      }

      // Automated axe check
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('ProjectDetailPage (S2-T4)', () => {
    it('renders complete Halisi case study at /work/halisi-app with teammate credits and GitHub links for Collins Kimanzi, Ndegwa Waudo, and Dennis Kuria', async () => {
      const { container } = renderRoute('/work/halisi-app');
      const halisi = getProjectBySlug('halisi-app');
      expect(halisi).toBeDefined();

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /halisi — ai-powered brand impersonation & m-pesa fraud detection/i,
        }),
      ).toBeInTheDocument();

      expect(screen.getByRole('link', { name: /back to selected work/i })).toHaveAttribute(
        'href',
        '/work',
      );

      // Cover image dimensions
      const coverImg = screen.getByAltText(halisi!.altText);
      expect(coverImg).toHaveAttribute('width', '1200');
      expect(coverImg).toHaveAttribute('height', '750');

      // Teammate acknowledgements & GitHub profile links
      const teamSection = screen.getByRole('region', {
        name: /engineering team & co-contributors/i,
      });

      const collinsLink = within(teamSection).getByRole('link', { name: /kimanzi-collins/i });
      expect(collinsLink).toHaveAttribute('href', 'https://github.com/Kimanzi-Collins');
      expect(collinsLink).toHaveTextContent(/collins kimanzi/i);

      const ndegwaLink = within(teamSection).getByRole('link', { name: /sigangandegwa/i });
      expect(ndegwaLink).toHaveAttribute('href', 'https://github.com/sigangandegwa');
      expect(ndegwaLink).toHaveTextContent(/ndegwa waudo/i);

      expect(within(teamSection).getByText(/dennis kuria/i)).toBeInTheDocument();

      // Problem, Process, and Solution/Outcomes sections
      expect(
        screen.getByRole('heading', { level: 2, name: /01 \/\/ problem & context/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /02 \/\/ engineering process & architecture/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: /03 \/\/ solution & verified outcomes/i,
        }),
      ).toBeInTheDocument();

      expect(await axe(container)).toHaveNoViolations();
    });

    it('renders GreenRoute case study at /work/greenroute with teammate GitHub links for Benson Mose (Bemos26) and Timothy Mwita (Tim-cm)', async () => {
      const { container } = renderRoute('/work/greenroute');

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /greenroute — eco-routing & carbon-aware navigation engine for nairobi/i,
        }),
      ).toBeInTheDocument();

      const teamSection = screen.getByRole('region', {
        name: /engineering team & co-contributors/i,
      });

      const bensonLink = within(teamSection).getByRole('link', { name: /bemos26/i });
      expect(bensonLink).toHaveAttribute('href', 'https://github.com/Bemos26');
      expect(bensonLink).toHaveTextContent(/benson mose/i);

      const timothyLink = within(teamSection).getByRole('link', { name: /tim-cm/i });
      expect(timothyLink).toHaveAttribute('href', 'https://github.com/Tim-cm');
      expect(timothyLink).toHaveTextContent(/timothy mwita/i);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('renders SomaStar case study at /work/somastar with teammate GitHub link for Emmanuel Makori Obiero (Emmanuel-Makori-Obiero)', async () => {
      const { container } = renderRoute('/work/somastar');

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /somastar — adaptive learning & ai exam intelligence platform/i,
        }),
      ).toBeInTheDocument();

      const teamSection = screen.getByRole('region', {
        name: /engineering team & co-contributors/i,
      });

      const emmanuelLink = within(teamSection).getByRole('link', {
        name: /emmanuel-makori-obiero/i,
      });
      expect(emmanuelLink).toHaveAttribute('href', 'https://github.com/Emmanuel-Makori-Obiero');
      expect(emmanuelLink).toHaveTextContent(/emmanuel makori obiero/i);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('renders Kula-Kwa-Macho case study at /work/kula-kwa-macho with verified live deployment URL and repository link', async () => {
      const { container } = renderRoute('/work/kula-kwa-macho');

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /kula-kwa-macho — interactive kenyan food discovery & culinary platform/i,
        }),
      ).toBeInTheDocument();

      const liveLink = screen.getByRole('link', { name: /live deployment/i });
      expect(liveLink).toHaveAttribute('href', 'https://kula-kwa-macho-zeta.vercel.app');

      const repoLink = screen.getByRole('link', { name: /github repository/i });
      expect(repoLink).toHaveAttribute('href', 'https://github.com/GObwocha/Kula-Kwa-Macho');

      expect(await axe(container)).toHaveNoViolations();
    });

    it('renders NotFoundPage when navigating to an invalid project slug /work/invalid-slug', async () => {
      const { container } = renderRoute('/work/invalid-slug');

      expect(
        screen.getByRole('heading', { level: 1, name: /page not found/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /return to home/i })).toHaveAttribute('href', '/');

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('AboutPage (S2-T5)', () => {
    it('renders owner-verified biography, University of Nairobi & Chiromo Tech Club affiliation, working principles, and capability pillars with zero fabricated claims, and passes axe', async () => {
      const { container } = renderRoute('/about');
      const main = screen.getByRole('main');

      expect(
        within(main).getByRole('heading', { level: 1, name: /about geoffrey obwocha/i }),
      ).toBeInTheDocument();

      // Biography paragraphs from siteConfig
      for (const paragraph of siteConfig.biography) {
        expect(within(main).getByText(paragraph)).toBeInTheDocument();
      }

      // Academic & Engineering Community affiliation
      expect(
        within(main).getByRole('heading', {
          level: 2,
          name: /university of nairobi & chiromo tech club/i,
        }),
      ).toBeInTheDocument();
      expect(within(main).getAllByText(/university of nairobi/i).length).toBeGreaterThanOrEqual(1);
      expect(within(main).getAllByText(/chiromo tech club/i).length).toBeGreaterThanOrEqual(1);

      // Working principles
      for (const principle of siteConfig.workingPrinciples) {
        expect(
          within(main).getByRole('heading', { level: 3, name: principle.title }),
        ).toBeInTheDocument();
        expect(within(main).getByText(principle.description)).toBeInTheDocument();
      }

      // Capabilities & technical stack matrix
      for (const pillar of siteConfig.capabilities) {
        expect(
          within(main).getByRole('heading', { level: 3, name: pillar.title }),
        ).toBeInTheDocument();
      }

      // Direct contact & GitHub CTA links inside main content
      expect(within(main).getByRole('link', { name: /start a conversation/i })).toHaveAttribute(
        'href',
        '/contact',
      );
      expect(within(main).getByRole('link', { name: /explore github/i })).toHaveAttribute(
        'href',
        'https://github.com/GObwocha',
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
