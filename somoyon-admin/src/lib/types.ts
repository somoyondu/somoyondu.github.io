export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PositionGroup = 'TOP_LEADER' | 'TOP_EXECUTIVE' | 'ORGANIZING' | 'OFFICIAL' | 'MEMBER';
export type PostCategory = 'NOTICE' | 'BLOG' | 'PRESS';
export type SubmissionStatus = 'NEW' | 'READ' | 'REPLIED' | 'SPAM';

export interface AuthUser {
  id: string;
  _id?: string;
  email: string;
  name: string;
  nameBn?: string;
  role: Role;
  mustChangePassword?: boolean;
}

export interface Media {
  _id: string;
  publicId: string;
  secureUrl: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  folder?: string;
  alt?: string;
  altBn?: string;
  caption?: string;
  captionBn?: string;
  tags?: string[];
  createdAt?: string;
}

export interface Person {
  _id: string;
  slug: string;
  name: string;
  nameEn?: string;
  photo?: Media | null;
  department?: string;
  session?: string;
  bio?: string;
  socials?: { facebook?: string; linkedin?: string; email?: string; phone?: string };
  isPublic?: boolean;
  positionCount?: number;
}

export interface Designation {
  _id: string;
  slug: string;
  nameBn: string;
  nameEn?: string;
  group: PositionGroup;
  rank: number;
  isActive: boolean;
}

export interface Committee {
  _id: string;
  year: number;
  title: string;
  expandButtonText?: string;
  collapseButtonText?: string;
  description?: string;
  isFounding?: boolean;
  status: ContentStatus;
  displayOrder?: number;
  positionCount?: number;
}

export interface Position {
  _id: string;
  committee: string;
  person: Person;
  designation: Designation;
  photoOverride?: Media | null;
  group: PositionGroup;
  displayOrder: number;
  isActive: boolean;
}

export interface Advisor {
  _id: string;
  name: string;
  nameEn?: string;
  designation: string;
  organization?: string;
  photo?: Media | null;
  displayOrder: number;
  isActive: boolean;
}

export interface GalleryAlbum {
  _id: string;
  slug: string;
  title: string;
  titleBn?: string;
  description?: string;
  coverImage?: Media | null;
  eventDate?: string;
  year?: number;
  status: ContentStatus;
  displayOrder: number;
  itemCount?: number;
}

export interface GalleryItem {
  _id: string;
  album: string;
  media: Media;
  title?: string;
  titleBn?: string;
  displayOrder: number;
  isFeatured: boolean;
}

export interface EventItem {
  _id: string;
  slug: string;
  title: string;
  titleBn?: string;
  excerpt?: string;
  content?: string;
  coverImage?: Media | null;
  gallery?: Media[];
  startAt: string;
  endAt?: string;
  venue?: string;
  venueBn?: string;
  registrationUrl?: string;
  status: ContentStatus;
  isFeatured?: boolean;
  tags?: string[];
}

export interface PostItem {
  _id: string;
  slug: string;
  title: string;
  titleBn?: string;
  excerpt?: string;
  content?: string;
  coverImage?: Media | null;
  category: PostCategory;
  status: ContentStatus;
  publishedAt?: string;
  tags?: string[];
  isPinned?: boolean;
  viewCount?: number;
  seo?: { metaTitle?: string; metaDescription?: string };
}

export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: SubmissionStatus;
  adminNote?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actor?: { name: string; email: string } | null;
  actorEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  summary?: string;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  tagline?: string;
  logo?: Media | null;
  whiteLogo?: Media | null;
  favicon?: Media | null;
  heroBackground?: Media | null;
  hero?: { headline?: string; subheadline?: string; body?: string; ctaText?: string };
  about?: { title?: string; body?: string };
  foundingBlurb?: { title?: string; body?: string };
  advisoryBlurb?: { title?: string; body?: string };
  galleryBlurb?: { title?: string; subtitle?: string };
  contact?: { email?: string; phone?: string; address?: string; facebookPage?: string };
  socials?: { platform: string; url: string; displayOrder: number; isActive: boolean }[];
  donation?: {
    isEnabled?: boolean;
    title?: string;
    description?: string;
    footerTitle?: string;
    footerCta?: string;
    methods?: { name: string; number: string; type?: string; displayOrder: number; isActive: boolean }[];
  };
  navLinks?: { id: string; title: string; href?: string; displayOrder: number; isActive: boolean }[];
  seo?: { defaultTitle?: string; defaultDescription?: string; siteUrl?: string; gaTrackingId?: string };
  maintenanceMode?: boolean;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DashboardStats {
  counts: Record<string, number>;
  membersByYear: { year: number; count: number }[];
  recentActivity: AuditLog[];
}
