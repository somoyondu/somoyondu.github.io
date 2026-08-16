import * as path from 'path';

/** Root of the existing public site repo (holds src/services and public/). */
export const LEGACY_ROOT =
  process.env.LEGACY_ROOT || path.resolve(__dirname, '../../../');

export const LEGACY_SERVICES = path.join(LEGACY_ROOT, 'src', 'services');
export const LEGACY_PUBLIC = path.join(LEGACY_ROOT, 'public');

export const SEED_DIR = path.resolve(__dirname, '../../seed');
export const DATA_DIR = path.join(SEED_DIR, 'data');
export const MEDIA_MAP = path.join(SEED_DIR, 'media-map.json');
export const CHECKPOINT = path.join(SEED_DIR, 'checkpoint.json');
export const REVIEW_CSV = path.join(SEED_DIR, 'review-merges.csv');

export const YEARS = [2023, 2024, 2025, 2026];

/** Legacy service file → PositionGroup. */
export const SERVICE_GROUPS: Record<string, string> = {
  TopLeadersService: 'TOP_LEADER',
  TopExecutivesService: 'TOP_EXECUTIVE',
  OrganizingExecutivesService: 'ORGANIZING',
  OfficialsService: 'OFFICIAL',
  ExecutiveMembersService: 'MEMBER',
};

/**
 * Designation rank inside each group. Anything unlisted falls back to 100,
 * which keeps the legacy array order via displayOrder.
 */
export const DESIGNATION_RANKS: Record<string, number> = {
  'প্রতিষ্ঠাতা আহ্বায়ক': 1,
  'প্রতিষ্ঠাতা সদস্য সচিব': 2,
  'প্রতিষ্ঠাতা সভাপতি': 3,
  'সভাপতি': 5,
  'সিনিয়র সহ সভাপতি': 6,
  'সিনিয়র সহ-সভাপতি': 6,
  'সাধারণ সম্পাদক': 7,
  'সিনিয়র যুগ্ম-সাধারণ সম্পাদক': 8,
  'সহ-সভাপতি': 10,
  'যুগ্ম-সাধারণ সম্পাদক': 12,
  'সাংগঠনিক সম্পাদক': 20,
  'কোষাধ্যক্ষ': 30,
  'উপ-কোষাধ্যক্ষ': 31,
  'দপ্তর সম্পাদক': 32,
  'উপ-দপ্তর সম্পাদক': 33,
  'প্রচার সম্পাদক': 34,
  'উপ-প্রচার সম্পাদক': 35,
  'ক্রীড়া সম্পাদক': 36,
  'উপ-ক্রীড়া সম্পাদক': 37,
  'আইটি সম্পাদক': 38,
  'উপ-আইটি সম্পাদক': 39,
  'সাংস্কৃতিক সম্পাদক': 40,
  'উপ-সাংস্কৃতিক সম্পাদক': 41,
  'কার্যনির্বাহী সদস্য': 90,
};

/** Legacy public/ subfolder → Cloudinary folder. */
export function mapCloudinaryFolder(legacyPath: string): string {
  const p = legacyPath.replace(/\\/g, '/');
  if (p.startsWith('gallery/')) return 'gallery/legacy';
  if (p.startsWith('advisors/')) return 'advisors';
  if (p.startsWith('committee-members/2026/')) return 'committee/2026';
  if (p.startsWith('committee-members/')) return 'people';
  if (p.startsWith('committee-2026/')) return 'committee/2026/official-photos';
  if (p.startsWith('members/')) {
    const year = p.split('/')[1];
    return /^\d{4}$/.test(year) ? `committee/${year}` : 'people';
  }
  if (p.startsWith('committee-list/')) return 'site/committee-list';
  return 'site';
}
