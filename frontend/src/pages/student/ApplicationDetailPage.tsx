import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Calendar } from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { DashboardLayout } from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import MessageThread from '../../components/shared/MessageThread';
import { statusLabels, statusColors, formatDate } from '../../utils';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function StudentApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: app, isLoading } = useQuery({
    queryKey: ['my-application', id],
    queryFn: () => applicationsApi.getMyApplication(id!),
    enabled: !!id,
  });

  usePageTitle(app?.project?.title ?? 'My Application');

  if (isLoading) return <DashboardLayout><PageSpinner /></DashboardLayout>;
  if (!app) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">
          Application not found.{' '}
          <Link to="/student/applications" className="text-primary-600 hover:underline">Back to my applications</Link>
        </div>
      </DashboardLayout>
    );
  }

  const professor = app.professor;
  const professorName = professor ? `${professor.firstName} ${professor.lastName}` : 'the professor';

  return (
    <DashboardLayout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="h-4 w-4" />Back to applications
      </button>

      <div className="max-w-3xl space-y-4">
        {/* Header */}
        <div className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {app.project?.title ?? 'General application'}
              </h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />Applied {formatDate(app.createdAt)}
              </p>
            </div>
            <span className={statusColors[app.status]}>{statusLabels[app.status]}</span>
          </div>

          {professor && (
            <Link to={`/professors/${professor.id}`} className="inline-flex items-center gap-3 group">
              <Avatar firstName={professor.firstName} lastName={professor.lastName} src={professor.profilePicture} size="md" />
              <span>
                <span className="block text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {professorName}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />{professor.department} · {professor.university}
                </span>
              </span>
            </Link>
          )}
        </div>

        {/* Messages — the whole conversation stays on Labyro */}
        <MessageThread applicationId={app.id} otherName={professorName} />

        {/* What you submitted */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Your cover letter</h2>
          <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 rounded-lg p-4 leading-relaxed">
            {app.coverLetter}
          </p>
          {app.availability && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Availability</h3>
              <p className="text-sm text-gray-600">{app.availability}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
