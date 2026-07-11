import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, X } from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { DashboardLayout } from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import { statusLabels, statusColors, formatDate } from '../../utils';
import { ApplicationStatus } from '../../types';

const TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Interview', value: 'INTERVIEW_REQUESTED' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function ApplicationsManagementPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('project') ?? undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['professor-applications', { status, page, projectId }],
    queryFn: () => applicationsApi.getReceived({ status: status || undefined, project: projectId, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  const projectTitle = projectId
    ? data?.data.find((a) => a.project?.id === projectId)?.project?.title
    : undefined;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Applications</h1>

      {projectId && (
        <div className="mb-4">
          <button
            onClick={() => { setSearchParams({}); setPage(1); }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-600/15 px-3 py-1.5 text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            Filtered by project{projectTitle ? `: ${projectTitle}` : ''}
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              status === tab.value
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !data?.data.length ? (
        <EmptyState icon={Users} title="No applications" description="Applications will appear here once students apply to your projects." />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{data.meta.total} application{data.meta.total !== 1 ? 's' : ''}</p>
          <div className="space-y-3">
            {data.data.map((app) => (
              <Link
                key={app.id}
                to={`/professor/applications/${app.id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                {app.student && (
                  <Avatar firstName={app.student.firstName} lastName={app.student.lastName} src={app.student.profilePicture} size="md" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {app.student?.firstName} {app.student?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {app.student?.major} · Class of {app.student?.graduationYear}
                    {app.project && <> · <span className="text-primary-600">{app.project.title}</span></>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Applied {formatDate(app.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {app.student?.gpa && <span className="text-xs text-gray-500">GPA {app.student.gpa.toFixed(1)}</span>}
                  <span className={statusColors[app.status as ApplicationStatus]}>{statusLabels[app.status as ApplicationStatus]}</span>
                </div>
              </Link>
            ))}
          </div>
          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(page - 1)} disabled={!data.meta.hasPrevPage} className="btn-secondary">Previous</button>
              <span className="text-sm text-gray-500">Page {data.meta.page} of {data.meta.totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={!data.meta.hasNextPage} className="btn-secondary">Next</button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
