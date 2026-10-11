import { Outlet } from 'react-router';
import { Footer } from './Footer';
import { Header } from './Header';
import { PageContainer } from './PageContainer';

export function RootLayout() {
  return (
    <div className="app-shell">
      <Header />
      <PageContainer>
        <Outlet />
      </PageContainer>
      <Footer />
    </div>
  );
}
