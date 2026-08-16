import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GalleryItemDocument = HydratedDocument<GalleryItem>;

@Schema({ timestamps: true, collection: 'galleryItems' })
export class GalleryItem {
  @Prop({ type: Types.ObjectId, ref: 'GalleryAlbum', required: true, index: true })
  album: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media', required: true })
  media: Types.ObjectId;

  @Prop()
  title?: string;

  @Prop()
  titleBn?: string;

  @Prop({ default: 0 })
  displayOrder: number;

  /** Featured items make up the flat slider feed on the landing page. */
  @Prop({ default: false, index: true })
  isFeatured: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' }) createdBy?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) updatedBy?: Types.ObjectId;
}

export const GalleryItemSchema = SchemaFactory.createForClass(GalleryItem);
GalleryItemSchema.index({ album: 1, displayOrder: 1 });
