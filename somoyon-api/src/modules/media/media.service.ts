import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { buildMeta } from 'src/common/dto';
import { BaseCrudService } from 'src/common/services';
import {
  Advisor, Committee, Event, GalleryItem, Media, MediaDocument, Person, Post, SiteSettings,
} from 'src/database/schemas';
import { CloudinaryService } from './cloudinary.service';
import { MediaQueryDto, RegisterMediaDto, SignUploadDto, UpdateMediaDto } from './dto/media.dto';

@Injectable()
export class MediaService extends BaseCrudService<MediaDocument> {
  constructor(
    @InjectModel(Media.name) model: Model<MediaDocument>,
    @InjectModel(Person.name) private readonly people: Model<Person>,
    @InjectModel(Advisor.name) private readonly advisors: Model<Advisor>,
    @InjectModel(GalleryItem.name) private readonly galleryItems: Model<GalleryItem>,
    @InjectModel(Event.name) private readonly events: Model<Event>,
    @InjectModel(Post.name) private readonly posts: Model<Post>,
    @InjectModel(Committee.name) private readonly committees: Model<Committee>,
    @InjectModel(SiteSettings.name) private readonly settings: Model<SiteSettings>,
    private readonly cloudinary: CloudinaryService,
  ) {
    super(model, { searchFields: ['publicId', 'alt', 'altBn', 'caption'], defaultSort: '-createdAt' });
  }

  sign(dto: SignUploadDto) {
    return this.cloudinary.signUpload(dto);
  }

  async register(dto: RegisterMediaDto, userId?: string) {
    const existing = await this.model.findOne({ publicId: dto.publicId }).lean();
    if (existing) return existing;

    const resource = await this.cloudinary.verifyResource(dto.publicId);

    return this.create(
      {
        publicId: resource.public_id,
        secureUrl: resource.secure_url,
        url: resource.url,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes,
        resourceType: resource.resource_type,
        folder: resource.folder ?? resource.asset_folder,
        alt: dto.alt,
        altBn: dto.altBn,
        caption: dto.caption,
        captionBn: dto.captionBn,
        tags: dto.tags ?? resource.tags ?? [],
      } as any,
      userId,
    );
  }

  async list(dto: MediaQueryDto) {
    const filter: any = {};
    if (dto.folder) filter.folder = new RegExp(`^${dto.folder}`);
    if (dto.tag) filter.tags = dto.tag;
    return this.paginate(dto, filter);
  }

  async updateMeta(id: string, dto: UpdateMediaDto, userId?: string) {
    const patch: any = { ...dto };
    delete patch.publicId; // immutable
    return this.update(id, patch, userId);
  }

  /** Counts every document that still points at this media record. */
  async usage(id: string) {
    const [people, advisors, galleryItems, events, posts, committees, settings] = await Promise.all([
      this.people.countDocuments({ photo: id }),
      this.advisors.countDocuments({ photo: id }),
      this.galleryItems.countDocuments({ media: id }),
      this.events.countDocuments({ $or: [{ coverImage: id }, { gallery: id }] }),
      this.posts.countDocuments({ $or: [{ coverImage: id }, { 'seo.ogImage': id }] }),
      this.committees.countDocuments({ coverImage: id }),
      this.settings.countDocuments({
        $or: [{ logo: id }, { whiteLogo: id }, { favicon: id }, { heroBackground: id }],
      }),
    ]);
    const total = people + advisors + galleryItems + events + posts + committees + settings;
    return { total, breakdown: { people, advisors, galleryItems, events, posts, committees, settings } };
  }

  /** Refuses to delete media that is still referenced, unless forced. */
  async removeWithCloud(id: string, force = false) {
    const media = await this.findById(id);
    const usage = await this.usage(id);
    if (usage.total > 0 && !force) {
      throw new BadRequestException(
        `This image is used in ${usage.total} place(s). Replace it there first, or pass force=true.`,
      );
    }
    await this.cloudinary.destroy((media as any).publicId);
    await this.model.findByIdAndDelete(id);
    return { id, deleted: true as const, usage };
  }

  /** Nightly reconcile: Cloudinary assets with no matching Media document. */
  async findOrphans() {
    const cloudIds = await this.cloudinary.listAllPublicIds();
    const dbIds = new Set((await this.model.find().select('publicId').lean()).map((m: any) => m.publicId));
    const orphanedInCloud = cloudIds.filter((id) => !dbIds.has(id));
    const missingInCloud = [...dbIds].filter((id) => !cloudIds.includes(id as string));
    return { orphanedInCloud, missingInCloud };
  }

  async folders() {
    const rows = await this.model.aggregate([
      { $group: { _id: '$folder', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((r) => ({ folder: r._id, count: r.count }));
  }

  async stats() {
    const [count, agg] = await Promise.all([
      this.model.countDocuments(),
      this.model.aggregate([{ $group: { _id: null, bytes: { $sum: '$bytes' } } }]),
    ]);
    return { count, totalBytes: agg[0]?.bytes ?? 0 };
  }

  emptyMeta() {
    return buildMeta(1, 20, 0);
  }
}
