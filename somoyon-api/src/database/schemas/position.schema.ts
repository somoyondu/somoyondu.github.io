import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PositionGroup } from 'src/common/enums';

export type PositionDocument = HydratedDocument<Position>;

/** Membership of a Person in a Committee under a Designation. */
@Schema({ timestamps: true, collection: 'positions' })
export class Position {
  @Prop({ type: Types.ObjectId, ref: 'Committee', required: true, index: true })
  committee: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Person', required: true, index: true })
  person: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Designation', required: true })
  designation: Types.ObjectId;

  /** Year-specific photo; falls back to person.photo when unset. */
  @Prop({ type: Types.ObjectId, ref: 'Media' })
  photoOverride?: Types.ObjectId;

  @Prop({ type: String, enum: PositionGroup, required: true, index: true })
  group: PositionGroup;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' }) createdBy?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) updatedBy?: Types.ObjectId;
}

export const PositionSchema = SchemaFactory.createForClass(Position);
PositionSchema.index({ committee: 1, group: 1, displayOrder: 1 });
PositionSchema.index({ committee: 1, person: 1, designation: 1 }, { unique: true });
