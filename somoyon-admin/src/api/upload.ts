import axios from 'axios';
import { mediaApi } from './endpoints';
import type { Media } from '@/lib/types';

/**
 * Signed direct-to-Cloudinary upload. The file never passes through our API —
 * we only ask for a one-shot signature, then register the result.
 */
export async function uploadFile(
  file: File,
  options: { folder?: string; tags?: string[]; onProgress?: (percent: number) => void } = {},
): Promise<Media> {
  const sig = await mediaApi.signature({ folder: options.folder, tags: options.tags });

  if (file.size > sig.maxBytes) {
    throw new Error(`ফাইলটি ${(sig.maxBytes / 1024 / 1024).toFixed(0)}MB এর বেশি`);
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!sig.allowedFormats.includes(ext)) {
    throw new Error(`শুধু ${sig.allowedFormats.join(', ')} ফরম্যাট গ্রহণযোগ্য`);
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);
  if (options.tags?.length) form.append('tags', options.tags.join(','));

  const { data } = await axios.post(sig.uploadUrl, form, {
    onUploadProgress: (e) => {
      if (e.total) options.onProgress?.(Math.round((e.loaded / e.total) * 100));
    },
  });

  // The API re-verifies the public_id against Cloudinary before storing it.
  return mediaApi.register({ publicId: data.public_id, tags: options.tags });
}

export async function uploadMany(
  files: File[],
  options: { folder?: string; tags?: string[]; onFileDone?: (done: number, total: number) => void } = {},
): Promise<Media[]> {
  const results: Media[] = [];
  for (let i = 0; i < files.length; i++) {
    results.push(await uploadFile(files[i], { folder: options.folder, tags: options.tags }));
    options.onFileDone?.(i + 1, files.length);
  }
  return results;
}
