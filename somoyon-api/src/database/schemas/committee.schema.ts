import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ContentStatus } from 'src/common/enums';

export type CommitteeDocument = HydratedDocument<Committee>;

@Schema({ timestamps: true, collection: 'committees' })
export class Committee {
  @Prop({ required: true, unique: true, index: true })
  year: number;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  expandButtonText: string;

  @Prop({ default: '' })
  collapseButtonText: string;

  @Prop()
  description?: string;

  /** The 2023 founding committee renders in its own section. */
  @Prop({ default: false, index: true })
  isFounding: boolean;

  @Prop({ type: String, enum: ContentStatus, default: ContentStatus.DRAFT, index: true })
  status: ContentStatus;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  coverImage?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' }) createdBy?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) updatedBy?: Types.ObjectId;
}

export const CommitteeSchema = SchemaFactory.createForClass(Committee);
CommitteeSchema.index({ status: 1, year: -1 });
