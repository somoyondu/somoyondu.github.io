import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { advisorsApi } from '@/api/endpoints';
import { ImageField } from '@/components/MediaPicker';
import { SortableList } from '@/components/SortableList';
import {
  ConfirmDialog, EmptyState, ErrorState, Field, Modal, PageHeader, PageLoader, Spinner,
} from '@/components/ui';
import type { Advisor, Media } from '@/lib/types';
import { thumb, toReorderPayload } from '@/lib/utils';

export function AdvisorsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Advisor | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<Advisor[] | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['advisors'],
    queryFn: () => advisorsApi.list({ limit: 100, sort: 'displayOrder' }),
  });

  const advisors = localOrder ?? data?.data ?? [];

  const reorder = useMutation({
    mutationFn: (next: Advisor[]) => advisorsApi.reorder(toReorderPayload(next).items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['advisors'] }),
    onError: (err) => { toast.error(apiError(err)); setLocalOrder(null); },
  });

  const remove = useMutation({
    mutationFn: (id: string) => advisorsApi.remove(id),
    onSuccess: () => {
      toast.success('মুছে ফেলা হয়েছে');
      setDeleteId(null);
      setLocalOrder(null);
      qc.invalidateQueries({ queryKey: ['advisors'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="উপদেষ্টা তালিকা লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="উপদেষ্টামণ্ডলী"
        description="টেনে এনে ক্রম পরিবর্তন করুন — ওয়েবসাইটেও একই ক্রমে দেখাবে।"
        actions={
          <button className="btn-primary" type="button" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> নতুন উপদেষ্টা
          </button>
        }
      />

      {!advisors.length ? (
        <EmptyState title="কোনো উপদেষ্টা যোগ করা হয়নি" />
      ) : (
        <SortableList
          items={advisors}
          onReorder={(next) => { setLocalOrder(next); reorder.mutate(next); }}
          renderItem={(advisor) => (
            <div className="flex items-center gap-3">
              <img
                src={thumb(advisor.photo, 96) ?? ''}
                alt=""
                className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{advisor.name}</p>
                <p className="truncate text-sm text-slate-500">{advisor.designation}</p>
              </div>
              {!advisor.isActive && <span className="badge-archived">নিষ্ক্রিয়</span>}
              <button className="btn-ghost p-1" type="button" onClick={() => setEditing(advisor)}>
                <Pencil className="h-4 w-4" />
              </button>
              <button
                className="btn-ghost p-1 text-brand-accent"
                type="button"
                onClick={() => setDeleteId(advisor._id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      )}

      <AdvisorModal
        advisor={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setLocalOrder(null); qc.invalidateQueries({ queryKey: ['advisors'] }); }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="উপদেষ্টা মুছে ফেলবেন?"
        message="এই তথ্য ওয়েবসাইট থেকে সরে যাবে।"
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </>
  );
}

function AdvisorModal({
  advisor, onClose, onSaved,
}: { advisor: Advisor | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const isNew = advisor === 'new';
  const current = isNew ? null : advisor;
  const [form, setForm] = useState({ name: '', designation: '', organization: '', isActive: true });
  const [photo, setPhoto] = useState<Media | null>(null);
  const [ready, setReady] = useState(false);

  if (advisor && !ready) {
    setForm({
      name: current?.name ?? '',
      designation: current?.designation ?? '',
      organization: current?.organization ?? '',
      isActive: current?.isActive ?? true,
    });
    setPhoto(current?.photo ?? null);
    setReady(true);
  }

  const close = () => { setReady(false); onClose(); };

  const save = useMutation({
    mutationFn: () => {
      const body = { ...form, photo: photo?._id };
      return isNew ? advisorsApi.create(body) : advisorsApi.update(current!._id, body);
    },
    onSuccess: () => { toast.success('সংরক্ষিত হয়েছে'); onSaved(); close(); },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <Modal
      open={!!advisor}
      onClose={close}
      title={isNew ? 'নতুন উপদেষ্টা' : 'উপদেষ্টা সম্পাদনা'}
      footer={
        <>
          <button className="btn-secondary" type="button" onClick={close}>বাতিল</button>
          <button className="btn-primary" type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner className="h-4 w-4 text-white" />} সংরক্ষণ
          </button>
        </>
      }
    >
      <ImageField label="ছবি" value={photo} onChange={setPhoto} folder="advisors" />
      <Field label="নাম" required>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="পদবি / পরিচয়" required hint="যেমন: সাবেক উপাচার্য, ঢাকা বিশ্ববিদ্যালয়">
        <input className="input" value={form.designation}
          onChange={(e) => setForm({ ...form, designation: e.target.value })} />
      </Field>
      <Field label="প্রতিষ্ঠান">
        <input className="input" value={form.organization}
          onChange={(e) => setForm({ ...form, organization: e.target.value })} />
      </Field>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
        ওয়েবসাইটে দেখান
      </label>
    </Modal>
  );
}
