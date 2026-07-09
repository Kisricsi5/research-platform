import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FlaskConical, MailCheck, ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/auth';
import Spinner from '../../components/ui/Spinner';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again in a moment.');
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
          <h1 className="display text-3xl">Reset your password</h1>
          <p className="text-gray-500 mt-2">We'll email you a link to set a new one</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 ring-1 ring-emerald-600/15 mb-4">
                <MailCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-ink-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                If an account exists for <span className="font-medium text-ink-900">{getValues('email')}</span>,
                we've sent a password reset link. It expires in one hour.
              </p>
              <Link to="/login" className="btn-secondary mt-6">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label" htmlFor="email">Email</label>
                  <input id="email" {...register('email')} type="email" className="input" placeholder="you@university.edu" autoComplete="email" />
                  {errors.email && <p className="error-text">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full justify-center">
                  {isSubmitting ? <Spinner className="h-4 w-4 text-white" /> : 'Send reset link'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                Remembered it?{' '}
                <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
