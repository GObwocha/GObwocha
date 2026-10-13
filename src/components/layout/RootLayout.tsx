import { Outlet } from 'react-router';
import { ScrollToTop } from '../navigation/ScrollToTop';
import { Footer } from './Footer';
import { Header } from './Header';
import { PageContainer } from './PageContainer';

export function RootLayout() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header />
      <PageContainer>
        <Outlet />
      </PageContainer>
      <Footer />
    </div>
  );
}
