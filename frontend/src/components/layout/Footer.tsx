import { Link } from 'react-router-dom';
import { FlaskConical, Mail } from 'lucide-react';
import { SUPPORT_EMAIL } from '../../config';

const columns = [
  {
    heading: 'Platform',
    links: [
      { label: 'Browse Opportunities', to: '/projects' },
      { label: 'Find Researchers', to: '/professors' },
      { label: 'For Students', to: '/signup?role=student' },
      { label: 'For Researchers & Labs', to: '/signup?role=professor' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Create an account', to: '/signup' },
      { label: 'Sign in', to: '/login' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-primary-600 rounded-lg p-1.5">
                <FlaskConical className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">Labyro</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              The marketplace where university students find research positions — and labs
              find their next great researcher.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                aria-label="Email us"
                className="inline-flex items-center gap-2 p-2 pr-3 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                <Mail className="h-4 w-4" /> Contact us
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Labyro. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">Built for the research community.</p>
        </div>
      </div>
    </footer>
  );
}
