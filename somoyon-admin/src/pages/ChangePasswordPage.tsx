import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { authApi } from '@/api/endpoints';
import { PageHeader, Spinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export function ChangePasswordPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) return toast.error('নতুন পাসওয়ার্ড দুটি মিলছে না');
    if (newPassword.length < 12) return toast.error('পাসওয়ার্ড কমপক্ষে ১২ অক্ষরের হতে হবে');

    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে');
      await refreshUser();
      navigate('/');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title="পাসওয়ার্ড পরিবর্তন"
        description={user?.mustChangePassword ? 'প্রথমবার লগ ইনে পাসওয়ার্ড পরিবর্তন করা বাধ্যতামূলক।' : undefined}
      />
      <form className="card card-body" onSubmit={submit}>
        <div className="mb-4">
          <label className="label">বর্তমান পাসওয়ার্ড</label>
          <input type="password" className="input" required autoComplete="current-password"
            value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="label">নতুন পাসওয়ার্ড</label>
          <input type="password" className="input" required minLength={12} autoComplete="new-password"
            value={newPassword} onChange={(e) => setNew(e.target.value)} />
          <p className="hint">কমপক্ষে ১২ অক্ষর</p>
        </div>
        <div className="mb-5">
          <label className="label">নতুন পাসওয়ার্ড (পুনরায়)</label>
          <input type="password" className="input" required autoComplete="new-password"
            value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading && <Spinner className="h-4 w-4 text-white" />} সংরক্ষণ করুন
        </button>
      </form>
    </div>
  );
}
