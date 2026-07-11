import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import { DashboardLayout } from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import Spinner from '../../components/ui/Spinner';
import TagPicker from '../../components/ui/TagPicker';
import { COMMON_SKILLS, COMMON_MAJORS, YEAR_OPTIONS } from '../../data/suggestions';
import { cn } from '../../utils';

const schema = z.object({
  title: z.string().min(1, 'Required').max(300),
  description: z.string().min(10, 'At least 10 characters').max(5000),
  hoursPerWeek: z.coerce.number().int().min(1).max(60).optional().nullable(),
  duration: z.string().max(100).optional(),
  compensationType: z.enum(['UNPAID', 'PAID', 'CREDIT', 'STIPEND']),
  applicationDeadline: z.string().optional(),
  openToOtherUniversities: z.boolean(),
  isActive: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function ProjectFormPage() {
  const { projectId } = useParams<{ projectId?: string }>();
  const isEdit = !!projectId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

  const toggleYear = (value: string) =>
    setYears((prev) => (prev.includes(value) ? prev.filter((y) => y !== value) : [...prev, value]));

  const { data: projects } = useQuery({
    queryKey: ['my-projects'],
    queryFn: projectsApi.getMine,
  });

  const existing = isEdit ? projects?.find((p: any) => p.id === projectId) : undefined;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { compensationType: 'UNPAID', isActive: true, openToOtherUniversities: true },
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description,
        hoursPerWeek: existing.hoursPerWeek,
        duration: existing.duration ?? '',
        compensationType: existing.compensationType,
        applicationDeadline: existing.applicationDeadline ? existing.applicationDeadline.slice(0, 10) : '',
        openToOtherUniversities: existing.openToOtherUniversities ?? true,
        isActive: existing.isActive,
      });
      setSkills(existing.requiredSkills);
      setMajors(existing.preferredMajors);
      setYears(existing.preferredYears ?? []);
    }
  }, [existing, reset]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      projectsApi.create({
        ...data,
        requiredSkills: skills,
        preferredMajors: majors,
        preferredYears: years,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline).toISOString() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast.success('Project created!');
      navigate('/professor/projects');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create project'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      projectsApi.update(projectId!, {
        ...data,
        requiredSkills: skills,
        preferredMajors: majors,
        preferredYears: years,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline).toISOString() : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast.success('Project updated!');
      navigate('/professor/projects');
    },
    onError: () => toast.error('Failed to update project'),
  });

  if (isEdit && !projects) return <DashboardLayout><PageSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Project' : 'Post Research Opportunity'}</h1>

        <form onSubmit={handleSubmit((data) => isEdit ? updateMutation.mutate(data) : createMutation.mutate(data))} className="space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Project Details</h2>
            <div>
              <label className="label">Project Title</label>
              <input {...register('title')} className="input" placeholder="e.g., Machine Learning for Climate Prediction" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Description</label>
              <textarea {...register('description')} rows={6} className="input resize-none" placeholder="Describe the research project, student's role, and expected outcomes..." />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Position Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Hours per week</label>
                <input {...register('hoursPerWeek')} type="number" min="1" max="60" className="input" placeholder="e.g., 15" />
              </div>
              <div>
                <label htmlFor="compensationType" className="label">Compensation</label>
                <select id="compensationType" {...register('compensationType')} className="input">
                  <option value="UNPAID">Unpaid / Volunteer</option>
                  <option value="CREDIT">Course Credit</option>
                  <option value="PAID">Paid</option>
                  <option value="STIPEND">Stipend</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Duration</label>
                <input {...register('duration')} className="input" placeholder="e.g., Summer 2025, One semester" />
              </div>
              <div>
                <label htmlFor="applicationDeadline" className="label">Application Deadline <span className="text-gray-500 font-normal">(optional)</span></label>
                <input id="applicationDeadline" {...register('applicationDeadline')} type="date" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Preferred Years <span className="text-gray-500 font-normal">(select all that apply — none selected means any year)</span></label>
              <div className="flex flex-wrap gap-2">
                {YEAR_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleYear(value)}
                    aria-pressed={years.includes(value)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ring-1 ring-inset',
                      years.includes(value)
                        ? 'bg-primary-600 text-white ring-primary-600 shadow-sm'
                        : 'bg-white text-gray-600 ring-gray-300 hover:ring-gray-400 hover:text-gray-900',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Required Skills</h2>
            <p className="helper mb-4">Start typing to pick from common research skills, or add your own.</p>
            <TagPicker
              selected={skills}
              onChange={setSkills}
              suggestions={COMMON_SKILLS}
              placeholder="e.g. Python, PCR, Literature Review…"
              badgeClass="badge-blue"
            />
          </div>

          {/* Preferred Majors */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Preferred Majors <span className="text-gray-500 font-normal text-sm">(optional)</span></h2>
            <p className="helper mb-4">Start typing to pick from common majors, or add your own.</p>
            <TagPicker
              selected={majors}
              onChange={setMajors}
              suggestions={COMMON_MAJORS}
              placeholder="e.g. Biology, Computer Science…"
              badgeClass="badge-gray"
            />
          </div>

          <div className="card p-4 space-y-4">
            <div className="flex items-start gap-3">
              <input {...register('isActive')} type="checkbox" id="active" className="rounded border-gray-300 text-primary-600 w-4 h-4 mt-0.5" />
              <label htmlFor="active" className="text-sm text-gray-700">
                <span className="font-medium">Currently accepting applications</span>
              </label>
            </div>
            <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
              <input {...register('openToOtherUniversities')} type="checkbox" id="openToOther" className="rounded border-gray-300 text-primary-600 w-4 h-4 mt-0.5" />
              <label htmlFor="openToOther" className="text-sm text-gray-700">
                <span className="font-medium">Accept students from other universities</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Uncheck to only accept applications from students at your own university.
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary btn-lg flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg flex-1">
              {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : (isEdit ? 'Update Project' : 'Post Project')}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
