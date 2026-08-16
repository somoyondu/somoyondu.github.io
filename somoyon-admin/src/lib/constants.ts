import type { ContentStatus, PositionGroup, PostCategory, Role, SubmissionStatus } from './types';

/** The admin UI is Bengali-first — these are the labels editors actually read. */
export const GROUP_LABELS: Record<PositionGroup, string> = {
  TOP_LEADER: 'শীর্ষ নেতৃবৃন্দ',
  TOP_EXECUTIVE: 'ঊর্ধ্বতন সদস্য',
  ORGANIZING: 'সাংগঠনিক সম্পাদক',
  OFFICIAL: 'দাপ্তরিক সদস্য',
  MEMBER: 'কার্যনির্বাহী সদস্য',
};

export const GROUP_ORDER: PositionGroup[] = [
  'TOP_LEADER', 'TOP_EXECUTIVE', 'ORGANIZING', 'OFFICIAL', 'MEMBER',
];

export const STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: 'খসড়া',
  PUBLISHED: 'প্রকাশিত',
  ARCHIVED: 'আর্কাইভ',
};

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'সুপার অ্যাডমিন',
  ADMIN: 'অ্যাডমিন',
  EDITOR: 'এডিটর',
};

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  NOTICE: 'নোটিশ',
  BLOG: 'ব্লগ',
  PRESS: 'প্রেস রিলিজ',
};

export const SUBMISSION_LABELS: Record<SubmissionStatus, string> = {
  NEW: 'নতুন',
  READ: 'পঠিত',
  REPLIED: 'উত্তর দেওয়া',
  SPAM: 'স্প্যাম',
};

export const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBn(n: number | string): string {
  return String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function formatBytes(bytes = 0): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}
