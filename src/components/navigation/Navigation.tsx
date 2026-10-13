import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly end?: boolean;
}

const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navigation() {
  const location = useLocation();
  const [openAtPathname, setOpenAtPathname] = useState<string | null>(null);
  const isOpen = openAtPathname === location.pathname;

  const handleToggle = () => {
    setOpenAtPathname((current) => (current === location.pathname ? null : location.pathname));
  };

  const handleClose = () => {
    setOpenAtPathname(null);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenAtPathname(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNavClick = (to: string) => {
    handleClose();
    if (typeof window !== 'undefined' && location.pathname === to) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav aria-label="Primary navigation" className="primary-nav">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={handleToggle}
        style={{ minHeight: '44px', minWidth: '44px' }}
      >
        <span className="mobile-nav-toggle__label">{isOpen ? 'Close' : 'Menu'}</span>
      </button>

      <div
        id="mobile-nav-drawer"
        className={`nav-drawer${isOpen ? ' nav-drawer--open' : ''}`}
        data-open={isOpen ? 'true' : 'false'}
      >
        <ul className="nav-list">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <li key={item.to} className="nav-list__item">
              <NavLink
                to={item.to}
                end={item.end}
                onClick={() => handleNavClick(item.to)}
                className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Link
          to="/contact"
          onClick={() => handleNavClick('/contact')}
          className="nav-cta"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          Start a Conversation
        </Link>
      </div>
    </nav>
  );
}
