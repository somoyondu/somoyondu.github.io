import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MediaDocument = HydratedDocument<Media>;

@Schema({ timestamps: true, collection: 'media' })
export class Media {
  @Prop({ required: true, unique: true, index: true })
  publicId: string;

  @Prop({ required: true })
  secureUrl: string;

  @Prop()
  url?: string;

  @Prop()
  format?: string;

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  @Prop()
  bytes?: number;

  @Prop({ default: 'image' })
  resourceType: string;

  @Prop({ index: true })
  folder?: string;

  @Prop()
  alt?: string;

  @Prop()
  altBn?: string;

  @Prop()
  caption?: string;

  @Prop()
  captionBn?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  blurhash?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy?: Types.ObjectId;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
MediaSchema.index({ folder: 1, createdAt: -1 });
MediaSchema.index({ tags: 1 });
