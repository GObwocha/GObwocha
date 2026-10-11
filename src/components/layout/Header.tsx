import { Link } from 'react-router';
import { Navigation } from '../navigation/Navigation';

export function Header() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-brand" style={{ minHeight: '44px', minWidth: '44px' }}>
            Geoffrey Obwocha
          </Link>
          <Navigation />
        </div>
      </header>
    </>
  );
}
