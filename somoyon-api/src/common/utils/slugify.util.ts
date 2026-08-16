import slugify from 'slugify';

/**
 * Bengali names do not transliterate well with the default slugify options, so
 * we fall back to a deterministic hash-suffixed slug when the result is empty.
 */
export function toSlug(input: string, fallbackPrefix = 'item'): string {
  const base = slugify(input || '', { lower: true, strict: true, locale: 'bn' });
  if (base) return base;
  let hash = 0;
  for (let i = 0; i < (input || '').length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `${fallbackPrefix}-${Math.abs(hash).toString(36)}`;
}

/** Normalises Bengali person names for duplicate detection. */
export function normalizeBnName(name: string): string {
  return (name || '')
    .replace(/​|‌|‍|﻿/g, '')
    .replace(/^(মোঃ|মো\.|মোহাম্মদ|মুহাম্মদ)\s*/u, '')
    .replace(/[.,\s'"`-]/g, '')
    .trim()
    .toLowerCase();
}

/** Sanitises legacy file paths into cloudinary-safe public ids. */
export function toPublicId(filePath: string): string {
  return filePath
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9/_-]/g, '-')
    .toLowerCase();
}
