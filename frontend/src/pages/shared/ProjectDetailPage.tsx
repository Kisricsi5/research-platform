import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Calendar, DollarSign, GraduationCap, Users } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import Layout from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { compensationLabels, compensationColors, formatDate } from '../../utils';

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
  if (!project) return <Layout><div className="p-8 text-center text-gray-500">Project not found</div></Layout>;

  const isExpired = project.applicationDeadline && new Date(project.applicationDeadline) < new Date();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4" />Back
        </button>

        {/* Header card */}
        <div className="card p-6 mb-6">
          {project.professor && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <Avatar
                firstName={project.professor.firstName}
                lastName={project.professor.lastName}
                src={project.professor.profilePicture}
                size="md"
              />
              <div>
                <Link to={`/professors/${project.professor.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600">
                  {project.professor.firstName} {project.professor.lastName}
                </Link>
                <p className="text-xs text-gray-500">{project.professor.department} · {project.professor.university}</p>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{project.title}</h1>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {project.hoursPerWeek && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Time</span>
                <span className="text-sm font-medium">{project.hoursPerWeek}h/week</span>
              </div>
            )}
            {project.duration && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">Duration</span>
                <span className="text-sm font-medium">{project.duration}</span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />Compensation</span>
              <span className={`text-sm font-medium ${compensationColors[project.compensationType]}`}>
                {compensationLabels[project.compensationType]}
              </span>
            </div>
            {project.applicationDeadline && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Deadline</span>
                <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : ''}`}>
                  {isExpired ? 'Expired' : formatDate(project.applicationDeadline)}
                </span>
              </div>
            )}
          </div>

          {user?.role === 'STUDENT' && project.isActive && !isExpired && (
            <Link to={`/student/apply/${project.id}`} className="btn-primary btn-lg w-full justify-center">
              Apply Now
            </Link>
          )}
          {!project.isActive && <p className="text-center text-sm text-gray-500 mt-2">This position is no longer accepting applications.</p>}
          {isExpired && <p className="text-center text-sm text-red-500 mt-2">Application deadline has passed.</p>}
        </div>

        {/* Description */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About this Project</h2>
          <p className="text-gray-600 whitespace-pre-line leading-relaxed">{project.description}</p>
        </div>

        {/* Requirements */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
          <div className="space-y-4">
            {project.requiredSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((s) => <span key={s} className="badge-blue">{s}</span>)}
                </div>
              </div>
            )}
            {project.preferredMajors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" /> Preferred Majors
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.preferredMajors.map((m) => <span key={m} className="badge-gray">{m}</span>)}
                </div>
              </div>
            )}
            {project.preferredYear && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Preferred year: <strong className="capitalize">{project.preferredYear}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
