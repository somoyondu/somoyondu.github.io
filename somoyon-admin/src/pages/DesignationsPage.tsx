import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { designationsApi } from '@/api/endpoints';
import {
  ConfirmDialog, ErrorState, Field, Modal, PageHeader, PageLoader, Spinner,
} from '@/components/ui';
import { GROUP_LABELS, GROUP_ORDER, toBn } from '@/lib/constants';
import type { Designation, PositionGroup } from '@/lib/types';

export function DesignationsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Designation | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['designations'],
    queryFn: designationsApi.all,
  });

  const remove = useMutation({
    mutationFn: (id: string) => designationsApi.remove(id),
    onSuccess: () => {
      toast.success('মুছে ফেলা হয়েছে');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['designations'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="পদবি লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="পদবি"
        description="এক জায়গায় সংরক্ষিত পদবির তালিকা — প্রতি বছর নতুন করে টাইপ করার দরকার নেই, তাই বানানের ভুল হয় না।"
        actions={
          <button className="btn-primary" type="button" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> নতুন পদবি
          </button>
        }
      />

      {GROUP_ORDER.map((group) => {
        const rows = (data ?? []).filter((d) => d.group === group);
        if (!rows.length) return null;
        return (
          <div key={group} className="mb-6">
            <h2 className="mb-2 font-bold text-slate-700">{GROUP_LABELS[group]}</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>বাংলা</th>
                    <th>ইংরেজি</th>
                    <th className="w-24">ক্রম</th>
                    <th className="w-24" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((designation) => (
                    <tr key={designation._id}>
                      <td className="font-medium">{designation.nameBn}</td>
                      <td className="text-slate-500">{designation.nameEn ?? '—'}</td>
                      <td className="text-slate-500">{toBn(designation.rank)}</td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn-ghost p-1" type="button" onClick={() => setEditing(designation)}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="btn-ghost p-1 text-brand-accent"
                            type="button"
                            onClick={() => setDeleteId(designation._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <DesignationModal
        designation={editing}
        onClose={() => setEditing(null)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['designations'] })}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="পদবি মুছে ফেলবেন?"
        message="এই পদবি ব্যবহার করা কোনো পদ থাকলে সেটি ভেঙে যেতে পারে। নিশ্চিত হয়ে নিন।"
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </>
  );
}

function DesignationModal({
  designation, onClose, onSaved,
}: { designation: Designation | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const isNew = designation === 'new';
  const current = isNew ? null : designation;
  const [form, setForm] = useState({
    nameBn: '', nameEn: '', group: 'OFFICIAL' as PositionGroup, rank: 100,
  });
  const [ready, setReady] = useState(false);

  if (designation && !ready) {
    setForm({
      nameBn: current?.nameBn ?? '',
      nameEn: current?.nameEn ?? '',
      group: current?.group ?? 'OFFICIAL',
      rank: current?.rank ?? 100,
    });
    setReady(true);
  }

  const close = () => { setReady(false); onClose(); };

  const save = useMutation({
    mutationFn: () => (isNew ? designationsApi.create(form) : designationsApi.update(current!._id, form)),
    onSuccess: () => { toast.success('সংরক্ষিত হয়েছে'); onSaved(); close(); },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <Modal
      open={!!designation}
      onClose={close}
      title={isNew ? 'নতুন পদবি' : 'পদবি সম্পাদনা'}
      footer={
        <>
          <button className="btn-secondary" type="button" onClick={close}>বাতিল</button>
          <button className="btn-primary" type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner className="h-4 w-4 text-white" />} সংরক্ষণ
          </button>
        </>
      }
    >
      <Field label="বাংলা নাম" required>
        <input className="input" value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} />
      </Field>
      <Field label="ইংরেজি নাম">
        <input className="input" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
      </Field>
      <Field label="বিভাগ" required hint="ওয়েবসাইটে কোন ট্যাবে দেখাবে">
        <select
          className="input"
          value={form.group}
          onChange={(e) => setForm({ ...form, group: e.target.value as PositionGroup })}
        >
          {GROUP_ORDER.map((g) => (
            <option key={g} value={g}>{GROUP_LABELS[g]}</option>
          ))}
        </select>
      </Field>
      <Field label="ক্রম" hint="ছোট সংখ্যা আগে দেখাবে">
        <input
          type="number" className="input" value={form.rank}
          onChange={(e) => setForm({ ...form, rank: Number(e.target.value) })}
        />
      </Field>
    </Modal>
  );
}
