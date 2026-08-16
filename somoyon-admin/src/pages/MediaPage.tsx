import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { mediaApi } from '@/api/endpoints';
import {
  ConfirmDialog, EmptyState, ErrorState, Field, Modal, PageHeader, PageLoader, Pagination, Spinner,
} from '@/components/ui';
import { uploadMany } from '@/api/upload';
import { formatBytes, toBn } from '@/lib/constants';
import type { Media } from '@/lib/types';
import { formatDate, thumb } from '@/lib/utils';

export function MediaPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [selected, setSelected] = useState<Media | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [uploading, setUploading] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['media-page', page, search, folder],
    queryFn: () => mediaApi.list({ page, limit: 48, q: search || undefined, folder: folder || undefined }),
  });

  const { data: folders } = useQuery({ queryKey: ['media-folders'], queryFn: mediaApi.folders });

  const usageQ = useQuery({
    queryKey: ['media-usage', deleteTarget?._id],
    queryFn: () => mediaApi.usage(deleteTarget!._id),
    enabled: !!deleteTarget,
  });

  const remove = useMutation({
    mutationFn: (media: Media) => mediaApi.remove(media._id, false),
    onSuccess: () => {
      toast.success('ছবি মুছে ফেলা হয়েছে');
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ['media-page'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      try {
        await uploadMany(files, {
          folder: folder || 'misc',
          onFileDone: (done, total) => setUploading(`${done}/${total}`),
        });
        toast.success(`${files.length} টি ছবি আপলোড হয়েছে`);
        qc.invalidateQueries({ queryKey: ['media-page'] });
        qc.invalidateQueries({ queryKey: ['media-folders'] });
      } catch (err) {
        toast.error(apiError(err));
      } finally {
        setUploading('');
      }
    },
    [folder, qc],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="মিডিয়া লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="মিডিয়া লাইব্রেরি"
        description="সব ছবি Cloudinary-তে সংরক্ষিত এবং প্রয়োজনমতো রিসাইজ হয়ে ওয়েবসাইটে যায়।"
      />

      <div
        {...getRootProps()}
        className={`mb-5 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
          isDragActive ? 'border-brand bg-brand/5' : 'border-slate-300 bg-white'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 h-7 w-7 text-slate-400" />
        {uploading ? (
          <p className="flex items-center justify-center gap-2 text-sm">
            <Spinner className="h-4 w-4" /> আপলোড হচ্ছে {uploading}
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            ছবি টেনে এনে ছাড়ুন অথবা ক্লিক করুন · JPG, PNG, WebP · সর্বোচ্চ ৫MB
          </p>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="input max-w-xs"
          placeholder="ছবি খুঁজুন…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select className="input w-auto" value={folder} onChange={(e) => { setFolder(e.target.value); setPage(1); }}>
          <option value="">সব ফোল্ডার</option>
          {folders?.map((f) => (
            <option key={f.folder} value={f.folder}>{f.folder} ({toBn(f.count)})</option>
          ))}
        </select>
      </div>

      {!data?.data.length ? (
        <EmptyState title="কোনো ছবি নেই" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {data.data.map((media) => (
            <div key={media._id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <button type="button" className="h-full w-full" onClick={() => setSelected(media)}>
                <img src={thumb(media, 300) ?? ''} alt={media.alt ?? ''} loading="lazy"
                  className="h-full w-full object-cover" />
              </button>
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1.5 opacity-0 transition group-hover:opacity-100"
                onClick={() => setDeleteTarget(media)}
              >
                <Trash2 className="h-3.5 w-3.5 text-brand-accent" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Pagination meta={data?.meta} onPage={setPage} />

      <MediaDetailModal media={selected} onClose={() => setSelected(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="ছবিটি মুছে ফেলবেন?"
        message={
          usageQ.data?.total
            ? `সতর্কতা: এই ছবিটি ${toBn(usageQ.data.total)} জায়গায় ব্যবহৃত হচ্ছে। আগে সেখান থেকে সরান, নয়তো ছবিগুলো ভেঙে যাবে।`
            : 'Cloudinary থেকেও স্থায়ীভাবে মুছে যাবে। এটি ফেরানো যাবে না।'
        }
        loading={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget)}
      />
    </>
  );
}

function MediaDetailModal({ media, onClose }: { media: Media | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [alt, setAlt] = useState('');
  const [ready, setReady] = useState(false);

  if (media && !ready) { setAlt(media.altBn ?? media.alt ?? ''); setReady(true); }
  const close = () => { setReady(false); onClose(); };

  const save = useMutation({
    mutationFn: () => mediaApi.update(media!._id, { altBn: alt, alt }),
    onSuccess: () => {
      toast.success('সংরক্ষিত হয়েছে');
      qc.invalidateQueries({ queryKey: ['media-page'] });
      close();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (!media) return null;

  return (
    <Modal
      open={!!media}
      onClose={close}
      title="ছবির বিবরণ"
      wide
      footer={
        <>
          <button className="btn-secondary" type="button" onClick={close}>বন্ধ</button>
          <button className="btn-primary" type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner className="h-4 w-4 text-white" />} সংরক্ষণ
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <img src={media.secureUrl} alt="" className="w-full rounded-lg border border-slate-200" />
        <div>
          <Field label="বিকল্প টেক্সট (alt)" hint="স্ক্রিন রিডার ও SEO-এর জন্য">
            <input className="input" value={alt} onChange={(e) => setAlt(e.target.value)} />
          </Field>
          <dl className="space-y-1 text-sm text-slate-600">
            <div><dt className="inline font-semibold">আকার: </dt><dd className="inline">{media.width}×{media.height}</dd></div>
            <div><dt className="inline font-semibold">ফাইল সাইজ: </dt><dd className="inline">{formatBytes(media.bytes)}</dd></div>
            <div><dt className="inline font-semibold">ফরম্যাট: </dt><dd className="inline">{media.format}</dd></div>
            <div><dt className="inline font-semibold">ফোল্ডার: </dt><dd className="inline">{media.folder ?? '—'}</dd></div>
            <div><dt className="inline font-semibold">আপলোড: </dt><dd className="inline">{formatDate(media.createdAt)}</dd></div>
          </dl>
        </div>
      </div>
    </Modal>
  );
}
