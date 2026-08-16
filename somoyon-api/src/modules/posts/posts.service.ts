import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentStatus } from 'src/common/enums';
import { BaseCrudService } from 'src/common/services';
import { sanitizeRichText, toSlug } from 'src/common/utils';
import { Post, PostDocument } from 'src/database/schemas';
import { CreatePostDto, PostQueryDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostsService extends BaseCrudService<PostDocument> {
  constructor(@InjectModel(Post.name) model: Model<PostDocument>) {
    super(model, {
      searchFields: ['title', 'titleBn', 'excerpt', 'tags'],
      defaultSort: '-isPinned -publishedAt -createdAt',
      populate: ['coverImage', { path: 'author', select: 'name nameBn email' } as any],
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

  async createOne(dto: CreatePostDto, userId?: string) {
    const slug = await this.uniqueSlug(toSlug(dto.slug || dto.title, 'post'));
    return this.create(
      {
        ...dto,
        slug,
        author: userId,
        content: sanitizeRichText(dto.content),
        publishedAt: dto.status === ContentStatus.PUBLISHED ? new Date() : undefined,
      } as any,
      userId,
    );
  }

  async updateOne(id: string, dto: UpdatePostDto, userId?: string) {
    const patch: any = { ...dto };
    if (dto.slug || dto.title) {
      patch.slug = await this.uniqueSlug(toSlug(dto.slug || dto.title, 'post'), id);
    }
    if (dto.content !== undefined) patch.content = sanitizeRichText(dto.content);
    if (dto.status === ContentStatus.PUBLISHED) {
      const current = await this.model.findById(id).lean();
      if (!(current as any)?.publishedAt) patch.publishedAt = new Date();
    }
    return this.update(id, patch, userId);
  }

  listAdmin(dto: PostQueryDto) {
    const filter: any = {};
    if (dto.category) filter.category = dto.category;
    if (dto.status) filter.status = dto.status;
    if (dto.tag) filter.tags = dto.tag;
    return this.paginate(dto, filter);
  }

  listPublic(dto: PostQueryDto) {
    const filter: any = { status: ContentStatus.PUBLISHED };
    if (dto.category) filter.category = dto.category;
    if (dto.tag) filter.tags = dto.tag;
    return this.paginate(dto, filter);
  }

  async findBySlug(slug: string, includeDrafts = false) {
    const filter: any = { slug };
    if (!includeDrafts) filter.status = ContentStatus.PUBLISHED;
    const query = this.model.findOne(filter);
    this.applyPopulate(query);
    const doc = await query.lean();
    if (!doc) throw new NotFoundException('Post not found');
    await this.model.updateOne({ slug }, { $inc: { viewCount: 1 } });
    return doc;
  }

  async setStatus(id: string, status: ContentStatus, userId?: string) {
    const patch: any = { status };
    if (status === ContentStatus.PUBLISHED) patch.publishedAt = new Date();
    return this.update(id, patch, userId);
  }
}
