import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, GraduationCap, BookOpen, Sparkles, CheckCircle2, AlertCircle, MessageCircleQuestion } from 'lucide-react';
import toast from 'react-hot-toast';
import { applicationsApi, configApi, FitAnalysis } from '../../api/applications';
import { DashboardLayout } from '../../components/layout/Layout';
import MessageThread from '../../components/shared/MessageThread';
import { PageSpinner } from '../../components/ui/Spinner';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import { statusLabels, statusColors, formatDate } from '../../utils';
import { ApplicationStatus } from '../../types';

const fitStyles: Record<FitAnalysis['fitLevel'], string> = {
  Strong: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Moderate: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Limited: 'bg-gray-100 text-gray-600 ring-gray-500/15',
};

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
  const [fit, setFit] = useState<FitAnalysis | null>(null);

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: configApi.get,
    staleTime: Infinity,
  });

  const analyzeMutation = useMutation({
    mutationFn: () => applicationsApi.analyzeFit(id!),
    onSuccess: (data) => setFit(data),
    onError: (err: any) =>
      toast.error(err?.response?.data?.error || 'AI analysis is temporarily unavailable.'),
  });

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
  useEffect(() => {
    if (app) {
      setNotes(app.professorNotes ?? '');
      setSelectedStatus(app.status as ApplicationStatus);
    }
  }, [app]);

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

          {/* Private messages with the applicant */}
          <MessageThread applicationId={app.id} otherName={`${student.firstName} ${student.lastName}`} />
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

          {/* AI fit analysis (decision-support) */}
          {config?.aiFitAnalysis && app.project && (
            <div className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary-50 ring-1 ring-primary-600/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">AI fit analysis</h3>
                    <p className="text-xs text-gray-500">Guidance only — you make the final decision</p>
                  </div>
                </div>
                {!fit && (
                  <button
                    onClick={() => analyzeMutation.mutate()}
                    disabled={analyzeMutation.isPending}
                    className="btn-primary btn-sm shrink-0"
                  >
                    {analyzeMutation.isPending ? (
                      <><Spinner className="h-3.5 w-3.5 text-white" /> Analyzing…</>
                    ) : (
                      <><Sparkles className="h-3.5 w-3.5" /> Analyze fit</>
                    )}
                  </button>
                )}
              </div>

              {fit && (
                <div className="mt-4 space-y-5">
                  <div className="flex items-center gap-3">
                    <span className={`badge ring-1 ${fitStyles[fit.fitLevel]}`}>{fit.fitLevel} fit</span>
                    <button onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending} className="text-xs text-gray-500 hover:text-gray-800">
                      {analyzeMutation.isPending ? 'Re-analyzing…' : 'Re-run'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{fit.summary}</p>

                  {fit.strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Strengths</p>
                      <ul className="space-y-1.5">
                        {fit.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fit.gaps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Gaps to probe</p>
                      <ul className="space-y-1.5">
                        {fit.gaps.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fit.suggestedQuestions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Suggested interview questions</p>
                      <ul className="space-y-1.5">
                        {fit.suggestedQuestions.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <MessageCircleQuestion className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                    AI-generated from this application and the position's requirements. It can make mistakes — treat it as a starting point, not a decision.
                  </p>
                </div>
              )}
            </div>
          )}

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
