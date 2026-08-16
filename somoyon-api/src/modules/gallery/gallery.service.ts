import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContentStatus } from 'src/common/enums';
import { BaseCrudService } from 'src/common/services';
import { toSlug } from 'src/common/utils';
import {
  GalleryAlbum, GalleryAlbumDocument, GalleryItem, GalleryItemDocument,
} from 'src/database/schemas';
import {
  BulkAddItemsDto, CreateAlbumDto, CreateGalleryItemDto, UpdateAlbumDto, UpdateGalleryItemDto,
} from './dto/gallery.dto';

@Injectable()
export class GalleryService extends BaseCrudService<GalleryAlbumDocument> {
  constructor(
    @InjectModel(GalleryAlbum.name) model: Model<GalleryAlbumDocument>,
    @InjectModel(GalleryItem.name) private readonly items: Model<GalleryItemDocument>,
  ) {
    super(model, {
      searchFields: ['title', 'titleBn', 'slug'],
      defaultSort: 'displayOrder -year',
      populate: ['coverImage'],
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

  async createAlbum(dto: CreateAlbumDto, userId?: string) {
    const slug = await this.uniqueSlug(toSlug(dto.slug || dto.title, 'album'));
    return this.create({ ...dto, slug } as any, userId);
  }

  async updateAlbum(id: string, dto: UpdateAlbumDto, userId?: string) {
    const patch: any = { ...dto };
    if (dto.slug || dto.title) {
      patch.slug = await this.uniqueSlug(toSlug(dto.slug || dto.title, 'album'), id);
    }
    return this.update(id, patch, userId);
  }

  async albumsWithCounts() {
    const albums = await this.model.find().populate('coverImage').sort('displayOrder -year').lean();
    const counts = await this.items.aggregate([
      { $group: { _id: '$album', count: { $sum: 1 } } },
    ]);
    const map = new Map(counts.map((c: any) => [String(c._id), c.count]));
    return albums.map((a: any) => ({ ...a, itemCount: map.get(String(a._id)) ?? 0 }));
  }

  async findAlbumBySlug(slug: string, includeDrafts = false) {
    const filter: any = { slug };
    if (!includeDrafts) filter.status = ContentStatus.PUBLISHED;
    const album = await this.model.findOne(filter).populate('coverImage').lean();
    if (!album) throw new NotFoundException('Album not found');
    const items = await this.listItems(String((album as any)._id));
    return { ...album, items };
  }

  listItems(albumId: string) {
    return this.items
      .find({ album: albumId })
      .populate('media')
      .sort('displayOrder')
      .lean();
  }

  /** Flat feed powering the landing-page slider. */
  async featuredFeed(limit = 30) {
    return this.items
      .find({ isFeatured: true })
      .populate('media')
      .populate('album', 'slug title titleBn year')
      .sort('displayOrder')
      .limit(limit)
      .lean();
  }

  async addItem(albumId: string, dto: CreateGalleryItemDto, userId?: string) {
    const album = await this.model.findById(albumId);
    if (!album) throw new NotFoundException('Album not found');
    const displayOrder =
      dto.displayOrder ?? (await this.items.countDocuments({ album: albumId })) * 10;
    const created = await this.items.create({
      album: new Types.ObjectId(albumId),
      media: new Types.ObjectId(dto.media),
      title: dto.title,
      titleBn: dto.titleBn,
      displayOrder,
      isFeatured: dto.isFeatured ?? false,
      createdBy: userId,
      updatedBy: userId,
    } as any);
    return this.items.findById(created._id).populate('media').lean();
  }

  async bulkAddItems(albumId: string, dto: BulkAddItemsDto, userId?: string) {
    const album = await this.model.findById(albumId);
    if (!album) throw new NotFoundException('Album not found');
    let order = (await this.items.countDocuments({ album: albumId })) * 10;
    const docs = dto.mediaIds.map((mediaId) => ({
      album: new Types.ObjectId(albumId),
      media: new Types.ObjectId(mediaId),
      displayOrder: (order += 10),
      isFeatured: dto.isFeatured ?? false,
      createdBy: userId,
      updatedBy: userId,
    }));
    const created = await this.items.insertMany(docs as any);
    if (!album.coverImage && dto.mediaIds.length) {
      album.coverImage = new Types.ObjectId(dto.mediaIds[0]);
      await album.save();
    }
    return { added: created.length };
  }

  async updateItem(itemId: string, dto: UpdateGalleryItemDto, userId?: string) {
    const updated = await this.items.findByIdAndUpdate(
      itemId,
      { ...dto, updatedBy: userId } as any,
      { new: true },
    );
    if (!updated) throw new NotFoundException('Gallery item not found');
    return this.items.findById(itemId).populate('media').lean();
  }

  async removeItem(itemId: string) {
    const deleted = await this.items.findByIdAndDelete(itemId);
    if (!deleted) throw new NotFoundException('Gallery item not found');
    return { id: itemId, deleted: true as const };
  }

  async reorderItems(items: { id: string; displayOrder: number }[]) {
    if (!items?.length) return { updated: 0 };
    const res = await this.items.bulkWrite(
      items.map((i) => ({
        updateOne: { filter: { _id: i.id }, update: { $set: { displayOrder: i.displayOrder } } },
      })) as any,
    );
    return { updated: res.modifiedCount ?? 0 };
  }

  async removeAlbum(id: string) {
    const removed = await this.items.deleteMany({ album: id });
    await this.remove(id);
    return { id, deleted: true as const, itemsRemoved: removed.deletedCount };
  }

  countItems() {
    return this.items.countDocuments();
  }
}
