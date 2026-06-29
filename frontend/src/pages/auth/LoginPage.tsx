import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FlaskConical, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

const RETRY_DELAY = 8;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [waking, setWaking] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const pendingData = useRef<FormData | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const attemptLogin = async (data: FormData) => {
    const user = await login(data.email, data.password);
    navigate(user.role === 'STUDENT' ? '/student/dashboard' : '/professor/dashboard');
  };

  const startRetryCountdown = (data: FormData) => {
    pendingData.current = data;
    setWaking(true);
    setCountdown(RETRY_DELAY);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setWaking(false);
          attemptLogin(data).catch(err => {
            if (err.request) {
              toast.error('Backend is still starting up. Please try again in a moment.');
            } else if (err.response) {
              toast.error(err.response.data?.error || `Server error: ${err.response.status}`);
            } else {
              toast.error(err.message || 'Login failed');
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: FormData) => {
    try {
      await attemptLogin(data);
    } catch (err: any) {
      if (err.response) {
        toast.error(err.response.data?.error || `Server error: ${err.response.status}`);
      } else if (err.request) {
        startRetryCountdown(data);
      } else {
        toast.error(err.message || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary-600 rounded-lg p-2">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">ResearchBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
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

            <button type="submit" disabled={isSubmitting || waking} className="btn-primary btn-lg w-full justify-center">
              {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : 'Sign in'}
            </button>

            {waking && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-center">
                <p className="text-sm font-medium text-amber-800">Backend is waking up...</p>
                <p className="text-xs text-amber-600 mt-0.5">Retrying automatically in {countdown}s</p>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Demo: student@university.edu / password123
        </p>
      </div>
    </div>
  );
}
