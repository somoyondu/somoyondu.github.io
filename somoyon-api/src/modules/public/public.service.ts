import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentStatus, PositionGroup } from 'src/common/enums';
import { Committee, CommitteeDocument } from 'src/database/schemas';
import { AdvisorsService } from '../advisors/advisors.service';
import { CommitteesService, GROUP_ORDER } from '../committees/committees.service';
import { EventQueryDto } from '../events/dto/event.dto';
import { EventsService } from '../events/events.service';
import { GalleryService } from '../gallery/gallery.service';
import { PostQueryDto } from '../posts/dto/post.dto';
import { PostsService } from '../posts/posts.service';
import { SettingsService } from '../settings/settings.service';
import { PublicMapper } from './public.mapper';

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(Committee.name) private readonly committeeModel: Model<CommitteeDocument>,
    private readonly committees: CommitteesService,
    private readonly advisors: AdvisorsService,
    private readonly gallery: GalleryService,
    private readonly events: EventsService,
    private readonly posts: PostsService,
    private readonly settings: SettingsService,
    private readonly map: PublicMapper,
  ) {}

  /** One call the SPA makes on boot: everything chrome-level. */
  async bootstrap() {
    const [settings, committees] = await Promise.all([
      this.settings.get(),
      this.listCommittees(),
    ]);
    return {
      settings: this.map.settings(settings),
      committeeYears: committees.map((c) => c.year),
      generatedAt: new Date().toISOString(),
    };
  }

  async listCommittees() {
    const rows = await this.committeeModel
      .find({ status: ContentStatus.PUBLISHED })
      .sort('-year')
      .lean();
    return rows.map((c: any) => ({
      id: String(c._id),
      year: c.year,
      title: c.title,
      expandButtonText: c.expandButtonText,
      collapseButtonText: c.collapseButtonText,
      description: c.description ?? null,
      isFounding: c.isFounding ?? false,
    }));
  }

  async committeeByYear(year: number) {
    const committee: any = await this.committees.findByYear(year, false);
    const grouped = await this.committees.positionsGrouped(String(committee._id));

    const groups: Record<string, any[]> = {};
    for (const g of GROUP_ORDER) {
      groups[g] = (grouped[g] ?? []).map((p: any) => this.map.position(p));
    }

    return {
      id: String(committee._id),
      year: committee.year,
      title: committee.title,
      expandButtonText: committee.expandButtonText,
      collapseButtonText: committee.collapseButtonText,
      description: committee.description ?? null,
      isFounding: committee.isFounding ?? false,
      groups,
      totalMembers: Object.values(groups).reduce((n, arr) => n + arr.length, 0),
    };
  }

  /** The founding committee renders in its own landing-page section. */
  async foundingMembers() {
    const founding = await this.committeeModel
      .findOne({ isFounding: true, status: ContentStatus.PUBLISHED })
      .sort('year')
      .lean();
    if (!founding) return [];
    const grouped = await this.committees.positionsGrouped(String((founding as any)._id));
    return GROUP_ORDER.flatMap((g) => grouped[g] ?? []).map((p: any) => this.map.position(p));
  }

  async advisorList() {
    const rows = await this.advisors.listPublic();
    return rows.map((a: any) => this.map.advisor(a));
  }

  async galleryFeed(limit = 30) {
    const items = await this.gallery.featuredFeed(limit);
    if (items.length) return items.map((i: any) => this.map.galleryItem(i));

    // Fall back to the newest album's photos so the slider is never empty.
    const albums = await this.gallery.findAll({ status: ContentStatus.PUBLISHED }, 'displayOrder -year');
    if (!albums.length) return [];
    const first = await this.gallery.listItems(String((albums[0] as any)._id));
    return first.slice(0, limit).map((i: any) => this.map.galleryItem(i));
  }

  async galleryAlbums() {
    const albums = await this.gallery.albumsWithCounts();
    return albums
      .filter((a: any) => a.status === ContentStatus.PUBLISHED)
      .map((a: any) => this.map.album(a));
  }

  async galleryAlbum(slug: string) {
    const album = await this.gallery.findAlbumBySlug(slug, false);
    return this.map.album(album);
  }

  async eventList(dto: EventQueryDto) {
    const { items, meta } = await this.events.listPublic(dto);
    return { items: items.map((e: any) => this.map.event(e)), meta };
  }

  async eventBySlug(slug: string) {
    const e = await this.events.findBySlug(slug, false);
    return this.map.event(e, true);
  }

  async postList(dto: PostQueryDto) {
    const { items, meta } = await this.posts.listPublic(dto);
    return { items: items.map((p: any) => this.map.post(p)), meta };
  }

  async postBySlug(slug: string) {
    const p = await this.posts.findBySlug(slug, false);
    return this.map.post(p, true);
  }

  /**
   * Full content snapshot. The frontend build fetches this into
   * public/fallback.json so the site still renders if the API is cold.
   */
  async snapshot() {
    const committeeList = await this.listCommittees();
    const committees = await Promise.all(
      committeeList.map((c) => this.committeeByYear(c.year).catch(() => null)),
    );
    const [settings, advisors, gallery, albums, founding, events, posts] = await Promise.all([
      this.settings.get(),
      this.advisorList(),
      this.galleryFeed(30),
      this.galleryAlbums(),
      this.foundingMembers(),
      this.eventList({ page: 1, limit: 12, when: 'all' } as EventQueryDto),
      this.postList({ page: 1, limit: 12 } as PostQueryDto),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      settings: this.map.settings(settings),
      committeeList,
      committees: committees.filter(Boolean),
      foundingMembers: founding,
      advisors,
      gallery,
      albums,
      events: events.items,
      posts: posts.items,
    };
  }

  /** Slug list for the frontend's sitemap generator. */
  async sitemap() {
    const [committees, albums, events, posts] = await Promise.all([
      this.listCommittees(),
      this.galleryAlbums(),
      this.eventList({ page: 1, limit: 100, when: 'all' } as EventQueryDto),
      this.postList({ page: 1, limit: 200 } as PostQueryDto),
    ]);
    return {
      committees: committees.map((c) => `/committee/${c.year}`),
      albums: albums.map((a: any) => `/gallery/${a.slug}`),
      events: events.items.map((e: any) => `/events/${e.slug}`),
      posts: posts.items.map((p: any) => `/notices/${p.slug}`),
    };
  }

  groupOrder() {
    return GROUP_ORDER as PositionGroup[];
  }
}
