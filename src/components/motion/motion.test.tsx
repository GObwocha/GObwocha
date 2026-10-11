import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import type { AxeMatchers } from 'vitest-axe/matchers';
import * as axeMatchers from 'vitest-axe/matchers';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from './Reveal';
import {
  getInitialReducedMotion,
  REDUCED_MOTION_MEDIA_QUERY,
  useReducedMotion,
} from './useReducedMotion';

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */
declare module 'vitest' {
  interface Matchers<
    R extends void | Promise<void> = void | Promise<void>,
    T = unknown,
  > extends AxeMatchers {}
}
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type */

expect.extend(axeMatchers);

type MediaQueryChangeListener = (event: MediaQueryListEvent) => void;

interface MockMediaQueryController {
  readonly setMatches: (nextMatches: boolean) => void;
}

function installMatchMediaMock(initialMatches: boolean): MockMediaQueryController {
  let matches = initialMatches;
  const listeners = new Set<MediaQueryChangeListener>();

  const matchMediaMock = vi.fn((query: string): MediaQueryList => {
    const isReducedMotionQuery = query === REDUCED_MOTION_MEDIA_QUERY;

    return {
      get matches() {
        return isReducedMotionQuery ? matches : false;
      },
      media: query,
      onchange: null,
      addListener: vi.fn((listener: MediaQueryChangeListener) => {
        if (isReducedMotionQuery) {
          listeners.add(listener);
        }
      }),
      removeListener: vi.fn((listener: MediaQueryChangeListener) => {
        listeners.delete(listener);
      }),
      addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'change' && isReducedMotionQuery && typeof listener === 'function') {
          listeners.add(listener as MediaQueryChangeListener);
        }
      }),
      removeEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'change' && typeof listener === 'function') {
          listeners.delete(listener as MediaQueryChangeListener);
        }
      }),
      dispatchEvent: vi.fn(() => true),
    };
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: matchMediaMock,
  });

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const changeEvent = {
        matches: nextMatches,
        media: REDUCED_MOTION_MEDIA_QUERY,
      } as MediaQueryListEvent;

      for (const listener of listeners) {
        listener(changeEvent);
      }
    },
  };
}

interface MockIntersectionObserverController {
  readonly triggerIntersection: (isIntersecting: boolean) => void;
  readonly getObservedElements: () => readonly Element[];
  readonly disconnectSpy: ReturnType<typeof vi.fn>;
}

function installIntersectionObserverMock(): MockIntersectionObserverController {
  let activeCallback: IntersectionObserverCallback | null = null;
  const observedElements: Element[] = [];
  const disconnectSpy = vi.fn();

  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string;
    readonly scrollMargin: string = '0px';
    readonly thresholds: ReadonlyArray<number>;

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      activeCallback = callback;
      this.rootMargin = options?.rootMargin ?? '0px';
      const thresholdOption = options?.threshold ?? 0;
      this.thresholds = Array.isArray(thresholdOption) ? thresholdOption : [thresholdOption];
    }

    observe = (target: Element): void => {
      observedElements.push(target);
    };

    unobserve = vi.fn();

    disconnect = (): void => {
      disconnectSpy();
    };

    takeRecords = (): IntersectionObserverEntry[] => [];
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });

  return {
    triggerIntersection(isIntersecting: boolean) {
      if (!activeCallback || observedElements.length === 0) {
        return;
      }

      const entries = observedElements.map(
        (target) =>
          ({
            isIntersecting,
            intersectionRatio: isIntersecting ? 1 : 0,
            target,
            boundingClientRect: target.getBoundingClientRect(),
            intersectionRect: target.getBoundingClientRect(),
            rootBounds: null,
            time: Date.now(),
          }) as IntersectionObserverEntry,
      );

      activeCallback(entries, {} as IntersectionObserver);
    },
    getObservedElements() {
      return observedElements;
    },
    disconnectSpy,
  };
}

