import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Globe, BookOpen, CheckCircle, XCircle, Bookmark, BookmarkCheck, ArrowLeft, Clock, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { professorsApi } from '../../api/professors';
import { studentsApi } from '../../api/students';
import Layout from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { compensationLabels } from '../../utils';

export default function ProfessorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: professor, isLoading } = useQuery({
    queryKey: ['professor', id],
    queryFn: () => professorsApi.getById(id!),
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: () => studentsApi.saveProfessor(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor', id] });
      queryClient.invalidateQueries({ queryKey: ['saved-professors'] });
      toast.success('Professor saved');
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: () => studentsApi.unsaveProfessor(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor', id] });
      queryClient.invalidateQueries({ queryKey: ['saved-professors'] });
      toast.success('Removed from saved');
    },
  });

  if (isLoading) return <Layout><PageSpinner /></Layout>;
  if (!professor) return <Layout><div className="p-8 text-center text-gray-500">Professor not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <Avatar
              firstName={professor.firstName}
              lastName={professor.lastName}
              src={professor.profilePicture}
              size="xl"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {professor.firstName} {professor.lastName}
                  </h1>
                  <p className="text-gray-500">{professor.title}</p>
                </div>
                {user?.role === 'STUDENT' && (
                  <button
                    onClick={() => professor.isSaved ? unsaveMutation.mutate() : saveMutation.mutate()}
                    className="btn-secondary gap-2 flex-shrink-0"
                  >
                    {professor.isSaved ? (
                      <><BookmarkCheck className="h-4 w-4 text-primary-600" />Saved</>
                    ) : (
                      <><Bookmark className="h-4 w-4" />Save</>
                    )}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {professor.department} · {professor.university}
                </span>
                {professor.labWebsite && (
                  <a href={professor.labWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-600 hover:underline">
                    <Globe className="h-4 w-4" />
                    Lab Website
                  </a>
                )}
              </div>

              {professor.labName && (
                <p className="text-sm text-gray-500 mt-1">🔬 {professor.labName}</p>
              )}

              <div className="flex items-center gap-2 mt-3">
                {professor.acceptingStudents ? (
                  <span className="flex items-center gap-1 badge-green">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Accepting students
                  </span>
                ) : (
                  <span className="flex items-center gap-1 badge-red">
                    <XCircle className="h-3.5 w-3.5" />
                    Not currently accepting
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {professor.bio && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{professor.bio}</p>
              </div>
            )}

            {/* Open Projects */}
            {professor.projects && professor.projects.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-600" />
                  Open Research Opportunities ({professor.projects.length})
                </h2>
                <div className="space-y-4">
                  {professor.projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                        {project.hoursPerWeek && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />{project.hoursPerWeek}h/week
                          </span>
                        )}
                        {project.duration && <span>{project.duration}</span>}
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />{compensationLabels[project.compensationType]}
                        </span>
                      </div>

                      {project.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {project.requiredSkills.slice(0, 5).map((s) => (
                            <span key={s} className="badge-gray">{s}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link to={`/projects/${project.id}`} className="btn-secondary btn-sm">Details</Link>
                        {user?.role === 'STUDENT' && (
                          <Link to={`/student/apply/${project.id}`} className="btn-primary btn-sm">Apply</Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Research Areas</h3>
              <div className="flex flex-wrap gap-2">
                {professor.researchAreas.map((area) => (
                  <span key={area} className="badge-blue">{area}</span>
                ))}
              </div>
            </div>

            {user?.role === 'STUDENT' && professor.acceptingStudents && (
              <div className="card p-4 bg-primary-50 border-primary-200">
                <h3 className="text-sm font-semibold text-primary-900 mb-2">Interested in this lab?</h3>
                <p className="text-xs text-primary-700 mb-3">Apply to a specific project or send a general application.</p>
                <Link
                  to={`/student/apply?professorId=${professor.id}`}
                  className="btn-primary w-full justify-center"
                >
                  Apply to this Lab
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
