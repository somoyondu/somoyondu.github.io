import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/types';
import { PageLoader } from './ui';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading, can } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="সেশন যাচাই করা হচ্ছে…" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Force a password change before anything else on a seeded account.
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }
  if (roles && !can(...roles)) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="font-semibold text-amber-800">এই পাতায় প্রবেশের অনুমতি নেই</p>
        <p className="mt-1 text-sm text-amber-700">
          প্রয়োজন: {roles.join(', ')} · আপনার ভূমিকা: {user.role}
        </p>
      </div>
    );
  }
  return <Outlet />;
}
