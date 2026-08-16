import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ContentStatus } from 'src/common/enums';

export type GalleryAlbumDocument = HydratedDocument<GalleryAlbum>;

@Schema({ timestamps: true, collection: 'galleryAlbums' })
export class GalleryAlbum {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  titleBn?: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  coverImage?: Types.ObjectId;

  @Prop()
  eventDate?: Date;

  @Prop({ index: true })
  year?: number;

  @Prop({ type: String, enum: ContentStatus, default: ContentStatus.PUBLISHED, index: true })
  status: ContentStatus;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ type: Types.ObjectId, ref: 'User' }) createdBy?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) updatedBy?: Types.ObjectId;
}

export const GalleryAlbumSchema = SchemaFactory.createForClass(GalleryAlbum);
GalleryAlbumSchema.index({ status: 1, displayOrder: 1, year: -1 });
