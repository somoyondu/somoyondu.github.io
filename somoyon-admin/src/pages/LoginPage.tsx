import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { authApi } from '@/api/endpoints';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'google' | 'password' | 'forgot'>('google');

  const finish = useCallback(
    (user: { name: string; nameBn?: string; mustChangePassword?: boolean }) => {
      toast.success(`স্বাগতম, ${user.nameBn ?? user.name}`);
      navigate(user.mustChangePassword ? '/change-password' : '/', { replace: true });
    },
    [navigate],
  );

  const handleGoogleToken = useCallback(
    async (idToken: string) => {
      setLoading(true);
      try {
        finish(await loginWithGoogle(idToken));
      } catch (err) {
        toast.error(apiError(err));
      } finally {
        setLoading(false);
      }
    },
    [loginWithGoogle, finish],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'forgot') {
        await authApi.forgotPassword(email);
        toast.success('অ্যাকাউন্টটি থাকলে রিসেট লিংক পাঠানো হয়েছে');
        setMode('password');
      } else {
        finish(await login(email, password));
      }
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-brand">সময়ন</h1>
          <p className="mt-1 text-sm text-slate-500">কনটেন্ট ম্যানেজমেন্ট সিস্টেম</p>
        </div>

        {mode === 'google' ? (
          <>
            <div className="flex justify-center">
              <GoogleSignInButton onToken={handleGoogleToken} disabled={loading} />
            </div>

            {loading && (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                <Spinner className="h-4 w-4" /> যাচাই করা হচ্ছে…
              </p>
            )}

            <p className="mt-5 rounded-lg bg-brand-cream p-3 text-center text-xs text-slate-600">
              শুধুমাত্র অনুমোদিত অ্যাডমিন ইমেইল দিয়ে প্রবেশ করা যাবে। অন্য কোনো
              Google অ্যাকাউন্ট গ্রহণ করা হবে না।
            </p>

            <button
              type="button"
              className="mt-4 w-full text-center text-sm text-slate-400 hover:text-brand"
              onClick={() => setMode('password')}
            >
              পাসওয়ার্ড দিয়ে লগ ইন করুন
            </button>
          </>
        ) : (
          <>
            <form onSubmit={submit}>
              <div className="mb-4">
                <label className="label" htmlFor="email">ইমেইল</label>
                <input
                  id="email" type="email" className="input" required autoComplete="username"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {mode === 'password' && (
                <div className="mb-4">
                  <label className="label" htmlFor="password">পাসওয়ার্ড</label>
                  <input
                    id="password" type="password" className="input" required
                    autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading && <Spinner className="h-4 w-4 text-white" />}
                {mode === 'forgot' ? 'রিসেট লিংক পাঠান' : 'লগ ইন করুন'}
              </button>
            </form>

            <div className="mt-4 flex flex-col gap-2 text-center text-sm">
              {mode === 'password' && (
                <button type="button" className="text-slate-500 hover:text-brand"
                  onClick={() => setMode('forgot')}>
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              )}
              <button type="button" className="text-slate-400 hover:text-brand"
                onClick={() => setMode('google')}>
                ← Google দিয়ে লগ ইনে ফিরে যান
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
