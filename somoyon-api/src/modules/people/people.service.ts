import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto';
import { BaseCrudService } from 'src/common/services';
import { normalizeBnName, toSlug } from 'src/common/utils';
import { Person, PersonDocument, Position } from 'src/database/schemas';
import { CreatePersonDto, MergePeopleDto, UpdatePersonDto } from './dto/person.dto';

@Injectable()
export class PeopleService extends BaseCrudService<PersonDocument> {
  constructor(
    @InjectModel(Person.name) model: Model<PersonDocument>,
    @InjectModel(Position.name) private readonly positions: Model<Position>,
  ) {
    super(model, {
      searchFields: ['name', 'nameEn', 'slug', 'department'],
      defaultSort: 'name',
      populate: ['photo'],
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

  async createOne(dto: CreatePersonDto, userId?: string) {
    const slug = await this.uniqueSlug(toSlug(dto.nameEn || dto.slug || dto.name, 'person'));
    return this.create(
      { ...dto, slug, normalizedName: normalizeBnName(dto.name) } as any,
      userId,
    );
  }

  async updateOne(id: string, dto: UpdatePersonDto, userId?: string) {
    const patch: any = { ...dto };
    if (dto.slug) patch.slug = await this.uniqueSlug(toSlug(dto.slug, 'person'), id);
    if (dto.name) patch.normalizedName = normalizeBnName(dto.name);
    return this.update(id, patch, userId);
  }

  /** Position history across every committee year. */
  async history(personId: string) {
    return this.positions
      .find({ person: personId })
      .populate('committee', 'year title')
      .populate('designation', 'nameBn nameEn group rank')
      .populate('photoOverride')
      .sort({ 'committee.year': -1 })
      .lean();
  }

  async listWithPositionCount(dto: PaginationDto) {
    const result = await this.paginate(dto);
    const ids = result.items.map((p: any) => p._id);
    const counts = await this.positions.aggregate([
      { $match: { person: { $in: ids } } },
      { $group: { _id: '$person', count: { $sum: 1 } } },
    ]);
    const map = new Map(counts.map((c: any) => [String(c._id), c.count]));
    return {
      ...result,
      items: result.items.map((p: any) => ({ ...p, positionCount: map.get(String(p._id)) ?? 0 })),
    };
  }

  /** Suggests likely duplicates using the normalised Bengali name. */
  async duplicateCandidates() {
    const groups = await this.model.aggregate([
      { $match: { normalizedName: { $nin: [null, ''] } } },
      { $group: { _id: '$normalizedName', ids: { $push: '$_id' }, names: { $push: '$name' }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
      { $sort: { n: -1 } },
    ]);
    return groups.map((g) => ({ normalizedName: g._id, ids: g.ids, names: g.names, count: g.n }));
  }

  /** Repoints every position to keepId, then deletes the merged records. */
  async merge(dto: MergePeopleDto) {
    if (dto.mergeIds.includes(dto.keepId)) {
      throw new BadRequestException('keepId cannot appear in mergeIds');
    }
    const keep = await this.model.findById(dto.keepId);
    if (!keep) throw new BadRequestException('keepId does not exist');

    const repointed = await this.positions.updateMany(
      { person: { $in: dto.mergeIds } },
      { $set: { person: dto.keepId } },
    );
    if (!keep.photo) {
      const donor = await this.model.findOne({ _id: { $in: dto.mergeIds }, photo: { $ne: null } });
      if (donor?.photo) {
        keep.photo = donor.photo;
        await keep.save();
      }
    }
    await this.model.deleteMany({ _id: { $in: dto.mergeIds } });
    return { keepId: dto.keepId, merged: dto.mergeIds.length, positionsRepointed: repointed.modifiedCount };
  }

  async removeSafely(id: string) {
    const used = await this.positions.countDocuments({ person: id });
    if (used > 0) {
      throw new BadRequestException(
        `This person holds ${used} committee position(s). Remove those first.`,
      );
    }
    return this.remove(id);
  }
}
