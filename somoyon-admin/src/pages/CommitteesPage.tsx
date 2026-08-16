import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { committeesApi } from '@/api/endpoints';
import {
  ConfirmDialog, EmptyState, ErrorState, Field, Modal, PageHeader, PageLoader, Spinner, StatusBadge,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { toBn } from '@/lib/constants';

export function CommitteesPage() {
  const qc = useQueryClient();
  const { can } = useAuth();
  const [cloneOpen, setCloneOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['committees'],
    queryFn: committeesApi.summary,
  });

  const years = data?.map((c) => c.year) ?? [];
  const latest = years.length ? Math.max(...years) : new Date().getFullYear();

  const [sourceYear, setSourceYear] = useState(latest);
  const [targetYear, setTargetYear] = useState(latest + 1);
  const [copyPeople, setCopyPeople] = useState(true);

  const clone = useMutation({
    mutationFn: () => committeesApi.clone({ sourceYear, targetYear, copyPeople }),
    onSuccess: (res) => {
      toast.success(`${toBn(targetYear)} সালের খসড়া কমিটি তৈরি হয়েছে (${toBn(res.positionsCopied)} টি পদ)`);
      setCloneOpen(false);
      qc.invalidateQueries({ queryKey: ['committees'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const publish = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => committeesApi.publish(id, status),
    onSuccess: () => {
      toast.success('স্ট্যাটাস পরিবর্তন হয়েছে');
      qc.invalidateQueries({ queryKey: ['committees'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => committeesApi.remove(id),
    onSuccess: () => {
      toast.success('কমিটি মুছে ফেলা হয়েছে');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['committees'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="কমিটির তালিকা লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="কার্যনির্বাহী পরিষদ"
        description="প্রতি বছরের কমিটি এখান থেকে পরিচালনা করুন। নতুন বছরের কমিটি তৈরি করতে আগের বছরটি কপি করুন।"
        actions={
          can('SUPER_ADMIN', 'ADMIN') && (
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                setSourceYear(latest);
                setTargetYear(latest + 1);
                setCloneOpen(true);
              }}
            >
              <Copy className="h-4 w-4" /> নতুন বছরের কমিটি তৈরি করুন
            </button>
          )
        }
      />

      {!data?.length ? (
        <EmptyState
          title="এখনো কোনো কমিটি নেই"
          description="মাইগ্রেশন স্ক্রিপ্ট চালান অথবা নতুন কমিটি তৈরি করুন।"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((committee) => (
            <div key={committee._id} className="card card-body">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-brand">{toBn(committee.year)}</p>
                  <p className="text-sm text-slate-600">{committee.title}</p>
                </div>
                <StatusBadge status={committee.status} />
              </div>

              <p className="mb-4 text-sm text-slate-500">
                {toBn(committee.positionCount ?? 0)} জন সদস্য
                {committee.isFounding && ' · প্রতিষ্ঠাতা কমিটি'}
              </p>

              <div className="flex flex-wrap gap-2">
                <Link to={`/committees/${committee._id}`} className="btn-secondary">
                  <Pencil className="h-4 w-4" /> সম্পাদনা
                </Link>
                {can('SUPER_ADMIN', 'ADMIN') && (
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={() =>
                      publish.mutate({
                        id: committee._id,
                        status: committee.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                      })
                    }
                  >
                    <Eye className="h-4 w-4" />
                    {committee.status === 'PUBLISHED' ? 'খসড়া করুন' : 'প্রকাশ করুন'}
                  </button>
                )}
                {can('SUPER_ADMIN', 'ADMIN') && (
                  <button
                    className="btn-ghost text-brand-accent"
                    type="button"
                    onClick={() => setDeleteId(committee._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={cloneOpen}
        onClose={() => setCloneOpen(false)}
        title="নতুন বছরের কমিটি তৈরি"
        footer={
          <>
            <button className="btn-secondary" type="button" onClick={() => setCloneOpen(false)}>বাতিল</button>
            <button className="btn-primary" type="button" disabled={clone.isPending} onClick={() => clone.mutate()}>
              {clone.isPending && <Spinner className="h-4 w-4 text-white" />}
              <Plus className="h-4 w-4" /> তৈরি করুন
            </button>
          </>
        }
      >
        <p className="mb-4 rounded-lg bg-brand-cream p-3 text-sm text-slate-700">
          আগের বছরের পদবিন্যাস কপি হয়ে <b>খসড়া</b> হিসেবে তৈরি হবে। এরপর ব্যক্তিদের বদলে
          প্রকাশ করলেই ওয়েবসাইটে দেখা যাবে — কোনো কোড পরিবর্তনের প্রয়োজন নেই।
        </p>

        <Field label="কোন বছর থেকে কপি করবেন" required>
          <select className="input" value={sourceYear} onChange={(e) => setSourceYear(Number(e.target.value))}>
            {years.sort((a, b) => b - a).map((y) => (
              <option key={y} value={y}>{toBn(y)}</option>
            ))}
          </select>
        </Field>

        <Field label="নতুন বছর" required>
          <input
            type="number" className="input" value={targetYear}
            onChange={(e) => setTargetYear(Number(e.target.value))}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={copyPeople} onChange={(e) => setCopyPeople(e.target.checked)} />
          একই ব্যক্তিদেরও কপি করুন (পরে পরিবর্তন করা যাবে)
        </label>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="কমিটি মুছে ফেলবেন?"
        message="এই বছরের সব পদ ও সদস্য সংযুক্তি মুছে যাবে। ব্যক্তি রেকর্ড থাকবে। এটি ফেরানো যাবে না।"
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </>
  );
}
