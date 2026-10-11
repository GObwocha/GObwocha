import type { ReactNode } from 'react';

export interface PageContainerProps {
  readonly children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main id="main-content" tabIndex={-1} className="page-container">
      {children}
    </main>
  );
}
