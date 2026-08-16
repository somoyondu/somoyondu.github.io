import { NotFoundException } from '@nestjs/common';
import { FilterQuery, Model, PopulateOptions, UpdateQuery } from 'mongoose';
import { Paginated, PaginationDto, buildMeta } from '../dto';

export interface BaseCrudOptions {
  /** Fields used by the `q` free-text filter. */
  searchFields?: string[];
  /** Default sort when none supplied. */
  defaultSort?: string;
  /** Relations to populate on read. */
  populate?: (string | PopulateOptions)[];
}

/**
 * Generic Mongoose CRUD service. Every content module extends this so the
 * repetitive list/get/create/update/delete/reorder logic lives in one place.
 */
export class BaseCrudService<T> {
  constructor(
    protected readonly model: Model<T>,
    protected readonly options: BaseCrudOptions = {},
  ) {}

  protected get searchFields() {
    return this.options.searchFields ?? ['name', 'title'];
  }

  protected get defaultSort() {
    return this.options.defaultSort ?? '-createdAt';
  }

  protected applyPopulate(query: any) {
    (this.options.populate ?? []).forEach((p) => query.populate(p as any));
    return query;
  }

  buildSearchFilter(q?: string): FilterQuery<T> {
    if (!q) return {};
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return { $or: this.searchFields.map((f) => ({ [f]: rx })) } as FilterQuery<T>;
  }

  async paginate(dto: PaginationDto, extraFilter: FilterQuery<T> = {}): Promise<Paginated<T>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const filter = { ...extraFilter, ...this.buildSearchFilter(dto.q) } as FilterQuery<T>;

    const query = this.model
      .find(filter)
      .sort(dto.sort || this.defaultSort)
      .skip((page - 1) * limit)
      .limit(limit);
    this.applyPopulate(query);

    const [items, total] = await Promise.all([
      query.lean().exec() as Promise<T[]>,
      this.model.countDocuments(filter),
    ]);

    return { items, meta: buildMeta(page, limit, total) };
  }

  async findAll(filter: FilterQuery<T> = {}, sort?: string): Promise<T[]> {
    const query = this.model.find(filter).sort(sort || this.defaultSort);
    this.applyPopulate(query);
    return query.lean().exec() as Promise<T[]>;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    const query = this.model.findOne(filter);
    this.applyPopulate(query);
    return query.lean().exec() as Promise<T | null>;
  }

  async findById(id: string): Promise<T> {
    const query = this.model.findById(id);
    this.applyPopulate(query);
    const doc = (await query.lean().exec()) as T;
    if (!doc) throw new NotFoundException(`${this.model.modelName} not found`);
    return doc;
  }

  async create(dto: Partial<T>, userId?: string): Promise<T> {
    const created = await this.model.create({
      ...dto,
      ...(userId ? { createdBy: userId, updatedBy: userId } : {}),
    } as any);
    return this.findById(String(created._id));
  }

  async update(id: string, dto: UpdateQuery<T>, userId?: string): Promise<T> {
    const updated = await this.model.findByIdAndUpdate(
      id,
      { ...dto, ...(userId ? { updatedBy: userId } : {}) } as any,
      { new: true, runValidators: true },
    );
    if (!updated) throw new NotFoundException(`${this.model.modelName} not found`);
    return this.findById(id);
  }

  async remove(id: string): Promise<{ id: string; deleted: true }> {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException(`${this.model.modelName} not found`);
    return { id, deleted: true };
  }

  async reorder(items: { id: string; displayOrder: number }[]): Promise<{ updated: number }> {
    if (!items?.length) return { updated: 0 };
    const ops = items.map((i) => ({
      updateOne: { filter: { _id: i.id }, update: { $set: { displayOrder: i.displayOrder } } },
    }));
    const res = await this.model.bulkWrite(ops as any);
    return { updated: res.modifiedCount ?? 0 };
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }
}
