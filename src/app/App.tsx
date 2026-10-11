import { Routes, Route } from 'react-router';

function HomeView() {
  return (
    <main id="main-content">
      <h1>Geoffrey Obwocha</h1>
      <p>Systems Architect &amp; Full-Stack Product Engineer</p>
    </main>
  );
}

function NotFoundView() {
  return (
    <main id="main-content">
      <h1>Page Not Found</h1>
      <p>The requested page could not be found.</p>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}
