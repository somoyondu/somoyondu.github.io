import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { eventsApi } from '@/api/endpoints';
import { ImageField } from '@/components/MediaPicker';
import { RichTextEditor } from '@/components/RichTextEditor';
import {
  ConfirmDialog, EmptyState, ErrorState, Field, Modal, PageHeader, PageLoader, Pagination, Spinner,
  StatusBadge,
} from '@/components/ui';
import type { ContentStatus, EventItem, Media } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function EventsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<EventItem | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['events', page],
    queryFn: () => eventsApi.list({ page, limit: 20 }),
  });

  const publish = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => eventsApi.publish(id, status),
    onSuccess: () => { toast.success('স্ট্যাটাস পরিবর্তন হয়েছে'); qc.invalidateQueries({ queryKey: ['events'] }); },
    onError: (err) => toast.error(apiError(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => eventsApi.remove(id),
    onSuccess: () => {
      toast.success('মুছে ফেলা হয়েছে');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="ইভেন্ট লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="ইভেন্টস"
        description="আসন্ন ও অতীত কার্যক্রম। প্রকাশ করলেই ওয়েবসাইটে দেখা যাবে।"
        actions={
          <button className="btn-primary" type="button" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> নতুন ইভেন্ট
          </button>
        }
      />

      {!data?.data.length ? (
        <EmptyState title="কোনো ইভেন্ট নেই" description="প্রথম ইভেন্টটি যোগ করুন।" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>শিরোনাম</th>
                <th className="w-40">তারিখ</th>
                <th className="w-32">স্ট্যাটাস</th>
                <th className="w-40" />
              </tr>
            </thead>
            <tbody>
              {data.data.map((event) => (
                <tr key={event._id}>
                  <td>
                    <p className="font-medium text-slate-800">{event.titleBn || event.title}</p>
                    {event.venue && <p className="text-xs text-slate-500">{event.venueBn || event.venue}</p>}
                  </td>
                  <td className="text-slate-600">{formatDate(event.startAt)}</td>
                  <td><StatusBadge status={event.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-ghost p-1" type="button" onClick={() => setEditing(event)}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="btn-ghost p-1"
                        type="button"
                        title={event.status === 'PUBLISHED' ? 'খসড়া করুন' : 'প্রকাশ করুন'}
                        onClick={() =>
                          publish.mutate({
                            id: event._id,
                            status: event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                          })
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="btn-ghost p-1 text-brand-accent"
                        type="button"
                        onClick={() => setDeleteId(event._id)}
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
      )}

      <Pagination meta={data?.meta} onPage={setPage} />

      <EventModal
        event={editing}
        onClose={() => setEditing(null)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['events'] })}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="ইভেন্ট মুছে ফেলবেন?"
        message="এটি ফেরানো যাবে না।"
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </>
  );
}

function EventModal({
  event, onClose, onSaved,
}: { event: EventItem | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const isNew = event === 'new';
  const current = isNew ? null : event;
  const [form, setForm] = useState({
    title: '', titleBn: '', excerpt: '', venue: '', venueBn: '', registrationUrl: '',
    startAt: '', endAt: '', status: 'DRAFT' as ContentStatus, isFeatured: false,
  });
  const [content, setContent] = useState('');
  const [cover, setCover] = useState<Media | null>(null);
  const [ready, setReady] = useState(false);

  if (event && !ready) {
    setForm({
      title: current?.title ?? '',
      titleBn: current?.titleBn ?? '',
      excerpt: current?.excerpt ?? '',
      venue: current?.venue ?? '',
      venueBn: current?.venueBn ?? '',
      registrationUrl: current?.registrationUrl ?? '',
      startAt: current?.startAt ? current.startAt.slice(0, 16) : '',
      endAt: current?.endAt ? current.endAt.slice(0, 16) : '',
      status: current?.status ?? 'DRAFT',
      isFeatured: current?.isFeatured ?? false,
    });
    setContent(current?.content ?? '');
    setCover(current?.coverImage ?? null);
    setReady(true);
  }

  const close = () => { setReady(false); onClose(); };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        ...form,
        endAt: form.endAt || undefined,
        registrationUrl: form.registrationUrl || undefined,
        startAt: new Date(form.startAt).toISOString(),
        content,
        coverImage: cover?._id,
      };
      return isNew ? eventsApi.create(body) : eventsApi.update(current!._id, body);
    },
    onSuccess: () => { toast.success('সংরক্ষিত হয়েছে'); onSaved(); close(); },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <Modal
      open={!!event}
      onClose={close}
      wide
      title={isNew ? 'নতুন ইভেন্ট' : 'ইভেন্ট সম্পাদনা'}
      footer={
        <>
          <button className="btn-secondary" type="button" onClick={close}>বাতিল</button>
          <button className="btn-primary" type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner className="h-4 w-4 text-white" />} সংরক্ষণ
          </button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Field label="শিরোনাম (বাংলা)" required>
            <input className="input" value={form.titleBn}
              onChange={(e) => setForm({ ...form, titleBn: e.target.value })} />
          </Field>
          <Field label="শিরোনাম (ইংরেজি)" required hint="URL তৈরিতে ব্যবহৃত হয়">
            <input className="input" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="সংক্ষিপ্ত বিবরণ" hint="তালিকায় ও শেয়ার প্রিভিউতে দেখাবে">
            <textarea className="input" rows={2} value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </Field>
          <Field label="বিস্তারিত">
            <RichTextEditor value={content} onChange={setContent} />
          </Field>
        </div>

        <div>
          <ImageField label="কভার ছবি" value={cover} onChange={setCover} folder="events" size={120} />
          <Field label="শুরুর সময়" required>
            <input type="datetime-local" className="input" value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
          </Field>
          <Field label="শেষের সময়">
            <input type="datetime-local" className="input" value={form.endAt}
              onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
          </Field>
          <Field label="স্থান">
            <input className="input" value={form.venueBn}
              onChange={(e) => setForm({ ...form, venueBn: e.target.value })} />
          </Field>
          <Field label="রেজিস্ট্রেশন লিংক">
            <input className="input" value={form.registrationUrl}
              onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })} />
          </Field>
          <Field label="স্ট্যাটাস">
            <select className="input" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ContentStatus })}>
              <option value="DRAFT">খসড়া</option>
              <option value="PUBLISHED">প্রকাশিত</option>
              <option value="ARCHIVED">আর্কাইভ</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            হোমপেজে ফিচার করুন
          </label>
        </div>
      </div>
    </Modal>
  );
}
