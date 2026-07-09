import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FlaskConical, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';
import Spinner from '../../components/ui/Spinner';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.resetPassword(token, data.password);
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'This reset link is invalid or has expired.');
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#f6f8fd_0%,#f8fafc_70%)]" />
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
          <h1 className="display text-3xl">Choose a new password</h1>
          <p className="text-gray-500 mt-2">Minimum 8 characters</p>
        </div>

        <div className="card p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 ring-1 ring-emerald-600/15 mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-ink-900 mb-2">Password updated</h2>
              <p className="text-sm text-gray-600">You can now sign in with your new password.</p>
              <Link to="/login" className="btn-primary mt-6">Sign in</Link>
            </div>
          ) : !token ? (
            <div className="text-center py-4">
              <h2 className="font-semibold text-ink-900 mb-2">Invalid reset link</h2>
              <p className="text-sm text-gray-600">This link is missing its reset token. Request a new one below.</p>
              <Link to="/forgot-password" className="btn-primary mt-6">Request new link</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label" htmlFor="password">New password</label>
                <div className="relative">
                  <input
                    id="password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label" htmlFor="confirm">Confirm new password</label>
                <input id="confirm" {...register('confirm')} type="password" className="input" placeholder="Repeat password" autoComplete="new-password" />
                {errors.confirm && <p className="error-text">{errors.confirm.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full justify-center">
                {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
