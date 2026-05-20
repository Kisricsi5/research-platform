import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, FlaskConical, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Notification } from '../../types';
import Avatar from '../ui/Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unread = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const dashboardPath = user?.role === 'STUDENT' ? '/student/dashboard' : '/professor/dashboard';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600 rounded-lg p-1.5">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">ResearchBridge</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/professors" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Browse Professors
            </Link>
            <Link to="/projects" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Browse Projects
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Notifications</span>
                        {unread > 0 && (
                          <button
                            onClick={() => {
                              api.patch('/notifications/read-all');
                              setNotifOpen(false);
                            }}
                            className="text-xs text-primary-600 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-6">No notifications</p>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n.id}
                              className={`px-4 py-3 ${!n.isRead ? 'bg-primary-50' : ''}`}
                            >
                              <p className="text-sm font-medium text-gray-900">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user.profile && 'firstName' in user.profile ? (
                      <Avatar
                        firstName={(user.profile as any).firstName}
                        lastName={(user.profile as any).lastName}
                        src={(user.profile as any).profilePicture}
                        size="sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-700">{user.email[0].toUpperCase()}</span>
                      </div>
                    )}
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        <span className="badge-blue mt-1">{user.role}</span>
                      </div>
                      <div className="py-1">
                        <Link
                          to={dashboardPath}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to={user.role === 'STUDENT' ? '/student/profile' : '/professor/profile'}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Edit Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary">Sign in</Link>
                <Link to="/signup" className="btn-primary">Get started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-2">
          <Link to="/professors" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">Browse Professors</Link>
          <Link to="/projects" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">Browse Projects</Link>
          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-700">Dashboard</Link>
              <button onClick={handleLogout} className="block py-2 text-sm text-red-600">Sign out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-secondary flex-1 justify-center">Sign in</Link>
              <Link to="/signup" className="btn-primary flex-1 justify-center">Get started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
