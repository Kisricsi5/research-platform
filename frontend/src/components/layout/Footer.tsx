import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary-600 rounded-lg p-1.5">
                <FlaskConical className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">ResearchBridge</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              Connecting university students with professors for meaningful research opportunities.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/professors" className="text-sm text-gray-500 hover:text-gray-900">Browse Professors</Link></li>
              <li><Link to="/projects" className="text-sm text-gray-500 hover:text-gray-900">Browse Projects</Link></li>
              <li><Link to="/signup" className="text-sm text-gray-500 hover:text-gray-900">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Info</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">About</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} ResearchBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
