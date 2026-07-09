import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FlaskConical, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import { sleep } from '../../utils';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

const MAX_ATTEMPTS = 3;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Network blips are retried silently while the button spinner runs;
  // the user only ever sees a toast if every attempt fails.
  const onSubmit = async (data: FormData) => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const user = await login(data.email, data.password);
        navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/professor/dashboard');
        return;
      } catch (err: any) {
        if (err.response) {
          toast.error(err.response.data?.error || `Server error: ${err.response.status}`);
          return;
        }
        if (err.request && attempt < MAX_ATTEMPTS) {
          await sleep(1500 * attempt);
          continue;
        }
        toast.error(err.request ? 'Unable to reach the server. Please try again.' : err.message || 'Login failed');
        return;
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
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
          <h1 className="display text-3xl">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="you@university.edu" autoComplete="email" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full justify-center">
              {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
