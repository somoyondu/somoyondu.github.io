import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AuditAction } from 'src/common/enums';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'auditLogs' })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  actor?: Types.ObjectId;

  @Prop() actorEmail?: string;

  @Prop({ type: String, enum: AuditAction, required: true, index: true })
  action: AuditAction;

  @Prop({ required: true, index: true })
  entity: string;

  @Prop()
  entityId?: string;

  @Prop({ type: Object })
  before?: Record<string, any>;

  @Prop({ type: Object })
  after?: Record<string, any>;

  @Prop() ip?: string;
  @Prop() summary?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });
