import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FlaskConical, GraduationCap, BookOpen, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn, sleep } from '../../utils';
import { usePageTitle } from '../../hooks/usePageTitle';
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

const MAX_ATTEMPTS = 3;

export default function SignupPage() {
  usePageTitle('Create your account');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'STUDENT' },
  });

  const role = watch('role');

  // Network blips are retried silently while the button spinner runs;
  // the user only ever sees a toast if every attempt fails.
  const onSubmit = async (data: FormData) => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const user = await signup(data.email, data.password, data.role);
        toast.success('Account created! Please verify your email.');
        navigate(user.role === 'STUDENT' ? '/student/profile' : '/professor/profile');
        return;
      } catch (err: any) {
        if (err.response) {
          toast.error(err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`);
          return;
        }
        if (err.request && attempt < MAX_ATTEMPTS) {
          await sleep(1500 * attempt);
          continue;
        }
        toast.error(err.request ? 'Unable to reach the server. Please try again.' : err.message || 'Signup failed');
        return;
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#f6f8fd_0%,#f9fafb_70%)]" />
        <div className="absolute -top-24 right-1/4 w-[480px] h-[480px] rounded-full bg-primary-100/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#dbe3f3_1px,transparent_1px)] [background-size:28px_28px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary-600 rounded-lg p-2 shadow-[0_4px_12px_-2px_rgba(37,99,235,.4)]">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-ink-900 tracking-tight">Labyro</span>
          </Link>
          <h1 className="display text-3xl">Create your account</h1>
          <p className="text-gray-500 mt-2">Join the research community</p>
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
              {role === 'PROFESSOR' && (
                <p className="helper">
                  Professor accounts require a university email address (e.g. name@university.edu).
                </p>
              )}
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
