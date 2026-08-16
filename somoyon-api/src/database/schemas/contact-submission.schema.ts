import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SubmissionStatus } from 'src/common/enums';

export type ContactSubmissionDocument = HydratedDocument<ContactSubmission>;

@Schema({ timestamps: true, collection: 'contactSubmissions' })
export class ContactSubmission {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, lowercase: true }) email: string;
  @Prop() phone?: string;
  @Prop({ required: true }) subject: string;
  @Prop({ required: true }) message: string;

  @Prop({ type: String, enum: SubmissionStatus, default: SubmissionStatus.NEW, index: true })
  status: SubmissionStatus;

  /** Hashed, never the raw IP. */
  @Prop({ select: false }) ipHash?: string;
  @Prop({ select: false }) userAgent?: string;
  @Prop() adminNote?: string;
}

export const ContactSubmissionSchema = SchemaFactory.createForClass(ContactSubmission);
ContactSubmissionSchema.index({ status: 1, createdAt: -1 });
