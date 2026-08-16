import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '@/api/endpoints';
import { refreshAccessToken, setAccessToken, setUnauthorizedHandler } from '@/api/client';
import type { AuthUser, Role } from '@/lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  can: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined);
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAccessToken(null);
      setUser(null);
    });
  }, []);

  // On boot, try the refresh cookie so a reload keeps the session.
  useEffect(() => {
    (async () => {
      const token = await refreshAccessToken();
      if (token) {
        const me = await authApi.me().catch(() => null);
        if (me) setUser({ ...me, id: (me as any)._id ?? me.id });
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const res = await authApi.googleLogin(idToken);
    setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.me().catch(() => null);
    if (me) setUser({ ...me, id: (me as any)._id ?? me.id });
  }, []);

  const can = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo(
    () => ({ user, loading, login, loginWithGoogle, logout, refreshUser, can }),
    [user, loading, login, loginWithGoogle, logout, refreshUser, can],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
