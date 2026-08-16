import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContentStatus, PositionGroup } from 'src/common/enums';
import { BaseCrudService } from 'src/common/services';
import {
  Committee, CommitteeDocument, Designation, Person, Position, PositionDocument,
} from 'src/database/schemas';
import {
  CloneCommitteeDto, CreateCommitteeDto, CreatePositionDto, UpdateCommitteeDto, UpdatePositionDto,
} from './dto/committee.dto';

export const GROUP_ORDER: PositionGroup[] = [
  PositionGroup.TOP_LEADER,
  PositionGroup.TOP_EXECUTIVE,
  PositionGroup.ORGANIZING,
  PositionGroup.OFFICIAL,
  PositionGroup.MEMBER,
];

@Injectable()
export class CommitteesService extends BaseCrudService<CommitteeDocument> {
  constructor(
    @InjectModel(Committee.name) model: Model<CommitteeDocument>,
    @InjectModel(Position.name) private readonly positions: Model<PositionDocument>,
    @InjectModel(Designation.name) private readonly designations: Model<Designation>,
    @InjectModel(Person.name) private readonly people: Model<Person>,
  ) {
    super(model, { searchFields: ['title', 'description'], defaultSort: '-year' });
  }

  async createOne(dto: CreateCommitteeDto, userId?: string) {
    const exists = await this.model.exists({ year: dto.year });
    if (exists) throw new BadRequestException(`Committee for ${dto.year} already exists`);
    const bnYear = this.toBengaliDigits(dto.year);
    return this.create(
      {
        expandButtonText: `${bnYear} এর পূর্ণাঙ্গ কার্যনির্বাহী পরিষদ দেখুন`,
        collapseButtonText: `${bnYear} এর সংক্ষিপ্ত কমিটি দেখুন`,
        displayOrder: -dto.year,
        ...dto,
      } as any,
      userId,
    );
  }

