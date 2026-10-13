import { Link, useLocation } from 'react-router';
import { Navigation } from '../navigation/Navigation';

export function Header() {
  const location = useLocation();

  const handleBrandClick = () => {
    if (typeof window !== 'undefined' && location.pathname === '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link
            to="/"
            onClick={handleBrandClick}
            className="site-brand"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Geoffrey Obwocha
          </Link>
          <Navigation />
        </div>
      </header>
    </>
  );
}