describe('Motion & Micro-Interactions (S4-T2)', () => {
  const originalMatchMedia = window.matchMedia;
  const originalIntersectionObserver = window.IntersectionObserver;

  beforeEach(() => {
    installMatchMediaMock(false);
    installIntersectionObserverMock();
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: originalIntersectionObserver,
    });
    vi.restoreAllMocks();
  });

  describe('useReducedMotion', () => {
    it('returns false when (prefers-reduced-motion: reduce) does not match', () => {
      installMatchMediaMock(false);

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);
    });

    it('returns true when (prefers-reduced-motion: reduce) matches and updates reactively on change', () => {
      const controller = installMatchMediaMock(true);

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(true);

      act(() => {
        controller.setMatches(false);
      });
      expect(result.current).toBe(false);

      act(() => {
        controller.setMatches(true);
      });
      expect(result.current).toBe(true);
    });

    it('defaults safely to false when window.matchMedia is unavailable', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      expect(getInitialReducedMotion()).toBe(false);
      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);
    });
  });

  describe('Reveal', () => {
    it('renders children immediately in final visible state without animation classes when reduced motion is enabled', async () => {
      installMatchMediaMock(true);
      const observerController = installIntersectionObserverMock();

      const { container } = render(
        <Reveal as="section" stagger={2} aria-label="Featured architecture section">
          <p>Immediate static editorial content</p>
        </Reveal>,
      );

      const region = screen.getByRole('region', { name: /featured architecture section/i });
      expect(region.tagName).toBe('SECTION');
      expect(region).toHaveAttribute('data-reveal', 'visible');
      expect(region).toHaveAttribute('data-reduced-motion', 'true');
      expect(region).toHaveClass('reveal-visible');
      expect(region).not.toHaveClass('reveal-up');
      expect(region).not.toHaveClass('stagger-2');
      expect(observerController.getObservedElements()).toHaveLength(0);
      expect(screen.getByText('Immediate static editorial content')).toBeInTheDocument();

      expect(await axe(container)).toHaveNoViolations();
    });

    it('applies GPU-safe reveal classes in standard motion mode and transitions to visible when IntersectionObserver intersects', async () => {
      installMatchMediaMock(false);
      const observerController = installIntersectionObserverMock();

      const { container } = render(
        <Reveal as="div" stagger={3} data-testid="reveal-wrapper">
          <p>Progressive reveal content</p>
        </Reveal>,
      );

      const wrapper = screen.getByTestId('reveal-wrapper');
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper).toHaveClass('reveal-up', 'stagger-3', 'reveal-pending');
      expect(wrapper).toHaveAttribute('data-reveal', 'pending');
      expect(wrapper).toHaveAttribute('data-reduced-motion', 'false');
      expect(observerController.getObservedElements()).toHaveLength(1);

      act(() => {
        observerController.triggerIntersection(true);
      });

      expect(wrapper).toHaveAttribute('data-reveal', 'visible');
      expect(wrapper).toHaveClass('reveal-up', 'stagger-3', 'reveal-visible');
      expect(observerController.disconnectSpy).toHaveBeenCalled();

      expect(await axe(container)).toHaveNoViolations();
    });

    it('preserves keyboard focusability and accessibility of child interactive elements before and after intersection', async () => {
      const user = userEvent.setup();
      installMatchMediaMock(false);
      installIntersectionObserverMock();

      const { container } = render(
        <Reveal as="div" stagger={1} data-testid="interactive-reveal">
          <a href="/work">Explore Selected Work</a>
          <button type="button">Trigger Action</button>
        </Reveal>,
      );

      const wrapper = screen.getByTestId('interactive-reveal');
      expect(wrapper).not.toHaveAttribute('aria-hidden');
      expect(wrapper).not.toHaveAttribute('hidden');

      const link = screen.getByRole('link', { name: /explore selected work/i });
      const button = screen.getByRole('button', { name: /trigger action/i });

      await user.tab();
      expect(link).toHaveFocus();

      await user.tab();
      expect(button).toHaveFocus();

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('SectionHeader', () => {
    it('renders semantic three-tier editorial heading structure, optional actions, and passes vitest-axe with zero violations', async () => {
      const { container } = render(
        <section aria-labelledby="work-section-heading">
          <SectionHeader
            id="work-section-heading"
            eyebrow="01 // Selected Work"
            title="Featured Engineering Case Studies"
            lead="Production systems examined through problem context, architectural trade-offs, and verified outcomes."
            actions={<a href="/work">View All Case Studies</a>}
          />
        </section>,
      );

      expect(screen.getByText('01 // Selected Work')).toHaveClass('eyebrow', 'section-eyebrow');

      const heading = screen.getByRole('heading', {
        level: 2,
        name: /featured engineering case studies/i,
      });
      expect(heading).toHaveAttribute('id', 'work-section-heading');
      expect(heading).toHaveClass('text-h2', 'section-header__title');

      expect(screen.getByText(/production systems examined through problem context/i)).toHaveClass(
        'text-body-lg',
        'section-lead',
      );

      expect(screen.getByRole('link', { name: /view all case studies/i })).toHaveAttribute(
        'href',
        '/work',
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
