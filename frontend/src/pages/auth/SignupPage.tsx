import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FlaskConical, GraduationCap, BookOpen, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';
import Spinner from '../../components/ui/Spinner';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['STUDENT', 'PROFESSOR']),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STUDENT' },
  });

  const role = watch('role');

  const onSubmit = async (data: FormData) => {
    try {
      const user = await signup(data.email, data.password, data.role);
      toast.success('Account created! Please verify your email.');
      navigate(user.role === 'STUDENT' ? '/student/profile' : '/professor/profile');
    } catch (err: any) {
      if (err.response) {
        // Server responded with an error
        const message = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
        toast.error(message);
      } else if (err.request) {
        // Request was made but no response received (backend down/CORS)
        toast.error('Cannot reach the server. The backend may be starting up — please wait 30 seconds and try again.');
      } else {
        toast.error(err.message || 'Signup failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary-600 rounded-lg p-2">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">ResearchBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join the research community</p>
        </div>

        <div className="card p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setValue('role', 'STUDENT')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                role === 'STUDENT'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <GraduationCap className={cn('h-6 w-6', role === 'STUDENT' ? 'text-primary-600' : 'text-gray-400')} />
              <span className={cn('text-sm font-medium', role === 'STUDENT' ? 'text-primary-700' : 'text-gray-600')}>
                I'm a Student
              </span>
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'PROFESSOR')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                role === 'PROFESSOR'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <BookOpen className={cn('h-6 w-6', role === 'PROFESSOR' ? 'text-primary-600' : 'text-gray-400')} />
              <span className={cn('text-sm font-medium', role === 'PROFESSOR' ? 'text-primary-700' : 'text-gray-600')}>
                I'm a Professor
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('role')} />

            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="you@university.edu" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="input"
                placeholder="Repeat password"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full justify-center mt-2">
              {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
