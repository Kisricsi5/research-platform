import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';
import { studentsApi } from '../../api/students';
import { DashboardLayout } from '../../components/layout/Layout';
import { PageSpinner } from '../../components/ui/Spinner';
import Spinner from '../../components/ui/Spinner';
import TagPicker from '../../components/ui/TagPicker';
import { COMMON_SKILLS, COMMON_RESEARCH_INTERESTS } from '../../data/suggestions';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  university: z.string().min(1, 'Required'),
  major: z.string().min(1, 'Required'),
  graduationYear: z.coerce.number().int().min(2020).max(2035),
  gpa: z.coerce.number().min(0).max(4.0).optional().nullable().or(z.literal('')),
  bio: z.string().max(2000).optional(),
  isVisible: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function StudentProfilePage() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: studentsApi.getProfile,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        university: profile.university,
        major: profile.major,
        graduationYear: profile.graduationYear,
        gpa: profile.gpa ?? undefined,
        bio: profile.bio ?? '',
        isVisible: profile.isVisible,
      });
      setSkills(profile.skills);
      setInterests(profile.researchInterests);
    }
  }, [profile, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      studentsApi.upsertProfile({ ...data, gpa: data.gpa === '' ? null : data.gpa ? Number(data.gpa) : null, skills, researchInterests: interests }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      refreshUser();
      toast.success('Profile saved!');
    },
    onError: () => toast.error('Failed to save profile'),
  });

  const cvMutation = useMutation({
    mutationFn: studentsApi.uploadCV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('CV uploaded!');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Upload failed'),
  });

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
              <label className="label">University</label>
              <input {...register('university')} className="input" placeholder="e.g., MIT" />
              {errors.university && <p className="text-xs text-red-500 mt-1">{errors.university.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Major</label>
                <input {...register('major')} className="input" placeholder="e.g., Computer Science" />
                {errors.major && <p className="text-xs text-red-500 mt-1">{errors.major.message}</p>}
              </div>
              <div>
                <label className="label">Graduation Year</label>
                <input {...register('graduationYear')} type="number" className="input" />
                {errors.graduationYear && <p className="text-xs text-red-500 mt-1">{errors.graduationYear.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">GPA <span className="text-gray-400 font-normal">(optional)</span></label>
              <input {...register('gpa')} type="number" step="0.01" min="0" max="4.0" className="input w-32" placeholder="3.8" />
            </div>
          </div>

          {/* Bio */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Bio / Personal Statement</h2>
            <textarea {...register('bio')} rows={4} className="input resize-none" placeholder="Tell professors about your research interests and goals..." />
            {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
          </div>

          {/* Skills */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Skills</h2>
            <p className="helper mb-4">Start typing to pick from common research skills, or add your own.</p>
            <TagPicker
              selected={skills}
              onChange={setSkills}
              suggestions={COMMON_SKILLS}
              placeholder="e.g. Python, PCR, Data Analysis…"
              badgeClass="badge-blue"
            />
          </div>

          {/* Research Interests */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Research Interests</h2>
            <p className="helper mb-4">Fields you'd love to work in — pick from the list or add your own.</p>
            <TagPicker
              selected={interests}
              onChange={setInterests}
              suggestions={COMMON_RESEARCH_INTERESTS}
              placeholder="e.g. Neuroscience, Machine Learning…"
              badgeClass="badge-green"
            />
          </div>

          {/* Visibility */}
          <div className="card p-4 flex items-center gap-3">
            <input {...register('isVisible')} type="checkbox" id="visible" className="rounded border-gray-300 text-primary-600" />
            <label htmlFor="visible" className="text-sm text-gray-700">
              <span className="font-medium">Public profile</span> — professors can find and view your profile
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg">
            {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : 'Save Profile'}
          </button>
        </form>

        {/* CV Upload */}
        <div className="card p-6 mt-6">
          <h2 className="font-semibold text-gray-900 mb-2">CV / Resume</h2>
          {profile?.cvFilePath && (
            <p className="text-sm text-emerald-600 mb-3">✓ CV uploaded — uploading again will replace it</p>
          )}
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
            {cvMutation.isPending ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">Click to upload PDF (max 5MB)</span>
              </>
            )}
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) cvMutation.mutate(file);
              }}
            />
          </label>
        </div>
      </div>
    </DashboardLayout>
  );
}
