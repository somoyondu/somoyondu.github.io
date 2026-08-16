import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ContentStatus, PostCategory } from 'src/common/enums';

export type PostDocument = HydratedDocument<Post>;

@Schema({ _id: false })
export class Seo {
  @Prop() metaTitle?: string;
  @Prop() metaDescription?: string;
  @Prop({ type: Types.ObjectId, ref: 'Media' }) ogImage?: Types.ObjectId;
}
const SeoSchema = SchemaFactory.createForClass(Seo);

@Schema({ timestamps: true, collection: 'posts' })
export class Post {
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

  @Prop({ type: String, enum: PostCategory, default: PostCategory.NOTICE, index: true })
  category: PostCategory;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  author?: Types.ObjectId;

  @Prop({ type: String, enum: ContentStatus, default: ContentStatus.DRAFT, index: true })
  status: ContentStatus;

  @Prop()
  publishedAt?: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({ type: SeoSchema, default: {} })
  seo?: Seo;

  @Prop({ type: Types.ObjectId, ref: 'User' }) createdBy?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) updatedBy?: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ status: 1, category: 1, publishedAt: -1 });
