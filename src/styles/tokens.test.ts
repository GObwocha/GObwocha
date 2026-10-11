import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const stylesDir = resolve(process.cwd(), 'src/styles');
const tokensCss = readFileSync(resolve(stylesDir, 'tokens.css'), 'utf8');
const typographyCss = readFileSync(resolve(stylesDir, 'typography.css'), 'utf8');
const motionCss = readFileSync(resolve(stylesDir, 'motion.css'), 'utf8');
const globalsCss = readFileSync(resolve(stylesDir, 'globals.css'), 'utf8');

/**
 * Extracts CSS custom property values from a specific selector block.
 */
function extractVariablesFromBlock(
  css: string,
  blockSelectorFragment: string,
): Record<string, string> {
  const escaped = blockSelectorFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const blockRegex = new RegExp(`${escaped}[^{]*\\{([\\s\\S]*?)\\}`, 'i');
  const match = css.match(blockRegex);
  if (!match || !match[1]) {
    throw new Error(`Could not find CSS block matching: ${blockSelectorFragment}`);
  }

  const vars: Record<string, string> = {};
  const propRegex = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let propMatch = propRegex.exec(match[1]);
  while (propMatch !== null) {
    const key = propMatch[1];
    const value = propMatch[2];
    if (key && value) {
      vars[key.trim()] = value.trim();
    }
    propMatch = propRegex.exec(match[1]);
  }
  return vars;
}

/**
 * Computes W3C WCAG 2.1 relative luminance for a 6-digit hex color.
 * Formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(hex: string): number {
  const normalized = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid 6-digit hex color: ${hex}`);
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;

  const toLinear = (channel: number): number =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Computes WCAG 2.1 contrast ratio between two hex colors: (L1 + 0.05) / (L2 + 0.05).
 */
