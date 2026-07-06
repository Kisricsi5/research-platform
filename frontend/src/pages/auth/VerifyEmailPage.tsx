import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FlaskConical, CheckCircle, XCircle } from 'lucide-react';
import { authApi } from '../../api/auth';
import Spinner from '../../components/ui/Spinner';

type State = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<State>(token ? 'verifying' : 'error');
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [token]);

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#f6f8fd_0%,#f8fafc_70%)]" />
        <div className="absolute -top-24 right-1/4 w-[480px] h-[480px] rounded-full bg-primary-100/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#dbe3f3_1px,transparent_1px)] [background-size:28px_28px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="bg-primary-600 rounded-lg p-2 shadow-[0_4px_12px_-2px_rgba(37,99,235,.4)]">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-ink-900 tracking-tight">ResearchBridge</span>
          </Link>
        </div>

        <div className="card p-8 text-center">
          {state === 'verifying' && (
            <div className="py-6">
              <Spinner className="h-8 w-8 text-primary-600 mx-auto mb-4" />
              <h1 className="font-semibold text-ink-900 mb-1">Verifying your email…</h1>
              <p className="text-sm text-gray-500">This only takes a second.</p>
            </div>
          )}
          {state === 'success' && (
            <div className="py-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 ring-1 ring-emerald-600/15 mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="font-semibold text-ink-900 mb-2">Email verified</h1>
              <p className="text-sm text-gray-600 mb-6">Your account is all set. Welcome to ResearchBridge.</p>
              <Link to="/login" className="btn-primary">Sign in</Link>
            </div>
          )}
          {state === 'error' && (
            <div className="py-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 ring-1 ring-red-600/15 mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h1 className="font-semibold text-ink-900 mb-2">Verification link invalid</h1>
              <p className="text-sm text-gray-600 mb-6">
                This link may have expired or already been used. You can still sign in —
                if your email isn't verified yet, we can send a new link.
              </p>
              <Link to="/login" className="btn-primary">Go to sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
