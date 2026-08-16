import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentStatus } from 'src/common/enums';
import { BaseCrudService } from 'src/common/services';
import { sanitizeRichText, toSlug } from 'src/common/utils';
import { Event, EventDocument } from 'src/database/schemas';
import { CreateEventDto, EventQueryDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService extends BaseCrudService<EventDocument> {
  constructor(@InjectModel(Event.name) model: Model<EventDocument>) {
    super(model, {
      searchFields: ['title', 'titleBn', 'excerpt', 'tags'],
      defaultSort: '-startAt',
      populate: ['coverImage', 'gallery'],
    });
  }

  private async uniqueSlug(base: string, ignoreId?: string) {
    let slug = base;
    let i = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const clash = await this.model.findOne({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) });
      if (!clash) return slug;
      slug = `${base}-${++i}`;
    }
  }

  private timeFilter(when?: string) {
    const now = new Date();
    if (when === 'upcoming') return { startAt: { $gte: now } };
    if (when === 'past') return { startAt: { $lt: now } };
    return {};
  }

  async createOne(dto: CreateEventDto, userId?: string) {
    const slug = await this.uniqueSlug(toSlug(dto.slug || dto.title, 'event'));
    return this.create(
      {
        ...dto,
        slug,
        content: sanitizeRichText(dto.content),
        publishedAt: dto.status === ContentStatus.PUBLISHED ? new Date() : undefined,
      } as any,
      userId,
    );
  }

  async updateOne(id: string, dto: UpdateEventDto, userId?: string) {
    const patch: any = { ...dto };
    if (dto.slug || dto.title) {
      patch.slug = await this.uniqueSlug(toSlug(dto.slug || dto.title, 'event'), id);
    }
    if (dto.content !== undefined) patch.content = sanitizeRichText(dto.content);
    if (dto.status === ContentStatus.PUBLISHED) {
      const current = await this.model.findById(id).lean();
      if (!(current as any)?.publishedAt) patch.publishedAt = new Date();
    }
    return this.update(id, patch, userId);
  }

  async listAdmin(dto: EventQueryDto) {
    const filter: any = { ...this.timeFilter(dto.when) };
    if (dto.status) filter.status = dto.status;
    return this.paginate(dto, filter);
  }

  async listPublic(dto: EventQueryDto) {
    return this.paginate(
      { ...dto, sort: dto.when === 'upcoming' ? 'startAt' : '-startAt' },
      { status: ContentStatus.PUBLISHED, ...this.timeFilter(dto.when) },
    );
  }

  async findBySlug(slug: string, includeDrafts = false) {
    const filter: any = { slug };
    if (!includeDrafts) filter.status = ContentStatus.PUBLISHED;
    const query = this.model.findOne(filter);
    this.applyPopulate(query);
    const doc = await query.lean();
    if (!doc) throw new NotFoundException('Event not found');
    return doc;
  }

  featured(limit = 3) {
    return this.model
      .find({ status: ContentStatus.PUBLISHED, isFeatured: true })
      .populate('coverImage')
      .sort('-startAt')
      .limit(limit)
      .lean();
  }

  async setStatus(id: string, status: ContentStatus, userId?: string) {
    const patch: any = { status };
    if (status === ContentStatus.PUBLISHED) patch.publishedAt = new Date();
    return this.update(id, patch, userId);
  }
}