  toBengaliDigits(n: number | string) {
    const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n).replace(/\d/g, (d) => map[Number(d)]);
  }

  async updateOne(id: string, dto: UpdateCommitteeDto, userId?: string) {
    if (dto.year) {
      const clash = await this.model.findOne({ year: dto.year, _id: { $ne: id } });
      if (clash) throw new BadRequestException(`Committee for ${dto.year} already exists`);
    }
    return this.update(id, dto as any, userId);
  }

  async findByYear(year: number, includeDrafts = false) {
    const filter: any = { year };
    if (!includeDrafts) filter.status = ContentStatus.PUBLISHED;
    const committee = await this.model.findOne(filter).populate('coverImage').lean();
    if (!committee) throw new NotFoundException(`No committee found for ${year}`);
    return committee;
  }

  /** Returns positions already grouped so the frontend needs no reshaping. */
  async positionsGrouped(committeeId: string) {
    const rows = await this.positions
      .find({ committee: committeeId, isActive: true })
      .populate({ path: 'person', populate: { path: 'photo' } })
      .populate('designation')
      .populate('photoOverride')
      .sort({ displayOrder: 1 })
      .lean();

    const grouped: Record<string, any[]> = {};
    GROUP_ORDER.forEach((g) => (grouped[g] = []));
    for (const row of rows as any[]) {
      const key = row.group ?? row.designation?.group ?? PositionGroup.MEMBER;
      (grouped[key] ??= []).push(row);
    }
    return grouped;
  }

  async listPositions(committeeId: string, group?: PositionGroup) {
    const filter: any = { committee: committeeId };
    if (group) filter.group = group;
    return this.positions
      .find(filter)
      .populate({ path: 'person', populate: { path: 'photo' } })
      .populate('designation')
      .populate('photoOverride')
      .sort({ displayOrder: 1 })
      .lean();
  }

  async addPosition(committeeId: string, dto: CreatePositionDto, userId?: string) {
    const committee = await this.model.findById(committeeId);
    if (!committee) throw new NotFoundException('Committee not found');

    const designation = await this.designations.findById(dto.designation);
    if (!designation) throw new BadRequestException('Designation not found');

    const person = await this.people.findById(dto.person);
    if (!person) throw new BadRequestException('Person not found');

    const group = dto.group ?? designation.group;
    const displayOrder =
      dto.displayOrder ??
      (await this.positions.countDocuments({ committee: committeeId, group })) * 10;

    const created = await this.positions.create({
      committee: new Types.ObjectId(committeeId),
      person: new Types.ObjectId(dto.person),
      designation: new Types.ObjectId(dto.designation),
      photoOverride: dto.photoOverride ? new Types.ObjectId(dto.photoOverride) : undefined,
      group,
      displayOrder,
      isActive: dto.isActive ?? true,
      createdBy: userId,
      updatedBy: userId,
    } as any);

    return this.getPosition(String(created._id));
  }

  async getPosition(id: string) {
    const doc = await this.positions
      .findById(id)
      .populate({ path: 'person', populate: { path: 'photo' } })
      .populate('designation')
      .populate('photoOverride')
      .lean();
    if (!doc) throw new NotFoundException('Position not found');
    return doc;
  }

  async updatePosition(id: string, dto: UpdatePositionDto, userId?: string) {
    const patch: any = { ...dto, updatedBy: userId };
    if (dto.designation && !dto.group) {
      const designation = await this.designations.findById(dto.designation);
      if (designation) patch.group = designation.group;
    }
    const updated = await this.positions.findByIdAndUpdate(id, patch, { new: true });
    if (!updated) throw new NotFoundException('Position not found');
    return this.getPosition(id);
  }

  async removePosition(id: string) {
    const deleted = await this.positions.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Position not found');
    return { id, deleted: true as const };
  }

  async reorderPositions(items: { id: string; displayOrder: number }[]) {
    if (!items?.length) return { updated: 0 };
    const res = await this.positions.bulkWrite(
      items.map((i) => ({
        updateOne: { filter: { _id: i.id }, update: { $set: { displayOrder: i.displayOrder } } },
      })) as any,
    );
    return { updated: res.modifiedCount ?? 0 };
  }

  /**
   * The workflow that removes the annual code deploy: duplicate last year's
   * structure into a new DRAFT year, optionally keeping the same people.
   */
  async clone(dto: CloneCommitteeDto, userId?: string) {
    const source = await this.model.findOne({ year: dto.sourceYear });
    if (!source) throw new BadRequestException(`Source committee ${dto.sourceYear} not found`);

    const clash = await this.model.exists({ year: dto.targetYear });
    if (clash) throw new BadRequestException(`Committee for ${dto.targetYear} already exists`);

    const bnYear = this.toBengaliDigits(dto.targetYear);
    const created = await this.model.create({
      year: dto.targetYear,
      title: dto.title ?? `কার্যনির্বাহী পরিষদ ${bnYear}`,
      expandButtonText: `${bnYear} এর পূর্ণাঙ্গ কার্যনির্বাহী পরিষদ দেখুন`,
      collapseButtonText: `${bnYear} এর সংক্ষিপ্ত কমিটি দেখুন`,
      description: source.description,
      isFounding: false,
      status: ContentStatus.DRAFT,
      displayOrder: -dto.targetYear,
      createdBy: userId,
      updatedBy: userId,
    } as any);

    const sourcePositions = await this.positions.find({ committee: source._id }).lean();
    const copyPeople = dto.copyPeople ?? true;

    if (copyPeople && sourcePositions.length) {
      await this.positions.insertMany(
        sourcePositions.map((p: any) => ({
          committee: created._id,
          person: p.person,
          designation: p.designation,
          group: p.group,
          displayOrder: p.displayOrder,
          isActive: true,
          createdBy: userId,
          updatedBy: userId,
        })),
      );
    }

    return {
      committee: await this.findById(String(created._id)),
      positionsCopied: copyPeople ? sourcePositions.length : 0,
      note: copyPeople
        ? 'Draft created with last year’s people. Swap the individuals, then publish.'
        : 'Empty draft created. Add positions, then publish.',
    };
  }

  async removeWithPositions(id: string) {
    const removedPositions = await this.positions.deleteMany({ committee: id });
    await this.remove(id);
    return { id, deleted: true as const, positionsRemoved: removedPositions.deletedCount };
  }

  async setStatus(id: string, status: ContentStatus, userId?: string) {
    return this.update(id, { status } as any, userId);
  }

  async summary() {
    const committees = await this.model.find().sort('-year').lean();
    const counts = await this.positions.aggregate([
      { $group: { _id: '$committee', count: { $sum: 1 } } },
    ]);
    const map = new Map(counts.map((c: any) => [String(c._id), c.count]));
    return committees.map((c: any) => ({ ...c, positionCount: map.get(String(c._id)) ?? 0 }));
  }
}
