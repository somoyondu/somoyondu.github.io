import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ContentStatus } from 'src/common/enums';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true, collection: 'events' })
export class Event {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  titleBn?: string;

  @Prop()
  excerpt?: string;

  @Prop()
  content?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  coverImage?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Media' }], default: [] })
  gallery: Types.ObjectId[];

  @Prop({ required: true, index: true })
  startAt: Date;

  @Prop()
  endAt?: Date;

  @Prop() venue?: string;
  @Prop() venueBn?: string;
  @Prop() registrationUrl?: string;

  @Prop({ type: String, enum: ContentStatus, default: ContentStatus.DRAFT, index: true })
  status: ContentStatus;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  publishedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' }) createdBy?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) updatedBy?: Types.ObjectId;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ status: 1, startAt: -1 });
