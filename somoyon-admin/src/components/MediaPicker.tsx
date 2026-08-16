import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { mediaApi } from '@/api/endpoints';
import { uploadMany } from '@/api/upload';
import { apiError } from '@/api/client';
import type { Media } from '@/lib/types';
import { thumb } from '@/lib/utils';
import { Modal, Spinner } from './ui';

interface PickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: Media | Media[]) => void;
  multiple?: boolean;
  folder?: string;
}

/** Media library browser + uploader, reused by every screen that needs an image. */
export function MediaPickerModal({ open, onClose, onSelect, multiple, folder }: PickerProps) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState(folder ?? '');
  const [selected, setSelected] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['media', search, folderFilter],
    queryFn: () => mediaApi.list({ q: search || undefined, folder: folderFilter || undefined, limit: 60 }),
    enabled: open,
  });

  const { data: folders } = useQuery({
    queryKey: ['media-folders'],
    queryFn: mediaApi.folders,
    enabled: open,
  });

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setUploading(true);
      try {
        await uploadMany(files, {
          folder: folder ?? folderFilter ?? 'misc',
          onFileDone: (done, total) => setProgress(`${done}/${total}`),
        });
        toast.success(`${files.length} টি ছবি আপলোড হয়েছে`);
        qc.invalidateQueries({ queryKey: ['media'] });
      } catch (err) {
        toast.error(apiError(err));
      } finally {
        setUploading(false);
        setProgress('');
      }
    },
    [folder, folderFilter, qc],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
  });

  const toggle = (media: Media) => {
    if (multiple) {
      setSelected((prev) =>
        prev.find((m) => m._id === media._id)
          ? prev.filter((m) => m._id !== media._id)
          : [...prev, media],
      );
    } else {
      onSelect(media);
      onClose();
    }
  };

  const confirm = () => {
    if (!selected.length) return;
    onSelect(selected);
    setSelected([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="মিডিয়া লাইব্রেরি"
      wide
      footer={
        multiple ? (
          <>
            <button className="btn-secondary" onClick={onClose} type="button">বাতিল</button>
            <button className="btn-primary" onClick={confirm} type="button" disabled={!selected.length}>
              {selected.length} টি যোগ করুন
            </button>
          </>
        ) : undefined
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="input flex-1"
          placeholder="ছবি খুঁজুন…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input w-auto"
          value={folderFilter}
          onChange={(e) => setFolderFilter(e.target.value)}
        >
          <option value="">সব ফোল্ডার</option>
          {folders?.map((f) => (
            <option key={f.folder} value={f.folder}>
              {f.folder} ({f.count})
            </option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`mb-4 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
          isDragActive ? 'border-brand bg-brand/5' : 'border-slate-300'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 h-6 w-6 text-slate-400" />
        {uploading ? (
          <p className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Spinner className="h-4 w-4" /> আপলোড হচ্ছে {progress}
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            ছবি টেনে এনে ছাড়ুন, অথবা ক্লিক করে বেছে নিন (সর্বোচ্চ ৫MB)
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="py-10 text-center"><Spinner className="mx-auto" /></div>
      ) : (
        <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-5">
          {data?.data.map((media) => {
            const isSelected = selected.some((m) => m._id === media._id);
            return (
              <button
                key={media._id}
                type="button"
                onClick={() => toggle(media)}
                className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                  isSelected ? 'border-brand ring-2 ring-brand/30' : 'border-transparent hover:border-slate-300'
                }`}
              >
                <img
                  src={thumb(media, 200) ?? ''}
                  alt={media.alt ?? media.publicId}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {isSelected && (
                  <span className="absolute right-1 top-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
          {!data?.data.length && (
            <p className="col-span-full py-8 text-center text-sm text-slate-500">
              কোনো ছবি পাওয়া যায়নি
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

/** Single-image form control with preview, picker and clear. */
export function ImageField({
  value, onChange, label = 'ছবি', folder, size = 96,
}: {
  value?: Media | null;
  onChange: (media: Media | null) => void;
  label?: string;
  folder?: string;
  size?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4">
      <span className="label">{label}</span>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
          style={{ width: size, height: size }}
        >
          {value ? (
            <img src={thumb(value, size * 2) ?? ''} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-slate-300" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button className="btn-secondary" type="button" onClick={() => setOpen(true)}>
            {value ? 'পরিবর্তন করুন' : 'ছবি নির্বাচন করুন'}
          </button>
          {value && (
            <button className="btn-ghost text-brand-accent" type="button" onClick={() => onChange(null)}>
              <Trash2 className="h-4 w-4" /> সরান
            </button>
          )}
        </div>
      </div>
      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        folder={folder}
        onSelect={(m) => onChange(Array.isArray(m) ? m[0] : m)}
      />
    </div>
  );
}
