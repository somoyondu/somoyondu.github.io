import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationDto, buildMeta } from 'src/common/dto';
import { AuditAction } from 'src/common/enums';
import { AuditLog } from 'src/database/schemas';

export interface AuditInput {
  actor?: string;
  actorEmail?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  before?: any;
  after?: any;
  ip?: string;
  summary?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(@InjectModel(AuditLog.name) private readonly model: Model<AuditLog>) {}

  /** Never throws — an audit failure must not break a content operation. */
  async record(input: AuditInput): Promise<void> {
    try {
      await this.model.create(input as any);
    } catch (err) {
      this.logger.warn(`Audit write failed: ${(err as Error).message}`);
    }
  }

  async paginate(dto: PaginationDto & { entity?: string; action?: AuditAction; actor?: string }) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const filter: any = {};
    if (dto.entity) filter.entity = dto.entity;
    if (dto.action) filter.action = dto.action;
    if (dto.actor) filter.actor = dto.actor;
    if (dto.q) filter.$or = [{ summary: new RegExp(dto.q, 'i') }, { actorEmail: new RegExp(dto.q, 'i') }];

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('actor', 'name email role')
        .lean()
        .exec(),
      this.model.countDocuments(filter),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  }

  async recentActivity(limit = 10) {
    return this.model.find().sort('-createdAt').limit(limit).populate('actor', 'name email').lean();
  }
}
