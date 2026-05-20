import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import { professorsApi } from '../../api/professors';
import { applicationsApi } from '../../api/applications';
import { DashboardLayout } from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';

const schema = z.object({
  coverLetter: z.string().min(50, 'At least 50 characters required').max(5000),
  availability: z.string().max(500).optional(),
});
type FormData = z.infer<typeof schema>;

export default function ApplyPage() {
  const { projectId } = useParams<{ projectId?: string }>();
  const [searchParams] = useSearchParams();
  const professorIdParam = searchParams.get('professorId');
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
  });

  const { data: professor, isLoading: profLoading } = useQuery({
    queryKey: ['professor', project?.professorId ?? professorIdParam],
    queryFn: () => professorsApi.getById((project?.professorId ?? professorIdParam)!),
    enabled: !!(project?.professorId ?? professorIdParam),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submitMutation = useMutation({
    mutationFn: (data: FormData) =>
      applicationsApi.submit({
        professorId: (project?.professorId ?? professorIdParam)!,
        projectId: projectId ?? null,
        ...data,
      }),
    onSuccess: () => {
      toast.success('Application submitted!');
      navigate('/student/applications');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to submit'),
  });

  const isLoading = projectLoading || profLoading;

  if (isLoading) return <DashboardLayout><PageSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4" />Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Application</h1>

        {/* Context */}
        {professor && (
          <div className="card p-4 mb-6 flex items-center gap-3">
            <Avatar firstName={professor.firstName} lastName={professor.lastName} src={professor.profilePicture} size="md" />
            <div>
              <p className="font-medium text-gray-900">{professor.firstName} {professor.lastName}</p>
              <p className="text-sm text-gray-500">{professor.department} · {professor.university}</p>
              {project && <p className="text-xs text-primary-600 mt-0.5">→ {project.title}</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
          <div className="card p-6">
            <label className="label text-base">Cover Letter / Statement of Interest</label>
            <p className="text-xs text-gray-500 mb-3">
              Explain why you're interested in this research and what you bring to the lab. Min. 50 characters.
            </p>
            <textarea
              {...register('coverLetter')}
              rows={10}
              className="input resize-none"
              placeholder="Dear Professor...

I am a [year] student in [major] at [university], and I am writing to express my strong interest in your research on [topic]..."
            />
            {errors.coverLetter && <p className="text-xs text-red-500 mt-1">{errors.coverLetter.message}</p>}
          </div>

          <div className="card p-6">
            <label className="label">Availability <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              {...register('availability')}
              rows={3}
              className="input resize-none"
              placeholder="e.g., Available 15 hours/week starting September, prefer mornings..."
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-lg flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg flex-1">
              {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
