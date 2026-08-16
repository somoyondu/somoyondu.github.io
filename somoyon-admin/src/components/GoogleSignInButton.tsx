import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { authApi } from '@/api/endpoints';

declare global {
  interface Window {
    google?: any;
  }
}

const SCRIPT_ID = 'google-identity-services';

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google স্ক্রিপ্ট লোড করা যায়নি'));
    document.head.appendChild(script);
  });
}

/**
 * Renders Google's official sign-in button. The ID token it produces is sent
 * to the API, which only accepts it if the email already belongs to an active
 * admin — signing in with Google never creates an account.
 */
export function GoogleSignInButton({
  onToken, disabled,
}: { onToken: (idToken: string) => void; disabled?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  const { data: config, isLoading } = useQuery({
    queryKey: ['google-config'],
    queryFn: authApi.googleConfig,
    retry: 0,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!config?.enabled || !config.clientId || !container.current) return;

    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !container.current) return;
        window.google.accounts.id.initialize({
          client_id: config.clientId,
          callback: (response: { credential: string }) => onToken(response.credential),
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
        });
        window.google.accounts.id.renderButton(container.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'rectangular',
          locale: 'bn',
        });
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [config, onToken]);

  if (isLoading) return <div className="h-10 animate-pulse rounded-lg bg-slate-100" />;

  if (!config?.enabled) {
    return (
      <p className="rounded-lg bg-slate-100 p-3 text-center text-xs text-slate-500">
        Google সাইন-ইন এখনো কনফিগার করা হয়নি
      </p>
    );
  }

  return (
    <div>
      <div ref={container} className={disabled ? 'pointer-events-none opacity-50' : ''} />
      {error && <p className="error-text text-center">{error}</p>}
    </div>
  );
}
