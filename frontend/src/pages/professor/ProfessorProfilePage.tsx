import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import { professorsApi } from '../../api/professors';
import { DashboardLayout } from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  title: z.string().min(1, 'Required'),
  department: z.string().min(1, 'Required'),
  university: z.string().min(1, 'Required'),
  labName: z.string().optional(),
  labWebsite: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  bio: z.string().max(3000).optional(),
  acceptingStudents: z.boolean(),
});
type FormData = z.infer<typeof schema>;

const TITLES = ['Professor', 'Associate Professor', 'Assistant Professor', 'Adjunct Professor', 'Research Professor', 'Visiting Professor', 'Lecturer', 'Senior Researcher'];

export default function ProfessorProfilePage() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [researchAreas, setResearchAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['professor-profile'],
    queryFn: professorsApi.getOwnProfile,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { acceptingStudents: true },
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        title: profile.title,
        department: profile.department,
        university: profile.university,
        labName: profile.labName ?? '',
        labWebsite: profile.labWebsite ?? '',
        bio: profile.bio ?? '',
        acceptingStudents: profile.acceptingStudents,
      });
      setResearchAreas(profile.researchAreas);
    }
  }, [profile, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      professorsApi.upsertProfile({ ...data, researchAreas }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professor-profile'] });
      refreshUser();
      toast.success('Profile saved!');
    },
    onError: () => toast.error('Failed to save profile'),
  });

  const addArea = () => {
    const trimmed = areaInput.trim();
    if (trimmed && !researchAreas.includes(trimmed)) setResearchAreas([...researchAreas, trimmed]);
    setAreaInput('');
  };

  if (isLoading) return <DashboardLayout><PageSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-6">
          {/* Basic info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input {...register('firstName')} className="input" />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...register('lastName')} className="input" />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">Title / Position</label>
              <select {...register('title')} className="input">
                <option value="">Select title...</option>
                {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <input {...register('department')} className="input" placeholder="e.g., Computer Science" />
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
              </div>
              <div>
                <label className="label">University</label>
                <input {...register('university')} className="input" placeholder="e.g., MIT" />
                {errors.university && <p className="text-xs text-red-500 mt-1">{errors.university.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">Lab Name <span className="text-gray-400 font-normal">(optional)</span></label>
              <input {...register('labName')} className="input" placeholder="e.g., Intelligent Systems Lab" />
            </div>
            <div>
              <label className="label">Lab Website <span className="text-gray-400 font-normal">(optional)</span></label>
              <input {...register('labWebsite')} type="url" className="input" placeholder="https://yourlab.university.edu" />
              {errors.labWebsite && <p className="text-xs text-red-500 mt-1">{errors.labWebsite.message}</p>}
            </div>
          </div>

          {/* Bio */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Research Description / Bio</h2>
            <textarea {...register('bio')} rows={5} className="input resize-none" placeholder="Describe your research focus, current projects, and what you look for in student researchers..." />
          </div>

          {/* Research Areas */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Research Areas</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {researchAreas.map((area) => (
                <span key={area} className="badge-blue flex items-center gap-1">
                  {area}
                  <button type="button" onClick={() => setResearchAreas(researchAreas.filter((a) => a !== area))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArea(); } }}
                className="input flex-1"
                placeholder="Add a research area (e.g., Machine Learning)..."
              />
              <button type="button" onClick={addArea} className="btn-secondary gap-1">
                <Plus className="h-4 w-4" />Add
              </button>
            </div>
          </div>

          {/* Accepting students toggle */}
          <div className="card p-4 flex items-center gap-3">
            <input {...register('acceptingStudents')} type="checkbox" id="accepting" className="rounded border-gray-300 text-primary-600 w-4 h-4" />
            <label htmlFor="accepting" className="text-sm text-gray-700">
              <span className="font-medium">Currently accepting student researchers</span>
              <br />
              <span className="text-gray-500 text-xs">Students will see an "Accepting students" badge on your profile</span>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg">
            {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : 'Save Profile'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