function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const lumA = getRelativeLuminance(foregroundHex);
  const lumB = getRelativeLuminance(backgroundHex);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('S1-T2 Design Tokens & Global Styles Architecture', () => {
  describe('Color Polarity & WCAG 2.1 AA Contrast Verification (tokens.css)', () => {
    const darkVars = extractVariablesFromBlock(tokensCss, ':root');
    const lightVars = extractVariablesFromBlock(tokensCss, "[data-theme='light']");

    it('never uses pure black or pure white hex values in any theme', () => {
      const forbiddenHexPattern = /#(?:000000|ffffff|000\b|fff\b)/i;
      expect(tokensCss).not.toMatch(forbiddenHexPattern);
      expect(typographyCss).not.toMatch(forbiddenHexPattern);
      expect(motionCss).not.toMatch(forbiddenHexPattern);
      expect(globalsCss).not.toMatch(forbiddenHexPattern);
    });

    it('defines all required Dark theme (Warm Obsidian) color tokens', () => {
      expect(darkVars['--color-bg-primary']?.toLowerCase()).toBe('#0a0a09');
      expect(darkVars['--color-bg-elevated']?.toLowerCase()).toBe('#121210');
      expect(darkVars['--color-bg-subtle']?.toLowerCase()).toBe('#181815');
      expect(darkVars['--color-text-primary']?.toLowerCase()).toBe('#f5f3ee');
      expect(darkVars['--color-text-secondary']?.toLowerCase()).toBe('#b8b3a8');
      expect(darkVars['--color-text-tertiary']?.toLowerCase()).toBe('#8a857a');
      expect(darkVars['--color-accent']?.toLowerCase()).toBe('#ff4d1c');
      expect(darkVars['--color-accent-hover']?.toLowerCase()).toBe('#ff6a40');
      expect(darkVars['--color-accent-contrast']?.toLowerCase()).toBe('#0a0a09');
      expect(darkVars['--color-border']?.toLowerCase()).toBe('#262522');
      expect(darkVars['--color-border-strong']?.toLowerCase()).toBe('#3d3b36');
      expect(darkVars['--color-status-success']?.toLowerCase()).toBe('#34d399');
      expect(darkVars['--color-status-error']?.toLowerCase()).toBe('#f87171');
      expect(darkVars['--color-status-warning']?.toLowerCase()).toBe('#fbbf24');
    });

    it('defines all required Light theme (Archival Stone) color tokens', () => {
      expect(lightVars['--color-bg-primary']?.toLowerCase()).toBe('#f5f3ee');
      expect(lightVars['--color-bg-elevated']?.toLowerCase()).toBe('#faf8f5');
      expect(lightVars['--color-bg-subtle']?.toLowerCase()).toBe('#eae6dd');
      expect(lightVars['--color-text-primary']?.toLowerCase()).toBe('#0a0a09');
      expect(lightVars['--color-text-secondary']?.toLowerCase()).toBe('#3d3b36');
      expect(lightVars['--color-text-tertiary']?.toLowerCase()).toBe('#5c5850');
      expect(lightVars['--color-accent']?.toLowerCase()).toBe('#c83208');
      expect(lightVars['--color-accent-hover']?.toLowerCase()).toBe('#a62604');
      expect(lightVars['--color-accent-contrast']?.toLowerCase()).toBe('#faf8f5');
      expect(lightVars['--color-border']?.toLowerCase()).toBe('#d8d3c8');
      expect(lightVars['--color-border-strong']?.toLowerCase()).toBe('#b8b3a8');
      expect(lightVars['--color-status-success']?.toLowerCase()).toBe('#047857');
      expect(lightVars['--color-status-error']?.toLowerCase()).toBe('#b91c1c');
      expect(lightVars['--color-status-warning']?.toLowerCase()).toBe('#b45309');
    });

    it('mathematically verifies WCAG 2.1 AA contrast (>= 4.5:1) for all Dark theme foreground/background pairs', () => {
      const darkBackgrounds = [
        darkVars['--color-bg-primary']!,
        darkVars['--color-bg-elevated']!,
        darkVars['--color-bg-subtle']!,
      ];
      const darkForegrounds = [
        darkVars['--color-text-primary']!,
        darkVars['--color-text-secondary']!,
        darkVars['--color-text-tertiary']!,
        darkVars['--color-accent']!,
        darkVars['--color-accent-hover']!,
        darkVars['--color-status-success']!,
        darkVars['--color-status-error']!,
        darkVars['--color-status-warning']!,
      ];

      for (const bg of darkBackgrounds) {
        for (const fg of darkForegrounds) {
          const ratio = getContrastRatio(fg, bg);
          expect(ratio).toBeGreaterThanOrEqual(4.5);
        }
      }

      // Verify button label contrast on accent fill
      const ctaContrast = getContrastRatio(
        darkVars['--color-accent-contrast']!,
        darkVars['--color-accent']!,
      );
      expect(ctaContrast).toBeGreaterThanOrEqual(4.5);
    });

    it('mathematically verifies WCAG 2.1 AA contrast (>= 4.5:1) for all Light theme foreground/background pairs', () => {
      const lightBackgrounds = [
        lightVars['--color-bg-primary']!,
        lightVars['--color-bg-elevated']!,
      ];
      const lightForegrounds = [
        lightVars['--color-text-primary']!,
        lightVars['--color-text-secondary']!,
        lightVars['--color-text-tertiary']!,
        lightVars['--color-accent']!,
        lightVars['--color-accent-hover']!,
        lightVars['--color-status-success']!,
        lightVars['--color-status-error']!,
        lightVars['--color-status-warning']!,
      ];

      for (const bg of lightBackgrounds) {
        for (const fg of lightForegrounds) {
          const ratio = getContrastRatio(fg, bg);
          expect(ratio).toBeGreaterThanOrEqual(4.5);
        }
      }

      // Verify primary, secondary, and tertiary text on subtle background (#EAE6DD)
      expect(
        getContrastRatio(lightVars['--color-text-primary']!, lightVars['--color-bg-subtle']!),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        getContrastRatio(lightVars['--color-text-secondary']!, lightVars['--color-bg-subtle']!),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        getContrastRatio(lightVars['--color-text-tertiary']!, lightVars['--color-bg-subtle']!),
      ).toBeGreaterThanOrEqual(4.5);

      // Verify button label contrast on light-mode accent fill
      const ctaContrast = getContrastRatio(
        lightVars['--color-accent-contrast']!,
        lightVars['--color-accent']!,
      );
      expect(ctaContrast).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Fluid Spacing, Grid & Touch Ergonomics Tokens (tokens.css)', () => {
    const rootVars = extractVariablesFromBlock(tokensCss, ':root');

    it('defines fluid spacing tokens (--space-1 through --space-16 and --space-section)', () => {
      for (let i = 1; i <= 16; i += 1) {
        expect(rootVars[`--space-${i}`]).toBeDefined();
      }
      expect(rootVars['--space-section']).toBe('clamp(4rem, 8vw, 9rem)');
      expect(rootVars['--space-16']).toContain('clamp(');
    });

    it('defines container, 12-column grid, focus ring, radius, and z-index tokens', () => {
      expect(rootVars['--container-max']).toBe('1680px');
      expect(rootVars['--container-reading']).toBe('65ch');
      expect(rootVars['--container-gutter']).toBe('clamp(1.25rem, 4vw, 4rem)');
      expect(rootVars['--grid-columns']).toBe('12');
      expect(rootVars['--grid-gap']).toBe('clamp(1rem, 2vw, 2rem)');
      expect(rootVars['--touch-target-min']).toBe('44px');
      expect(rootVars['--touch-target-gap']).toBe('8px');
      expect(rootVars['--focus-ring-width']).toBe('2px');
      expect(rootVars['--focus-ring-offset']).toBe('3px');
      expect(rootVars['--focus-ring-color']).toBe('var(--color-accent)');
      expect(rootVars['--radius-xs']).toBe('2px');
      expect(rootVars['--radius-sm']).toBe('4px');
      expect(rootVars['--radius-md']).toBe('8px');
      expect(rootVars['--radius-pill']).toBe('9999px');
      expect(rootVars['--z-skip-link']).toBe('1000');
      expect(rootVars['--z-header']).toBe('100');
      expect(rootVars['--z-drawer']).toBe('200');
      expect(rootVars['--z-modal']).toBe('300');
    });
  });

  describe('Fluid Typography System (typography.css)', () => {
    const typeVars = extractVariablesFromBlock(typographyCss, ':root');

    it('defines the three-voice architectural font stacks and fluid clamp() scale', () => {
      expect(typeVars['--font-display']).toContain("'Syne'");
      expect(typeVars['--font-sans']).toContain("'Plus Jakarta Sans'");
      expect(typeVars['--font-mono']).toContain("'JetBrains Mono'");

      const fluidTokens = [
        '--text-display-hero',
        '--text-display-xl',
        '--text-h1',
        '--text-h2',
        '--text-h3',
        '--text-body-lg',
        '--text-body',
        '--text-sm',
        '--text-xs',
      ];
      for (const token of fluidTokens) {
        expect(typeVars[token]).toMatch(/^clamp\(/);
      }
    });

    it('enforces negative display tracking, 1.62 body line-height, text-wrap: balance, and tabular-nums', () => {
      expect(typographyCss).toContain('-0.04em');
      expect(typographyCss).toContain('1.62');
      expect(typographyCss).toContain('text-wrap: balance');
      expect(typographyCss).toContain('font-variant-numeric: tabular-nums');

      const utilityClasses = [
        '.text-display-hero',
        '.text-h1',
        '.text-h2',
        '.text-h3',
        '.text-body-lg',
        '.text-mono-label',
        '.eyebrow',
      ];
      for (const className of utilityClasses) {
        expect(typographyCss).toContain(className);
      }
    });
  });

  describe('Motion & Reduced-Motion Choreography (motion.css)', () => {
    const motionVars = extractVariablesFromBlock(motionCss, ':root');

    it('defines custom cubic-bezier curves and duration scale without linear or default ease timings', () => {
      expect(motionVars['--ease-out-expo']).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
      expect(motionVars['--ease-out-quart']).toBe('cubic-bezier(0.25, 1, 0.5, 1)');
      expect(motionVars['--ease-in-out-expo']).toBe('cubic-bezier(0.87, 0, 0.13, 1)');
      expect(motionVars['--duration-fast']).toBe('180ms');
      expect(motionVars['--duration-base']).toBe('320ms');
      expect(motionVars['--duration-slow']).toBe('600ms');
      expect(motionVars['--duration-reveal']).toBe('750ms');

      expect(motionCss).not.toMatch(/:\s*linear\b/i);
      expect(motionCss).not.toMatch(/:\s*ease\s*;/i);
    });

    it('provides GPU-composited reveal classes and a first-class @media (prefers-reduced-motion: reduce) safeguard', () => {
      expect(motionCss).toContain('.reveal-up');
      expect(motionCss).toContain('.stagger-1');
      expect(motionCss).toContain('.stagger-2');
      expect(motionCss).toContain('.stagger-3');
      expect(motionCss).toContain('.stagger-4');
      expect(motionCss).toContain('@media (prefers-reduced-motion: reduce)');
      expect(motionCss).toContain('0.01ms !important');
      expect(motionCss).toContain('scroll-behavior: auto !important');
    });
  });

  describe('Global Reset, Accessibility & Responsive Layout Primitives (globals.css)', () => {
    it('imports tokens.css, typography.css, and motion.css and prevents horizontal overflow across viewports', () => {
      expect(globalsCss).toContain("@import './tokens.css';");
      expect(globalsCss).toContain("@import './typography.css';");
      expect(globalsCss).toContain("@import './motion.css';");
      expect(globalsCss).toContain('box-sizing: border-box');
      expect(globalsCss).toContain('overflow-x: clip');
      expect(globalsCss).toContain('::selection');
    });

    it('defines accessible :focus-visible rings, .skip-link, and 44x44px minimum interactive primitives', () => {
      expect(globalsCss).toContain(':focus-visible');
      expect(globalsCss).toContain('outline: 2px solid var(--focus-ring-color)');
      expect(globalsCss).toContain('outline-offset: 3px');
      expect(globalsCss).toContain('.skip-link');
      expect(globalsCss).toContain('.btn');
      expect(globalsCss).toContain('.btn-primary');
      expect(globalsCss).toContain('.btn-secondary');
      expect(globalsCss).toContain('.input-field');
      expect(globalsCss).toContain('.container');
      expect(globalsCss).toContain('.editorial-grid');
      expect(globalsCss).toContain('min-height: 44px');
      expect(globalsCss).toContain('min-width: 44px');
    });
  });
});
