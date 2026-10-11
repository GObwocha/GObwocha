import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-heading" className="not-found-section">
      <p className="section-eyebrow">Error 404 // Route Not Found</p>
      <h1 id="not-found-heading">Page Not Found</h1>
      <p className="not-found-description">
        The requested route or case study does not exist or may have moved. Use the recovery links
        below to return to the home page or browse verified engineering case studies.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="cta-primary" style={{ minHeight: '44px', minWidth: '44px' }}>
          Return to Home
        </Link>
        <Link to="/work" className="cta-secondary" style={{ minHeight: '44px', minWidth: '44px' }}>
          Explore Selected Work
        </Link>
      </div>
    </section>
  );
}
