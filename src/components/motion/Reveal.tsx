import { type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type RevealStagger = 1 | 2 | 3 | 4;
export type RevealTag = 'div' | 'section' | 'article' | 'header' | 'footer' | 'aside';

export interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  readonly children: ReactNode;
  readonly stagger?: RevealStagger;
  readonly as?: RevealTag;
  readonly threshold?: number;
  readonly rootMargin?: string;
}

/**
 * Reduced-motion-compliant progressive reveal container.
 *
 * - Uses GPU-composited `.reveal-up` and `.stagger-*` classes (`opacity` and `transform` only).
 * - Never hides content from crawlers, screen readers, or keyboard focus (`aria-hidden`,
 *   `visibility: hidden`, and `display: none` are never applied).
 * - When `prefers-reduced-motion: reduce` is active or `IntersectionObserver` is unavailable,
 *   renders immediately in its final visible state with zero delay.
 */
export function Reveal({
  children,
  stagger,
  as: Component = 'div',
  threshold = 0.1,
  rootMargin = '0px 0px -5% 0px',
  className,
  ...rest
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const canObserve =
    !prefersReducedMotion &&
    typeof window !== 'undefined' &&
    typeof window.IntersectionObserver === 'function';

  const [hasIntersected, setHasIntersected] = useState<boolean>(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const isVisible = !canObserve || hasIntersected;

  useEffect(() => {
    if (!canObserve || hasIntersected) {
      return undefined;
    }

    const element = elementRef.current;
    if (!element) {
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setHasIntersected(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [canObserve, hasIntersected, rootMargin, threshold]);

  const classList: string[] = [];

  if (canObserve) {
    classList.push('reveal-up');
    if (stagger !== undefined) {
      classList.push(`stagger-${stagger}`);
    }
    classList.push(isVisible ? 'reveal-visible' : 'reveal-pending');
  } else {
    classList.push('reveal-visible');
  }

  if (className) {
    classList.push(className);
  }

  const combinedClassName = classList.join(' ');

  return (
    <Component
      ref={(node: HTMLElement | null) => {
        elementRef.current = node;
      }}
      className={combinedClassName}
      data-reveal={isVisible ? 'visible' : 'pending'}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      {...rest}
    >
      {children}
    </Component>
  );
}
