import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { DashboardLayout } from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import { statusLabels, statusColors, formatDate } from '../../utils';

export default function ApplicationsPage() {
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: applicationsApi.getMyApplications,
  });

  if (isLoading) return <DashboardLayout><PageSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h1>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Browse professors and projects to find research opportunities that match your interests."
          action={<Link to="/professors" className="btn-primary">Browse Professors</Link>}
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link
              key={app.id}
              to={`/student/applications/${app.id}`}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              {app.professor && (
                <Avatar firstName={app.professor.firstName} lastName={app.professor.lastName} src={app.professor.profilePicture} size="md" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {app.project?.title ?? `General application — ${app.professor?.firstName} ${app.professor?.lastName}`}
                </p>
                <p className="text-sm text-gray-500">
                  {app.professor?.firstName} {app.professor?.lastName} · {app.professor?.department}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Applied {formatDate(app.createdAt)}</p>
              </div>
              <span className={statusColors[app.status]}>{statusLabels[app.status]}</span>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
