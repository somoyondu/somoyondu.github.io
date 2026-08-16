import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { contactApi } from '@/api/endpoints';
import {
  ConfirmDialog, EmptyState, ErrorState, Modal, PageHeader, PageLoader, Pagination,
} from '@/components/ui';
import { SUBMISSION_LABELS } from '@/lib/constants';
import type { ContactSubmission, SubmissionStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export function InboxPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SubmissionStatus | ''>('');
  const [open, setOpen] = useState<ContactSubmission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inbox', page, status],
    queryFn: () => contactApi.list({ page, limit: 20, status: status || undefined }),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => contactApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inbox'] });
      qc.invalidateQueries({ queryKey: ['inbox-unread'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => contactApi.remove(id),
    onSuccess: () => {
      toast.success('মুছে ফেলা হয়েছে');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="বার্তা লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader title="বার্তা" description="ওয়েবসাইটের যোগাযোগ ফর্ম থেকে আসা বার্তা।" />

      <select
        className="input mb-4 max-w-xs"
        value={status}
        onChange={(e) => { setStatus(e.target.value as SubmissionStatus | ''); setPage(1); }}
      >
        <option value="">সব বার্তা</option>
        {Object.entries(SUBMISSION_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      {!data?.data.length ? (
        <EmptyState title="কোনো বার্তা নেই" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>প্রেরক</th>
                <th>বিষয়</th>
                <th className="w-44">সময়</th>
                <th className="w-28">স্ট্যাটাস</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody>
              {data.data.map((item) => (
                <tr key={item._id} className={item.status === 'NEW' ? 'font-semibold' : ''}>
                  <td>
                    <button
                      type="button"
                      className="text-left hover:text-brand"
                      onClick={() => {
                        setOpen(item);
                        if (item.status === 'NEW') update.mutate({ id: item._id, body: { status: 'READ' } });
                      }}
                    >
                      <p>{item.name}</p>
                      <p className="text-xs font-normal text-slate-500">{item.email}</p>
                    </button>
                  </td>
                  <td>{item.subject}</td>
                  <td className="text-sm text-slate-500">{formatDateTime(item.createdAt)}</td>
                  <td>
                    <select
                      className="rounded border border-slate-200 px-2 py-1 text-xs"
                      value={item.status}
                      onChange={(e) => update.mutate({ id: item._id, body: { status: e.target.value } })}
                    >
                      {Object.entries(SUBMISSION_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn-ghost p-1 text-brand-accent" type="button"
                      onClick={() => setDeleteId(item._id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={data?.meta} onPage={setPage} />

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.subject ?? ''}
        footer={
          open && (
            <a className="btn-primary" href={`mailto:${open.email}?subject=Re: ${open.subject}`}>
              <Mail className="h-4 w-4" /> উত্তর দিন
            </a>
          )
        }
      >
        {open && (
          <>
            <p className="mb-3 text-sm text-slate-500">
              {open.name} · {open.email}
              {open.phone ? ` · ${open.phone}` : ''}
              <br />
              {formatDateTime(open.createdAt)}
            </p>
            <p className="whitespace-pre-wrap text-slate-700">{open.message}</p>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="বার্তা মুছে ফেলবেন?"
        message="এটি ফেরানো যাবে না।"
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </>
  );
}
