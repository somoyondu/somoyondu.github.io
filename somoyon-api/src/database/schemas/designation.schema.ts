import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PositionGroup } from 'src/common/enums';

export type DesignationDocument = HydratedDocument<Designation>;

/** Lookup table — prevents Bengali title typo drift across years. */
@Schema({ timestamps: true, collection: 'designations' })
export class Designation {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  nameBn: string;

  @Prop()
  nameEn?: string;

  @Prop({ type: String, enum: PositionGroup, required: true, index: true })
  group: PositionGroup;

  /** Sort weight inside the group (lower renders first). */
  @Prop({ default: 100 })
  rank: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const DesignationSchema = SchemaFactory.createForClass(Designation);
DesignationSchema.index({ group: 1, rank: 1 });
