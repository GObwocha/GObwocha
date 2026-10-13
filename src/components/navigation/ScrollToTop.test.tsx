import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, Link } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollToTop } from './ScrollToTop';

describe('ScrollToTop component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('resets window scroll position to (0, 0) and sets scrollTop to 0 on route navigation', () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    document.documentElement.scrollTop = 1200;
    document.body.scrollTop = 1200;

    render(
      <MemoryRouter initialEntries={['/work']}>
        <ScrollToTop />
        <div>Work Page</div>
      </MemoryRouter>,
    );

    expect(scrollToMock).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, left: 0, behavior: 'instant' }),
    );
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);
  });

  it('sets window.history.scrollRestoration to "manual" if supported', () => {
    window.scrollTo = vi.fn();
    Object.defineProperty(window.history, 'scrollRestoration', {
      value: 'auto',
      writable: true,
      configurable: true,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
      </MemoryRouter>,
    );

    expect(window.history.scrollRestoration).toBe('manual');
  });

  it('scrolls to hash element when hash is provided in route', () => {
    window.scrollTo = vi.fn();

    const targetElement = document.createElement('div');
    targetElement.id = 'main-content';
    const scrollIntoViewMock = vi.fn();
    targetElement.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(targetElement);

    render(
      <MemoryRouter initialEntries={['/#main-content']}>
        <ScrollToTop />
      </MemoryRouter>,
    );

    expect(scrollIntoViewMock).toHaveBeenCalled();
    document.body.removeChild(targetElement);
  });
});
