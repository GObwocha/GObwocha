import fs from 'node:fs';
import path from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { AxeMatchers } from 'vitest-axe/matchers';
import * as axeMatchers from 'vitest-axe/matchers';
import {
  getAllProjectSlugs,
  getFeaturedProjects,
  getProjectBySlug,
  projects,
} from '../../data/projects';
import { WorkPage } from '../../routes/work/WorkPage';
import { ProjectCard } from './ProjectCard';
import { ProjectGrid } from './ProjectGrid';

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends AxeMatchers {}
}
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */

expect.extend(axeMatchers);

describe('ProjectCard and ProjectGrid components (S2-T2)', () => {
  it('renders ProjectCard with descriptive link, CLS-safe 800x500 image, technologies, and teammate credits', async () => {
    const halisi = getProjectBySlug('halisi-app');
    expect(halisi).toBeDefined();
    if (!halisi) return;

    const { container } = render(
      <MemoryRouter>
        <ProjectCard project={halisi} index={0} headingLevel="h3" />
      </MemoryRouter>,
    );

    // Tabular index and category
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText(halisi.category)).toBeInTheDocument();

    // Heading and descriptive case-study link
    const heading = screen.getByRole('heading', { level: 3 });
    const caseStudyLink = within(heading).getByRole('link', {
      name: new RegExp(`${halisi.title} — ${halisi.subtitle}`, 'i'),
    });
    expect(caseStudyLink).toHaveAttribute('href', `/work/${halisi.slug}`);
    expect(caseStudyLink).toHaveStyle({ minHeight: '44px', minWidth: '44px' });

    // CLS-safe image with explicit width/height and meaningful alt text
    const coverImg = screen.getByRole('img', { name: halisi.altText });
    expect(coverImg).toHaveAttribute('src', halisi.coverImage);
    expect(coverImg).toHaveAttribute('width', '800');
    expect(coverImg).toHaveAttribute('height', '500');
    expect(coverImg).toHaveAttribute('loading', 'lazy');
    expect(coverImg).toHaveAttribute('decoding', 'async');

    // Teammate acknowledgement rendered on the card
    const collaboratorsRegion = screen.getByLabelText(/halisi engineering collaborators/i);
    expect(collaboratorsRegion).toHaveTextContent(/Collins Kimanzi/i);
    expect(collaboratorsRegion).toHaveTextContent(/Ndegwa Waudo/i);
    expect(collaboratorsRegion).toHaveTextContent(/Dennis Kuria/i);
    expect(collaboratorsRegion).toHaveTextContent(/Chiromo Tech Club, University of Nairobi/i);

    // Technology tags
    const techList = screen.getByRole('list', { name: /halisi technologies/i });
    for (const tech of halisi.technologies) {
      expect(within(techList).getByText(tech)).toBeInTheDocument();
    }

    // Verified repository external link
    const repoLink = screen.getByRole('link', { name: /github repository — halisi/i });
    expect(repoLink).toHaveAttribute('href', 'https://github.com/sigangandegwa/HalisiApp');
    expect(repoLink).toHaveAttribute('target', '_blank');
    expect(repoLink).toHaveAttribute('rel', 'noopener noreferrer');

    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders live deployment link when liveUrl is defined and supports configurable headingLevel="h2"', () => {
    const kula = getProjectBySlug('kula-kwa-macho');
    expect(kula).toBeDefined();
    if (!kula) return;

    render(
      <MemoryRouter>
        <ProjectCard project={kula} index={2} headingLevel="h2" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Kula-Kwa-Macho/i);
    const liveLink = screen.getByRole('link', { name: /live deployment — kula-kwa-macho/i });
    expect(liveLink).toHaveAttribute('href', 'https://kula-kwa-macho-zeta.vercel.app');
    expect(liveLink).toHaveAttribute('target', '_blank');
    expect(liveLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders all 7 projects in ProjectGrid and renders accessible empty state when projects is empty', async () => {
    const { container, unmount } = render(
      <MemoryRouter>
        <ProjectGrid projects={projects} />
      </MemoryRouter>,
    );

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(7);
    expect(await axe(container)).toHaveNoViolations();

    unmount();

    const emptyRender = render(
      <MemoryRouter>
        <ProjectGrid projects={[]} />
      </MemoryRouter>,
    );

    const statusBox = screen.getByRole('status');
    expect(statusBox).toHaveTextContent(/no projects match the selected filter criteria/i);
    expect(await axe(emptyRender.container)).toHaveNoViolations();
  });

  it('renders WorkPage with all 7 projects and zero axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <WorkPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /selected work & engineering case studies/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(7);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Typed project content & SVG cover asset verification (S2-T3)', () => {
  const expectedSlugs = [
    'halisi-app',
    'greenroute',
    'kula-kwa-macho',
    'somastar',
    'geliscope',
    'email-analyzer',
    'ole-ken-hotel',
  ];

  it('contains all 7 verified projects with unique slugs and working lookup helpers', () => {
    expect(getAllProjectSlugs()).toEqual(expectedSlugs);
    expect(getFeaturedProjects().length).toBeGreaterThanOrEqual(3);

    for (const slug of expectedSlugs) {
      const project = getProjectBySlug(`  ${slug.toUpperCase()}  `);
      expect(project).toBeDefined();
      expect(project?.slug).toBe(slug);
    }

    expect(getProjectBySlug('non-existent-project')).toBeUndefined();
  });

  it('enforces complete narrative fields, teammate credits, and zero placeholder markers across all projects', () => {
    const serialized = JSON.stringify(projects);
    expect(serialized).not.toMatch(/TODO/i);
    expect(serialized).not.toContain('href="#"');
    expect(serialized).not.toContain('/images/placeholders/');

    for (const project of projects) {
      expect(project.title.length).toBeGreaterThan(2);
      expect(project.subtitle.length).toBeGreaterThan(10);
      expect(project.category.length).toBeGreaterThan(5);
      expect(project.summary.length).toBeGreaterThan(40);
      expect(project.problem.length).toBeGreaterThan(40);
      expect(project.role.length).toBeGreaterThan(10);
      expect(project.process.length).toBeGreaterThanOrEqual(3);
      expect(project.solution.length).toBeGreaterThan(40);
      expect(project.outcomes.length).toBeGreaterThanOrEqual(3);
      expect(project.technologies.length).toBeGreaterThanOrEqual(5);
      expect(project.altText.length).toBeGreaterThan(20);
      expect(project.seoTitle).toContain(project.title);
      expect(project.seoDescription.length).toBeGreaterThan(40);
      expect(project.ogImage).toBe(`/og/projects/${project.slug}.png`);
      expect(project.coverImage).toMatch(
        new RegExp(`^/images/projects/${project.slug}-cover\\.(png|svg)$`),
      );

      if (project.liveUrl) {
        expect(project.liveUrl).toMatch(/^https:\/\//);
      }
      if (project.repositoryUrl) {
        expect(project.repositoryUrl).toMatch(/^https:\/\/github\.com\//);
      }
    }

    // Verify specific collaborator acknowledgements
    const halisi = getProjectBySlug('halisi-app');
    expect(halisi?.teammates?.map((t) => t.name)).toEqual([
      'Collins Kimanzi',
      'Ndegwa Waudo',
      'Dennis Kuria',
    ]);

    const greenroute = getProjectBySlug('greenroute');
    expect(greenroute?.teammates?.map((t) => t.name)).toEqual(['Benson Mose', 'Timothy Mwita']);

    const somastar = getProjectBySlug('somastar');
    expect(somastar?.teammates?.map((t) => t.name)).toEqual(['Emmanuel Makori Obiero']);
  });

  it('verifies all 7 project cover illustrations/screenshots exist on disk with valid headers', () => {
    const publicDir = path.resolve(process.cwd(), 'public');

    for (const project of projects) {
      const relativeCoverPath = project.coverImage.replace(/^\//, '');
      const fullCoverPath = path.join(publicDir, relativeCoverPath);

      expect(fs.existsSync(fullCoverPath)).toBe(true);
      const stat = fs.statSync(fullCoverPath);
      expect(stat.size).toBeGreaterThan(500);

      if (project.coverImage.endsWith('.svg')) {
        const svgContent = fs.readFileSync(fullCoverPath, 'utf-8');
        expect(svgContent).toContain('viewBox="0 0 800 500"');
      } else {
        const header = fs.readFileSync(fullCoverPath).subarray(0, 12);
        const isPng = header
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
        const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
        const isWebp =
          header.subarray(0, 4).toString('ascii') === 'RIFF' &&
          header.subarray(8, 12).toString('ascii') === 'WEBP';
        expect(isPng || isJpeg || isWebp).toBe(true);
      }
    }
  });
});
