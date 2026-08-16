import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseCrudService } from 'src/common/services';
import { toSlug } from 'src/common/utils';
import { Designation, DesignationDocument } from 'src/database/schemas';
import { CreateDesignationDto, UpdateDesignationDto } from './dto/designation.dto';

@Injectable()
export class DesignationsService extends BaseCrudService<DesignationDocument> {
  constructor(@InjectModel(Designation.name) model: Model<DesignationDocument>) {
    super(model, { searchFields: ['nameBn', 'nameEn', 'slug'], defaultSort: 'group rank' });
  }

  async createOne(dto: CreateDesignationDto, userId?: string) {
    const slug = dto.slug || toSlug(dto.nameEn || dto.nameBn, 'designation');
    return this.create({ ...dto, slug } as any, userId);
  }

  async updateOne(id: string, dto: UpdateDesignationDto, userId?: string) {
    const patch: any = { ...dto };
    if (dto.slug) patch.slug = toSlug(dto.slug, 'designation');
    return this.update(id, patch, userId);
  }

  /** Used by the migration importer: get-or-create by Bengali title. */
  async findOrCreateByNameBn(nameBn: string, group: string, rank = 100) {
    const existing = await this.model.findOne({ nameBn: nameBn.trim() });
    if (existing) return existing;
    return this.model.create({
      slug: toSlug(nameBn, 'designation'),
      nameBn: nameBn.trim(),
      group,
      rank,
    } as any);
  }

  listGrouped() {
    return this.model.find({ isActive: true }).sort('group rank').lean();
  }
}
