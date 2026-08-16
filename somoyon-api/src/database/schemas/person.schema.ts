import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PersonDocument = HydratedDocument<Person>;

@Schema({ _id: false })
export class PersonSocials {
  @Prop() facebook?: string;
  @Prop() linkedin?: string;
  @Prop() email?: string;
  @Prop() phone?: string;
}
const PersonSocialsSchema = SchemaFactory.createForClass(PersonSocials);

/**
 * One record per human. Positions link a person to a committee year, which is
 * what removes the legacy duplication of the same face across members/2024,
 * members/2025 and committee-members/2026.
 */
@Schema({ timestamps: true, collection: 'people' })
export class Person {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  nameEn?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  photo?: Types.ObjectId;

  @Prop() department?: string;
  @Prop() session?: string;
  @Prop() bio?: string;
  @Prop() bioBn?: string;

  @Prop({ type: PersonSocialsSchema, default: {} })
  socials?: PersonSocials;

  /** When false, contact fields are stripped from public responses. */
  @Prop({ default: false })
  isPublic: boolean;

  /** Normalised name used for duplicate detection during migration. */
  @Prop({ index: true })
  normalizedName?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' }) createdBy?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) updatedBy?: Types.ObjectId;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
PersonSchema.index({ name: 'text', nameEn: 'text' });
