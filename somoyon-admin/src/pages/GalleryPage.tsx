import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { apiError } from '@/api/client';
import { galleryApi } from '@/api/endpoints';
import { ImageField, MediaPickerModal } from '@/components/MediaPicker';
import { SortableList } from '@/components/SortableList';
import {
  ConfirmDialog, EmptyState, ErrorState, Field, Modal, PageHeader, PageLoader, Spinner, StatusBadge,
} from '@/components/ui';
import { toBn } from '@/lib/constants';
import type { ContentStatus, GalleryAlbum, GalleryItem, Media } from '@/lib/types';
import { thumb, toReorderPayload } from '@/lib/utils';

export function GalleryPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<GalleryAlbum | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['albums'],
    queryFn: galleryApi.albums,
  });

  const remove = useMutation({
    mutationFn: (id: string) => galleryApi.removeAlbum(id),
    onSuccess: () => {
      toast.success('অ্যালবাম মুছে ফেলা হয়েছে');
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ['albums'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState message="গ্যালারি লোড করা যায়নি" onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="গ্যালারি"
        description="ইভেন্ট অনুযায়ী অ্যালবাম তৈরি করুন। ‘ফিচার্ড’ ছবিগুলো হোমপেজের স্লাইডারে দেখায়।"
        actions={
          <button className="btn-primary" type="button" onClick={() => setEditing('new')}>
            <Plus className="h-4 w-4" /> নতুন অ্যালবাম
          </button>
        }
      />

      {!data?.length ? (
        <EmptyState title="কোনো অ্যালবাম নেই" description="প্রথম অ্যালবাম তৈরি করে ছবি যোগ করুন।" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((album) => (
            <div key={album._id} className="card overflow-hidden">
              <Link to={`/gallery/${album._id}`}>
                <div className="aspect-video bg-slate-100">
                  {album.coverImage ? (
                    <img
                      src={thumb(album.coverImage, 400) ?? ''}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <ImagePlus className="h-8 w-8" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Link to={`/gallery/${album._id}`} className="font-semibold text-slate-800 hover:text-brand">
                    {album.titleBn || album.title}
                  </Link>
                  <StatusBadge status={album.status} />
                </div>
                <p className="mb-3 text-xs text-slate-500">
                  {toBn(album.itemCount ?? 0)} টি ছবি{album.year ? ` · ${toBn(album.year)}` : ''}
                </p>
                <div className="flex gap-1">
                  <Link to={`/gallery/${album._id}`} className="btn-secondary flex-1 text-xs">
                    ছবি ব্যবস্থাপনা
                  </Link>
                  <button className="btn-ghost p-1" type="button" onClick={() => setEditing(album)}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="btn-ghost p-1 text-brand-accent"
                    type="button"
                    onClick={() => setDeleteId(album._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlbumModal
        album={editing}
        onClose={() => setEditing(null)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['albums'] })}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="অ্যালবাম মুছে ফেলবেন?"
        message="অ্যালবামের সব ছবি সংযুক্তি মুছে যাবে। মূল ছবিগুলো মিডিয়া লাইব্রেরিতে থেকে যাবে।"
        loading={remove.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </>
  );
}

function AlbumModal({
  album, onClose, onSaved,
}: { album: GalleryAlbum | 'new' | null; onClose: () => void; onSaved: () => void }) {
  const isNew = album === 'new';
  const current = isNew ? null : album;
  const [form, setForm] = useState({
    title: '', titleBn: '', description: '', year: new Date().getFullYear(),
    status: 'PUBLISHED' as ContentStatus,
  });
  const [cover, setCover] = useState<Media | null>(null);
  const [ready, setReady] = useState(false);

  if (album && !ready) {
    setForm({
      title: current?.title ?? '',
      titleBn: current?.titleBn ?? '',
      description: current?.description ?? '',
      year: current?.year ?? new Date().getFullYear(),
      status: current?.status ?? 'PUBLISHED',
    });
    setCover(current?.coverImage ?? null);
    setReady(true);
  }

  const close = () => { setReady(false); onClose(); };

  const save = useMutation({
    mutationFn: () => {
      const body = { ...form, coverImage: cover?._id };
      return isNew ? galleryApi.createAlbum(body) : galleryApi.updateAlbum(current!._id, body);
    },
    onSuccess: () => { toast.success('সংরক্ষিত হয়েছে'); onSaved(); close(); },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <Modal
      open={!!album}
      onClose={close}
      title={isNew ? 'নতুন অ্যালবাম' : 'অ্যালবাম সম্পাদনা'}
      footer={
        <>
          <button className="btn-secondary" type="button" onClick={close}>বাতিল</button>
          <button className="btn-primary" type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Spinner className="h-4 w-4 text-white" />} সংরক্ষণ
          </button>
        </>
      }
    >
      <ImageField label="কভার ছবি" value={cover} onChange={setCover} folder="gallery" size={120} />
      <Field label="শিরোনাম (বাংলা)" required>
        <input className="input" value={form.titleBn}
          onChange={(e) => setForm({ ...form, titleBn: e.target.value })} />
      </Field>
      <Field label="শিরোনাম (ইংরেজি)" required hint="URL তৈরিতে ব্যবহৃত হয়">
        <input className="input" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </Field>
      <Field label="বিবরণ">
        <textarea className="input" rows={3} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="বছর">
          <input type="number" className="input" value={form.year}
            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
        </Field>
        <Field label="স্ট্যাটাস">
          <select className="input" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ContentStatus })}>
            <option value="PUBLISHED">প্রকাশিত</option>
            <option value="DRAFT">খসড়া</option>
            <option value="ARCHIVED">আর্কাইভ</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

export function AlbumDetailPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<GalleryItem[] | null>(null);

  const albumQ = useQuery({ queryKey: ['album', id], queryFn: () => galleryApi.album(id) });
  const itemsQ = useQuery({ queryKey: ['album-items', id], queryFn: () => galleryApi.items(id) });

  const items = localOrder ?? itemsQ.data ?? [];

  const addItems = useMutation({
    mutationFn: (mediaIds: string[]) => galleryApi.bulkAddItems(id, mediaIds, true),
    onSuccess: (res) => {
      toast.success(`${toBn(res.added)} টি ছবি যোগ হয়েছে`);
      setLocalOrder(null);
      qc.invalidateQueries({ queryKey: ['album-items', id] });
      qc.invalidateQueries({ queryKey: ['albums'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const reorder = useMutation({
    mutationFn: (next: GalleryItem[]) => galleryApi.reorderItems(toReorderPayload(next).items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['album-items', id] }),
    onError: (err) => { toast.error(apiError(err)); setLocalOrder(null); },
  });

  const toggleFeatured = useMutation({
    mutationFn: (item: GalleryItem) => galleryApi.updateItem(item._id, { isFeatured: !item.isFeatured }),
    onSuccess: () => { setLocalOrder(null); qc.invalidateQueries({ queryKey: ['album-items', id] }); },
    onError: (err) => toast.error(apiError(err)),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => galleryApi.removeItem(itemId),
    onSuccess: () => {
      toast.success('ছবি সরানো হয়েছে');
      setDeleteId(null);
      setLocalOrder(null);
      qc.invalidateQueries({ queryKey: ['album-items', id] });
    },
    onError: (err) => toast.error(apiError(err)),
  });

  if (albumQ.isLoading || itemsQ.isLoading) return <PageLoader />;
  if (albumQ.error) return <ErrorState message="অ্যালবাম লোড করা যায়নি" onRetry={albumQ.refetch} />;

  return (
    <>
      <Link to="/gallery" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> সব অ্যালবাম
      </Link>

      <PageHeader
        title={albumQ.data?.titleBn || albumQ.data?.title || 'অ্যালবাম'}
        description={`${toBn(items.length)} টি ছবি · টেনে এনে ক্রম বদলান`}
        actions={
          <button className="btn-primary" type="button" onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4" /> ছবি যোগ করুন
          </button>
        }
      />

      {!items.length ? (
        <EmptyState
          title="এই অ্যালবামে কোনো ছবি নেই"
          action={
            <button className="btn-primary" type="button" onClick={() => setPickerOpen(true)}>
              ছবি যোগ করুন
            </button>
          }
        />
      ) : (
        <SortableList
          items={items}
          onReorder={(next) => { setLocalOrder(next); reorder.mutate(next); }}
          renderItem={(item) => (
            <div className="flex items-center gap-3">
              <img
                src={thumb(item.media, 96) ?? ''}
                alt=""
                className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700">
                  {item.titleBn || item.title || item.media?.publicId}
                </p>
                {item.isFeatured && <span className="badge-published mt-1">হোমপেজে দেখাবে</span>}
              </div>
              <button
                type="button"
                className={`btn-ghost p-1 ${item.isFeatured ? 'text-amber-500' : 'text-slate-400'}`}
                title="হোমপেজ স্লাইডারে দেখান"
                onClick={() => toggleFeatured.mutate(item)}
              >
                <Star className="h-4 w-4" fill={item.isFeatured ? 'currentColor' : 'none'} />
              </button>
              <button
                className="btn-ghost p-1 text-brand-accent"
                type="button"
                onClick={() => setDeleteId(item._id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      )}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        multiple
        folder={`gallery/${albumQ.data?.slug ?? 'misc'}`}
        onSelect={(media) => {
          const list = Array.isArray(media) ? media : [media];
          addItems.mutate(list.map((m) => m._id));
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="ছবিটি সরাবেন?"
        message="অ্যালবাম থেকে সরানো হবে। মূল ছবি মিডিয়া লাইব্রেরিতে থাকবে।"
        confirmLabel="হ্যাঁ, সরান"
        loading={removeItem.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && removeItem.mutate(deleteId)}
      />
    </>
  );
}
