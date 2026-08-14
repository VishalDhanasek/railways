import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { TrainFront, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PhotoCarousel from '@/components/login/PhotoCarousel';
import TrainLoaderOverlay from '@/components/login/TrainLoaderOverlay';
import { withMinDuration } from '@/utils/withMinDuration';

const LOADING_MESSAGES = ['Verifying credentials…', 'Checking the crew roster…', 'Clearing the signal…', 'Almost there…'];

export default function Login() {
  const { user, initializing, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  // Cycle the overlay's status line so the loader feels alive, not frozen.
  useEffect(() => {
    if (!submitting) return;
    setLoadingMessage(LOADING_MESSAGES[0]);
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[i]);
    }, 650);
    return () => clearInterval(t);
  }, [submitting]);

  // Skip the auto-redirect while a submit is in flight — otherwise the
  // moment AuthContext's user state updates, this component re-renders and
  // bails out via <Navigate> before the deliberately-visible loader below
  // has had its minimum on-screen time (see withMinDuration in handleSubmit).
  if (!initializing && user && !submitting) {
    const from = (location.state as { from?: string } | null)?.from || '/';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Deliberately kept visible for a beat, even on a fast mock check —
      // otherwise the loader flashes for a single frame and nobody sees it.
      await withMinDuration(() => login(username, password), 2000);
      const from = (location.state as { from?: string } | null)?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {submitting && <TrainLoaderOverlay message={loadingMessage} />}

      {/* Brand panel — full-bleed photo with the logo/heading overlaid in the gradient fades */}
      <div className="relative hidden w-[46%] max-w-lg shrink-0 overflow-hidden bg-brand-950 text-white md:block">
        <PhotoCarousel />

        <div className="relative z-10 inline-flex items-center gap-2.5 px-10 pt-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600">
            <TrainFront className="h-4 w-4 text-white" />
          </div>
          <p className="text-[14px] font-bold tracking-wide">NOMENCLATURE</p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-10 pb-8">
          <h1 className="text-2xl font-semibold leading-snug">
            Nomenclature &amp;<br />Stores Management
          </h1>
          <p className="mt-3 max-w-xs text-[13.5px] leading-relaxed text-blue-100/70">
            A unified workspace for coach &amp; wagon alteration registers and stores stocking
            application records.
          </p>
          <div className="rail-track-invert mt-6 max-w-xs" />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center gap-2 text-center md:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600">
              <TrainFront className="h-5 w-5 text-white" />
            </div>
            <p className="text-[15px] font-bold tracking-wide text-slate-800">NOMENCLATURE</p>
          </div>

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-800">Sign in</h2>
            <p className="mt-1 text-[13px] text-slate-500">Enter your credentials to access the application.</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <label className="mb-4 block">
              <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Username</span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoFocus
                autoComplete="username"
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Password</span>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <Button type="submit" variant="primary" fullWidth disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-4 text-center text-[11.5px] text-slate-400">
            Access is controlled via the credentials workbook maintained by your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
