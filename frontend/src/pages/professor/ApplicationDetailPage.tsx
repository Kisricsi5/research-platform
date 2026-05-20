import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, GraduationCap, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationsApi } from '../../api/applications';
import { DashboardLayout } from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import { statusLabels, statusColors, formatDate } from '../../utils';
import { ApplicationStatus } from '../../types';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'INTERVIEW_REQUESTED',
];

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: app, isLoading } = useQuery({
    queryKey: ['professor-application', id],
    queryFn: () => applicationsApi.getReceivedById(id!),
    enabled: !!id,
  });

  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('PENDING');

  const updateMutation = useMutation({
    mutationFn: () =>
      applicationsApi.updateStatus(id!, { status: selectedStatus, professorNotes: notes || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-application', id] });
      queryClient.invalidateQueries({ queryKey: ['professor-applications'] });
      toast.success('Application updated');
    },
    onError: () => toast.error('Update failed'),
  });

  // Initialise once data loads
  if (app && notes === '' && selectedStatus === 'PENDING') {
    setNotes(app.professorNotes ?? '');
    setSelectedStatus(app.status as ApplicationStatus);
  }

  if (isLoading) return <DashboardLayout><PageSpinner /></DashboardLayout>;
  if (!app) return <DashboardLayout><div className="p-8 text-center text-gray-500">Application not found</div></DashboardLayout>;

  const student = app.student!;

  return (
    <DashboardLayout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="h-4 w-4" />Back to applications
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student info */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar firstName={student.firstName} lastName={student.lastName} src={student.profilePicture} size="xl" className="mb-3" />
              <h2 className="font-semibold text-gray-900 text-lg">{student.firstName} {student.lastName}</h2>
              <p className="text-sm text-gray-500">{student.major}</p>
              <p className="text-sm text-gray-500">{student.university}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                <span>Class of {student.graduationYear}</span>
              </div>
              {student.gpa && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span>GPA: {student.gpa.toFixed(2)}</span>
                </div>
              )}
            </div>
            {student.cvFilePath && (
              <a
                href={`/${student.cvFilePath.replace(/\\/g, '/')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center mt-4 gap-2"
              >
                <Download className="h-4 w-4" />Download CV
              </a>
            )}
          </div>

          {student.skills.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((s) => <span key={s} className="badge-blue">{s}</span>)}
              </div>
            </div>
          )}

          {student.researchInterests.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Research Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {student.researchInterests.map((i) => <span key={i} className="badge-green">{i}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Application content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {app.project?.title ?? 'General Application'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Applied {formatDate(app.createdAt)}</p>
              </div>
              <span className={statusColors[app.status as ApplicationStatus]}>
                {statusLabels[app.status as ApplicationStatus]}
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Cover Letter</p>
              <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 rounded-lg p-4 leading-relaxed">
                {app.coverLetter}
              </p>
            </div>

            {app.availability && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Availability</p>
                <p className="text-sm text-gray-600">{app.availability}</p>
              </div>
            )}

            {student.bio && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Student Bio</p>
                <p className="text-sm text-gray-600">{student.bio}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
                    selectedStatus === s
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="label">Private Notes <span className="text-gray-400 font-normal">(only visible to you)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Internal notes about this applicant..."
              />
            </div>

            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="btn-primary w-full justify-center"
            >
              {updateMutation.isPending ? <Spinner className="h-4 w-4 text-white" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
