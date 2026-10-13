import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

// Isomorphic layout effect executes synchronously before browser paint on client,
// but degrades safely to useEffect during SSR pre-rendering without warnings.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * ScrollToTop component ensures that when navigating across routes,
 * the visitor is always brought to the top of the navigated page (x: 0, y: 0),
 * or directly to the target element if an in-page hash anchor is provided.
 */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  // Disable browser automatic scroll restoration so our application deterministically manages scroll
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // If navigating to an in-page anchor hash (e.g. #main-content), scroll to that element
    if (hash) {
      const targetId = hash.replace(/^#/, '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView();
        return;
      }
    }

    // Bring the user to the top of the navigated page instantly before paint
    const html = document.documentElement;
    const previousScrollBehavior = html?.style.scrollBehavior;
    if (html) {
      html.style.scrollBehavior = 'auto';
    }

    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    } catch {
      window.scrollTo(0, 0);
    }

    if (html) {
      html.scrollTop = 0;
      html.style.scrollBehavior = previousScrollBehavior;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search, hash]);

  return null;
}
