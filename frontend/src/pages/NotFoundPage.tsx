import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="section-eyebrow">404</p>
        <h1 className="display text-3xl sm:text-4xl mb-4">Page not found</h1>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or may have moved — let's get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary">Back home</Link>
          <Link to="/projects" className="btn-secondary">Browse opportunities</Link>
        </div>
      </div>
    </Layout>
  );
}
