import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { usersApi } from '@/api/endpoints';
import {
  ConfirmDialog, ErrorState, Field, Modal, PageHeader, PageLoader, Spinner,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/lib/constants';
import type { AuthUser, Role } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export function UsersPage() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [editing, setEditing] = useState<AuthUser | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list({ limit: 100 }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      toast.success('অ্যাকাউন্ট মুছে ফেলা হয়েছে');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="ইউজার লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="অ্যাডমিন ইউজার"
        description="একাধিক অ্যাডমিন একসাথে কাজ করতে পারেন। প্রতিটি পরিবর্তন লগে সংরক্ষিত হয়।"
        actions={
          <button className="btn-primary" type="button" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> নতুন ইউজার
          </button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([role, label]) => (
          <div key={role} className="card card-body">
            <p className="font-semibold text-brand">{label}</p>
            <p className="mt-1 text-xs text-slate-500">
              {role === 'SUPER_ADMIN' && 'সব কিছু + ইউজার ব্যবস্থাপনা'}
              {role === 'ADMIN' && 'কনটেন্ট প্রকাশ, সেটিংস, মুছে ফেলা'}
              {role === 'EDITOR' && 'কনটেন্ট তৈরি ও সম্পাদনা (প্রকাশ নয়)'}
            </p>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>নাম</th>
              <th>ইমেইল</th>
              <th className="w-36">ভূমিকা</th>
              <th className="w-44">সর্বশেষ লগ ইন</th>
              <th className="w-24">অবস্থা</th>
              <th className="w-24" />
            </tr>
          </thead>
          <tbody>
            {data?.data.map((user: any) => (
              <tr key={user._id}>
                <td className="font-medium">{user.nameBn || user.name}</td>
                <td className="text-slate-600">{user.email}</td>
                <td>{ROLE_LABELS[user.role as Role]}</td>
                <td className="text-sm text-slate-500">{formatDateTime(user.lastLoginAt)}</td>
                <td>
                  {user.isActive ? (
                    <span className="badge-published">সক্রিয়</span>
                  ) : (
                    <span className="badge-archived">নিষ্ক্রিয়</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn-ghost p-1" type="button" onClick={() => setEditing(user)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    {user._id !== me?.id && (
                      <button className="btn-ghost p-1 text-brand-accent" type="button"
                        onClick={() => setDeleteId(user._id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['users'] })}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="অ্যাকাউন্ট মুছে ফেলবেন?"
        message="এই ব্যক্তি আর লগ ইন করতে পারবেন না। তাদের তৈরি কনটেন্ট থেকে যাবে।"
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </>
  );
}

function UserModal({
  user, onClose, onSaved,
}: { user: AuthUser | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const isNew = user === 'new';
  const current = isNew ? null : (user as any);
  const [form, setForm] = useState({
    name: '', nameBn: '', email: '', password: '', role: 'EDITOR' as Role, isActive: true,
  });
  const [ready, setReady] = useState(false);

  if (user && !ready) {
    setForm({
      name: current?.name ?? '',
      nameBn: current?.nameBn ?? '',
      email: current?.email ?? '',
      password: '',
      role: current?.role ?? 'EDITOR',
      isActive: current?.isActive ?? true,
    });
    setReady(true);
  }

  const close = () => { setReady(false); onClose(); };

  const save = useMutation({
    mutationFn: () => {
      const body: any = { ...form };
      if (!isNew && !form.password) delete body.password;
      return isNew ? usersApi.create(body) : usersApi.update(current._id, body);
    },
    onSuccess: () => {
      toast.success(isNew ? 'ইউজার তৈরি হয়েছে — প্রথম লগ ইনে পাসওয়ার্ড পরিবর্তন করতে হবে' : 'সংরক্ষিত হয়েছে');
      onSaved();
      close();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <Modal
      open={!!user}
      onClose={close}
      title={isNew ? 'নতুন অ্যাডমিন ইউজার' : 'ইউজার সম্পাদনা'}
      footer={
        <>
          <button className="btn-secondary" type="button" onClick={close}>বাতিল</button>
          <button className="btn-primary" type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner className="h-4 w-4 text-white" />} সংরক্ষণ
          </button>
        </>
      }
    >
      <Field label="নাম (ইংরেজি)" required>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="নাম (বাংলা)">
        <input className="input" value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} />
      </Field>
      <Field label="ইমেইল" required>
        <input type="email" className="input" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <Field
        label={isNew ? 'পাসওয়ার্ড' : 'নতুন পাসওয়ার্ড'}
        required={isNew}
        hint="কমপক্ষে ১২ অক্ষর। ইউজারকে প্রথম লগ ইনেই পরিবর্তন করতে বলা হবে।"
      >
        <input type="text" className="input" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </Field>
      <Field label="ভূমিকা" required>
        <select className="input" value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
          {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([role, label]) => (
            <option key={role} value={role}>{label}</option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
        অ্যাকাউন্ট সক্রিয়
      </label>
    </Modal>
  );
}
