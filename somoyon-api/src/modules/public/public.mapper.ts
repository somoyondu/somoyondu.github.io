import { Injectable } from '@nestjs/common';
import { CloudinaryPreset, CloudinaryService } from '../media/cloudinary.service';

/**
 * Shapes documents into the exact contract the public site renders. Card
 * components consume `{ name, designation, image }`, which is the same shape
 * the legacy hardcoded services returned — so the migration is drop-in.
 */
@Injectable()
export class PublicMapper {
  constructor(private readonly cloudinary: CloudinaryService) {}

  url(media: any, preset: CloudinaryPreset): string | null {
    if (!media) return null;
    if (typeof media === 'string') return media;
    if (!media.publicId) return media.secureUrl ?? null;
    return this.cloudinary.buildUrl(media.publicId, preset);
  }

  image(media: any, preset: CloudinaryPreset = 'avatar') {
    if (!media) return null;
    return {
      url: this.url(media, preset),
      url2x: this.url(media, preset === 'avatar' ? 'avatar_2x' : preset),
      placeholder: this.url(media, 'blur'),
      alt: media.altBn || media.alt || '',
      width: media.width ?? null,
      height: media.height ?? null,
    };
  }

  position(p: any) {
    const media = p.photoOverride ?? p.person?.photo ?? null;
    const img = this.image(media, 'avatar');
    return {
      id: String(p._id),
      name: p.person?.name ?? '',
      nameEn: p.person?.nameEn ?? null,
      slug: p.person?.slug ?? null,
      designation: p.designation?.nameBn ?? '',
      designationEn: p.designation?.nameEn ?? null,
      group: p.group,
      displayOrder: p.displayOrder ?? 0,
      // Legacy-compatible flat field used directly as <img src>.
      image: img?.url ?? null,
      imageSet: img,
      department: p.person?.department ?? null,
      session: p.person?.session ?? null,
      socials: p.person?.isPublic ? p.person?.socials ?? null : null,
    };
  }

  advisor(a: any) {
    const img = this.image(a.photo, 'avatar');
    return {
      id: String(a._id),
      name: a.name,
      nameEn: a.nameEn ?? null,
      designation: a.designation,
      designationEn: a.designationEn ?? null,
      organization: a.organization ?? null,
      image: img?.url ?? null,
      imageSet: img,
      displayOrder: a.displayOrder ?? 0,
    };
  }

  galleryItem(i: any) {
    const img = this.image(i.media, 'gallery_slide');
    const thumb = this.image(i.media, 'gallery_thumb');
    return {
      id: String(i._id),
      key: i.media?.publicId ?? String(i._id),
      title: i.titleBn || i.title || i.media?.captionBn || i.media?.caption || '',
      url: img?.url ?? null,
      thumbUrl: thumb?.url ?? null,
      placeholder: img?.placeholder ?? null,
      album: i.album ? { slug: i.album.slug, title: i.album.titleBn || i.album.title } : null,
    };
  }

  album(a: any) {
    return {
      id: String(a._id),
      slug: a.slug,
      title: a.titleBn || a.title,
      titleEn: a.title,
      description: a.description ?? null,
      year: a.year ?? null,
      eventDate: a.eventDate ?? null,
      coverUrl: this.url(a.coverImage, 'gallery_thumb'),
      itemCount: a.itemCount ?? (a.items?.length ?? 0),
      items: a.items ? a.items.map((i: any) => this.galleryItem(i)) : undefined,
    };
  }

  event(e: any, full = false) {
    return {
      id: String(e._id),
      slug: e.slug,
      title: e.titleBn || e.title,
      titleEn: e.title,
      excerpt: e.excerpt ?? null,
      coverUrl: this.url(e.coverImage, 'cover'),
      startAt: e.startAt,
      endAt: e.endAt ?? null,
      venue: e.venueBn || e.venue || null,
      registrationUrl: e.registrationUrl ?? null,
      tags: e.tags ?? [],
      isFeatured: e.isFeatured ?? false,
      ...(full
        ? {
            content: e.content ?? null,
            gallery: (e.gallery ?? []).map((m: any) => this.image(m, 'gallery_slide')),
          }
        : {}),
    };
  }

  post(p: any, full = false) {
    return {
      id: String(p._id),
      slug: p.slug,
      title: p.titleBn || p.title,
      titleEn: p.title,
      excerpt: p.excerpt ?? null,
      category: p.category,
      coverUrl: this.url(p.coverImage, 'cover'),
      publishedAt: p.publishedAt ?? p.createdAt,
      tags: p.tags ?? [],
      isPinned: p.isPinned ?? false,
      author: p.author ? { name: p.author.nameBn || p.author.name } : null,
      ...(full
        ? {
            content: p.content ?? null,
            seo: {
              metaTitle: p.seo?.metaTitle ?? p.title,
              metaDescription: p.seo?.metaDescription ?? p.excerpt,
            },
          }
        : {}),
    };
  }

  settings(s: any) {
    if (!s) return null;
    return {
      siteName: s.siteName,
      tagline: s.tagline ?? null,
      logoUrl: this.url(s.logo, 'logo'),
      whiteLogoUrl: this.url(s.whiteLogo, 'logo'),
      faviconUrl: this.url(s.favicon, 'logo'),
      heroBackgroundUrl: this.url(s.heroBackground, 'hero'),
      hero: s.hero ?? {},
      about: s.about ?? {},
      foundingBlurb: s.foundingBlurb ?? {},
      advisoryBlurb: s.advisoryBlurb ?? {},
      galleryBlurb: s.galleryBlurb ?? {},
      contact: s.contact ?? {},
      socials: (s.socials ?? []).filter((x: any) => x.isActive).sort((a: any, b: any) => a.displayOrder - b.displayOrder),
      donation: {
        ...(s.donation ?? {}),
        methods: (s.donation?.methods ?? [])
          .filter((m: any) => m.isActive !== false)
          .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
      },
      navLinks: (s.navLinks ?? []).filter((n: any) => n.isActive).sort((a: any, b: any) => a.displayOrder - b.displayOrder),
      seo: s.seo ?? {},
      maintenanceMode: s.maintenanceMode ?? false,
    };
  }
}
