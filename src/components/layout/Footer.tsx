import { useState } from 'react';
import { Link, useLocation } from 'react-router';

const GMAIL_COMPOSE_URL =
  'https://mail.google.com/mail/?view=cm&fs=1&to=ondiekobwocha@gmail.com&su=Project%20Enquiry%20%E2%80%94%20Geoffrey%20Obwocha';

export function Footer() {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const handleNavClick = (to: string) => {
    if (typeof window !== 'undefined' && location.pathname === to) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const handleEmailClick = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText('ondiekobwocha@gmail.com').then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__identity">
          <p className="site-footer__owner">Geoffrey Obwocha — Nairobi, Kenya</p>
          <p className="site-footer__role">Systems Architect &amp; Full-Stack Product Engineer</p>
        </div>

        <nav aria-label="Footer navigation" className="site-footer__nav">
          <ul className="site-footer__links">
            <li>
              <Link
                to="/work"
                onClick={() => handleNavClick('/work')}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                Work
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                onClick={() => handleNavClick('/about')}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={() => handleNavClick('/contact')}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div className="site-footer__external">
          <a
            href={GMAIL_COMPOSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleEmailClick}
            className="site-footer__external-link"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {copied ? 'ondiekobwocha@gmail.com (Copied!)' : 'ondiekobwocha@gmail.com'}
          </a>
          <a
            href="https://github.com/GObwocha"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__external-link"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            GitHub
          </a>
          <a
            href="https://www.instagram.com/g_obwocha_dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__external-link"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/in/geoffrey-obwocha/"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__external-link"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
