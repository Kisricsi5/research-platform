import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Clock, Calendar, DollarSign, GraduationCap, Users,
  CalendarRange, ShieldCheck, ArrowRight,
} from 'lucide-react';
import { projectsApi } from '../../api/projects';
import Layout from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { compensationLabels, formatDate } from '../../utils';

const compensationBadge: Record<string, string> = {
  PAID: 'badge-green',
  STIPEND: 'badge-green',
  CREDIT: 'badge-blue',
  UNPAID: 'badge-gray',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <Layout><PageSpinner /></Layout>;
  if (!project) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <h1 className="display text-2xl mb-3">Opportunity not found</h1>
          <p className="text-gray-500 mb-6">This position may have been removed or the link is incorrect.</p>
          <Link to="/projects" className="btn-primary">Browse open opportunities</Link>
        </div>
      </Layout>
    );
  }

  const isExpired = project.applicationDeadline && new Date(project.applicationDeadline) < new Date();
  const canApply = user?.role === 'STUDENT' && project.isActive && !isExpired;

  const facts = [
    project.hoursPerWeek && { icon: Clock, label: 'Time commitment', value: `${project.hoursPerWeek} hours/week` },
    project.duration && { icon: CalendarRange, label: 'Duration', value: project.duration },
    { icon: DollarSign, label: 'Compensation', value: compensationLabels[project.compensationType] },
    project.applicationDeadline && {
      icon: Calendar,
      label: 'Application deadline',
      value: isExpired ? 'Deadline passed' : formatDate(project.applicationDeadline),
      danger: !!isExpired,
    },
  ].filter(Boolean) as { icon: any; label: string; value: string; danger?: boolean }[];

  return (
    <Layout>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={compensationBadge[project.compensationType] ?? 'badge-gray'}>
              {compensationLabels[project.compensationType]}
            </span>
            {project.isActive && !isExpired ? (
              <span className="badge-emerald"><ShieldCheck className="h-3 w-3" />Accepting applications</span>
            ) : (
              <span className="badge-gray">Closed</span>
            )}
          </div>

          <h1 className="display text-3xl sm:text-4xl max-w-3xl mb-4">{project.title}</h1>

          {project.professor && (
            <Link
              to={`/professors/${project.professor.id}`}
              className="inline-flex items-center gap-3 group"
            >
              <Avatar
                firstName={project.professor.firstName}
                lastName={project.professor.lastName}
                src={project.professor.profilePicture}
                size="md"
              />
              <span>
                <span className="block text-sm font-semibold text-ink-900 group-hover:text-primary-600 transition-colors">
                  {project.professor.firstName} {project.professor.lastName}
                </span>
                <span className="block text-xs text-gray-500">
                  {project.professor.department} · {project.professor.university}
                </span>
              </span>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">
          {/* Main column */}
          <div className="space-y-8 min-w-0">
            <section>
              <h2 className="text-lg font-semibold text-ink-900 mb-3">About this position</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{project.description}</p>
            </section>

            {(project.requiredSkills.length > 0 || project.preferredMajors.length > 0 || project.preferredYear) && (
              <section className="card p-6">
                <h2 className="text-lg font-semibold text-ink-900 mb-5">What we're looking for</h2>
                <div className="space-y-5">
                  {project.requiredSkills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Required skills</p>
                      <div className="flex flex-wrap gap-2">
                        {project.requiredSkills.map((s) => <span key={s} className="badge-blue">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {project.preferredMajors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-gray-400" /> Preferred majors
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.preferredMajors.map((m) => <span key={m} className="badge-gray">{m}</span>)}
                      </div>
                    </div>
                  )}
                  {project.preferredYear && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Preferred year: <strong className="capitalize text-ink-900">{project.preferredYear}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="card p-6 bg-gray-50/60">
              <h2 className="text-base font-semibold text-ink-900 mb-2">Looking for something else?</h2>
              <p className="text-sm text-gray-600 mb-4">
                Browse more open research positions, or explore this researcher's lab profile.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/projects" className="btn-secondary btn-sm">
                  More opportunities <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {project.professor && (
                  <Link to={`/professors/${project.professor.id}`} className="btn-secondary btn-sm">
                    View lab profile
                  </Link>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 space-y-5">
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-ink-900 uppercase tracking-wide mb-5">At a glance</h2>
              <dl className="space-y-4">
                {facts.map(({ icon: Icon, label, value, danger }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary-50 ring-1 ring-primary-600/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">{label}</dt>
                      <dd className={`text-sm font-semibold ${danger ? 'text-red-600' : 'text-ink-900'}`}>{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-6 pt-5 border-t border-gray-100">
                {canApply ? (
                  <>
                    <Link to={`/student/apply/${project.id}`} className="btn-primary btn-lg w-full justify-center">
                      Apply now
                    </Link>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Your profile and CV are attached automatically.
                    </p>
                  </>
                ) : !user ? (
                  <>
                    <Link to="/signup?role=student" className="btn-primary btn-lg w-full justify-center">
                      Sign up to apply
                    </Link>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
                    </p>
                  </>
                ) : user.role === 'STUDENT' ? (
                  <p className="text-sm text-gray-500 text-center">
                    {isExpired ? 'The application deadline has passed.' : 'This position is no longer accepting applications.'}
                  </p>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
