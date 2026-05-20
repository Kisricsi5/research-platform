import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, BookOpen, Clock, Plus, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/Layout';
import { professorsApi } from '../../api/professors';
import { applicationsApi } from '../../api/applications';
import { projectsApi } from '../../api/projects';
import { PageSpinner } from '../../components/ui/Spinner';
import { statusLabels, statusColors, timeAgo } from '../../utils';
import Avatar from '../../components/ui/Avatar';

export default function ProfessorDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['professor-dashboard'],
    queryFn: professorsApi.getDashboard,
  });

  const { data: recentApps } = useQuery({
    queryKey: ['professor-applications', { page: 1, limit: 5 }],
    queryFn: () => applicationsApi.getReceived({ page: 1, limit: 5 }),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['my-projects'],
    queryFn: projectsApi.getMine,
  });

  if (statsLoading) return <DashboardLayout><PageSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professor Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your research opportunities and applications</p>
        </div>
        <Link to="/professor/projects/new" className="btn-primary gap-2">
          <Plus className="h-4 w-4" />Post Opportunity
        </Link>
      </div>

      {!user?.hasProfile && (
        <div className="card p-4 bg-amber-50 border-amber-200 mb-6 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-amber-900">Complete your professor profile to start receiving applications</p>
          <Link to="/professor/profile" className="btn-primary flex-shrink-0">Complete Profile</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Projects', value: stats?.activeProjects ?? 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Applications', value: stats?.totalApplications ?? 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'New (7 days)', value: stats?.recentApplications ?? 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Review', value: stats?.pendingApplications ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
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
        {/* Active Projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Your Projects</h2>
            <Link to="/professor/projects" className="text-xs text-primary-600 hover:underline">Manage all</Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No projects posted yet</p>
              <Link to="/professor/projects/new" className="btn-primary btn-sm inline-flex">Post First Project</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <p className="text-xs text-gray-500">{p._count?.applications ?? 0} application{p._count?.applications !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.isActive ? <span className="badge-green">Active</span> : <span className="badge-gray">Closed</span>}
                    <Link to={`/professor/projects/${p.id}/edit`} className="btn-secondary btn-sm">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/professor/applications" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {!recentApps?.data.length ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.data.map((app) => (
                <Link key={app.id} to={`/professor/applications/${app.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  {app.student && (
                    <Avatar firstName={app.student.firstName} lastName={app.student.lastName} src={app.student.profilePicture} size="sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {app.student?.firstName} {app.student?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{app.project?.title ?? 'General application'} · {timeAgo(app.createdAt)}</p>
                  </div>
                  <span className={statusColors[app.status]}>{statusLabels[app.status]}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
