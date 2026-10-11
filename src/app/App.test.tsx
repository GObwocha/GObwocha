import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App baseline shell', () => {
  it('renders the main landmark and primary heading on the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: /geoffrey obwocha/i }),
    ).toBeInTheDocument();
  });

  it('renders the 404 view for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument();
  });
});
