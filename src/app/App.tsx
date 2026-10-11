import { Route, Routes } from 'react-router';
import { RootLayout } from '../components/layout/RootLayout';
import { AboutPage } from '../routes/about/AboutPage';
import { ContactPage } from '../routes/contact/ContactPage';
import { HomePage } from '../routes/home/HomePage';
import { NotFoundPage } from '../routes/not-found/NotFoundPage';
import { ProjectDetailPage } from '../routes/project-detail/ProjectDetailPage';
import { WorkPage } from '../routes/work/WorkPage';

export function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/work/:slug" element={<ProjectDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
