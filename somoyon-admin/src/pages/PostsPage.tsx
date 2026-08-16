import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Pin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { postsApi } from '@/api/endpoints';
import { ImageField } from '@/components/MediaPicker';
import { RichTextEditor } from '@/components/RichTextEditor';
import {
  ConfirmDialog, EmptyState, ErrorState, Field, Modal, PageHeader, PageLoader, Pagination, Spinner,
  StatusBadge,
} from '@/components/ui';
import { CATEGORY_LABELS, toBn } from '@/lib/constants';
import type { ContentStatus, Media, PostCategory, PostItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function PostsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<PostCategory | ''>('');
  const [editing, setEditing] = useState<PostItem | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', page, category],
    queryFn: () => postsApi.list({ page, limit: 20, category: category || undefined }),
  });

  const publish = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => postsApi.publish(id, status),
    onSuccess: () => { toast.success('স্ট্যাটাস পরিবর্তন হয়েছে'); qc.invalidateQueries({ queryKey: ['posts'] }); },
    onError: (err) => toast.error(apiError(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => postsApi.remove(id),
    onSuccess: () => {
      toast.success('মুছে ফেলা হয়েছে');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="পোস্ট লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="নোটিশ ও ব্লগ"
        description="সংগঠনের ঘোষণা, নোটিশ ও লেখা প্রকাশ করুন।"
        actions={
          <button className="btn-primary" type="button" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> নতুন লেখা
          </button>
        }
      />

      <select
        className="input mb-4 max-w-xs"
        value={category}
        onChange={(e) => { setCategory(e.target.value as PostCategory | ''); setPage(1); }}
      >
        <option value="">সব ক্যাটাগরি</option>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>

      {!data?.data.length ? (
        <EmptyState title="কোনো লেখা নেই" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>শিরোনাম</th>
                <th className="w-28">ক্যাটাগরি</th>
                <th className="w-36">প্রকাশ</th>
                <th className="w-24">ভিউ</th>
                <th className="w-28">স্ট্যাটাস</th>
                <th className="w-40" />
              </tr>
            </thead>
            <tbody>
              {data.data.map((post) => (
                <tr key={post._id}>
                  <td className="font-medium text-slate-800">
                    {post.isPinned && <Pin className="mr-1 inline h-3 w-3 text-brand" />}
                    {post.titleBn || post.title}
                  </td>
                  <td className="text-slate-600">{CATEGORY_LABELS[post.category]}</td>
                  <td className="text-slate-600">{formatDate(post.publishedAt)}</td>
                  <td className="text-slate-500">{toBn(post.viewCount ?? 0)}</td>
                  <td><StatusBadge status={post.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-ghost p-1" type="button" onClick={() => setEditing(post)}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="btn-ghost p-1"
                        type="button"
                        onClick={() =>
                          publish.mutate({
                            id: post._id,
                            status: post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                          })
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="btn-ghost p-1 text-brand-accent"
                        type="button"
                        onClick={() => setDeleteId(post._id)}
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

      <PostModal
        post={editing}
        onClose={() => setEditing(null)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['posts'] })}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="লেখাটি মুছে ফেলবেন?"
        message="এটি ফেরানো যাবে না।"
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </>
  );
}

function PostModal({
  post, onClose, onSaved,
}: { post: PostItem | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const isNew = post === 'new';
  const current = isNew ? null : post;
  const [form, setForm] = useState({
    title: '', titleBn: '', excerpt: '', category: 'NOTICE' as PostCategory,
    status: 'DRAFT' as ContentStatus, isPinned: false, tags: '',
    metaTitle: '', metaDescription: '',
  });
  const [content, setContent] = useState('');
  const [cover, setCover] = useState<Media | null>(null);
  const [ready, setReady] = useState(false);

  if (post && !ready) {
    setForm({
      title: current?.title ?? '',
      titleBn: current?.titleBn ?? '',
      excerpt: current?.excerpt ?? '',
      category: current?.category ?? 'NOTICE',
      status: current?.status ?? 'DRAFT',
      isPinned: current?.isPinned ?? false,
      tags: (current?.tags ?? []).join(', '),
      metaTitle: current?.seo?.metaTitle ?? '',
      metaDescription: current?.seo?.metaDescription ?? '',
    });
    setContent(current?.content ?? '');
    setCover(current?.coverImage ?? null);
    setReady(true);
  }

  const close = () => { setReady(false); onClose(); };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        title: form.title,
        titleBn: form.titleBn,
        excerpt: form.excerpt || undefined,
        category: form.category,
        status: form.status,
        isPinned: form.isPinned,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        content,
        coverImage: cover?._id,
        seo: { metaTitle: form.metaTitle || undefined, metaDescription: form.metaDescription || undefined },
      };
      return isNew ? postsApi.create(body) : postsApi.update(current!._id, body);
    },
    onSuccess: () => { toast.success('সংরক্ষিত হয়েছে'); onSaved(); close(); },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <Modal
      open={!!post}
      onClose={close}
      wide
      title={isNew ? 'নতুন লেখা' : 'লেখা সম্পাদনা'}
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
          <Field label="সারসংক্ষেপ">
            <textarea className="input" rows={2} value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </Field>
          <Field label="মূল লেখা">
            <RichTextEditor value={content} onChange={setContent} />
          </Field>
        </div>

        <div>
          <ImageField label="কভার ছবি" value={cover} onChange={setCover} folder="posts" size={120} />
          <Field label="ক্যাটাগরি">
            <select className="input" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as PostCategory })}>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="স্ট্যাটাস">
            <select className="input" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ContentStatus })}>
              <option value="DRAFT">খসড়া</option>
              <option value="PUBLISHED">প্রকাশিত</option>
              <option value="ARCHIVED">আর্কাইভ</option>
            </select>
          </Field>
          <Field label="ট্যাগ" hint="কমা দিয়ে আলাদা করুন">
            <input className="input" value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </Field>
          <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isPinned}
              onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} />
            উপরে পিন করুন
          </label>

          <p className="mb-2 text-xs font-bold uppercase text-slate-400">SEO</p>
          <Field label="মেটা টাইটেল">
            <input className="input" value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
          </Field>
          <Field label="মেটা বিবরণ">
            <textarea className="input" rows={2} value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
