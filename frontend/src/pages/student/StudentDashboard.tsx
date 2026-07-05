import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Bookmark, Search, Plus, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/Layout';
import { studentsApi } from '../../api/students';
import { applicationsApi } from '../../api/applications';
import { PageSpinner } from '../../components/ui/Spinner';
import { statusLabels, statusColors, timeAgo } from '../../utils';
import Avatar from '../../components/ui/Avatar';

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: studentsApi.getProfile,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications'],
    queryFn: applicationsApi.getMyApplications,
  });

  const { data: savedProfessors = [] } = useQuery({
    queryKey: ['saved-professors'],
    queryFn: studentsApi.getSavedProfessors,
  });

  if (profileLoading) return <DashboardLayout><PageSpinner /></DashboardLayout>;

  const pending = applications.filter((a) => a.status === 'PENDING').length;
  const accepted = applications.filter((a) => a.status === 'ACCEPTED').length;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="display text-3xl">
          Welcome back{profile ? `, ${profile.firstName}` : ''}
        </h1>
        <p className="text-gray-500 mt-2">Here's an overview of your research journey</p>
      </div>

      {/* Profile completion nudge */}
      {!user?.hasProfile && (
        <div className="card p-4 bg-amber-50 border-amber-200 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-900">Complete your profile</p>
            <p className="text-xs text-amber-700 mt-0.5">Add your skills and interests to get better recommendations and apply to research positions.</p>
          </div>
          <Link to="/student/profile" className="btn-primary flex-shrink-0">Complete Profile</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applications', value: applications.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Accepted', value: accepted, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Saved Profs', value: savedProfessors.length, icon: Bookmark, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${bg} mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/student/applications" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No applications yet</p>
              <Link to="/professors" className="btn-primary btn-sm mt-3 inline-flex">Browse Professors</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <Link key={app.id} to={`/student/applications/${app.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  {app.professor && (
                    <Avatar firstName={app.professor.firstName} lastName={app.professor.lastName} src={app.professor.profilePicture} size="sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {app.project?.title ?? `${app.professor?.firstName} ${app.professor?.lastName}'s lab`}
                    </p>
                    <p className="text-xs text-gray-500">{timeAgo(app.createdAt)}</p>
                  </div>
                  <span className={statusColors[app.status]}>{statusLabels[app.status]}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Saved Professors */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Saved Professors</h2>
            <Link to="/professors" className="text-xs text-primary-600 hover:underline">Browse more</Link>
          </div>
          {savedProfessors.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No saved professors</p>
              <Link to="/professors" className="btn-primary btn-sm mt-3 inline-flex">Discover Professors</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedProfessors.slice(0, 4).map((saved: any) => (
                <Link key={saved.id} to={`/professors/${saved.professor.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar firstName={saved.professor.firstName} lastName={saved.professor.lastName} src={saved.professor.profilePicture} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{saved.professor.firstName} {saved.professor.lastName}</p>
                    <p className="text-xs text-gray-500">{saved.professor.department}</p>
                  </div>
                  {saved.professor.acceptingStudents && <span className="badge-green text-xs">Open</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/professors" className="card card-hover p-4 flex items-center gap-3">
          <div className="bg-primary-100 p-2 rounded-lg"><Search className="h-5 w-5 text-primary-600" /></div>
          <div><p className="text-sm font-medium text-gray-900">Browse Researchers</p><p className="text-xs text-gray-500">Find your next mentor</p></div>
        </Link>
        <Link to="/projects" className="card card-hover p-4 flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg"><FileText className="h-5 w-5 text-emerald-600" /></div>
          <div><p className="text-sm font-medium text-gray-900">Browse Opportunities</p><p className="text-xs text-gray-500">Explore open positions</p></div>
        </Link>
        <Link to="/student/profile" className="card card-hover p-4 flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg"><Plus className="h-5 w-5 text-amber-600" /></div>
          <div><p className="text-sm font-medium text-gray-900">Update Profile</p><p className="text-xs text-gray-500">Keep your profile current</p></div>
        </Link>
      </div>
    </DashboardLayout>
  );
}
