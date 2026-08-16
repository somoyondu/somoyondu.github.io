import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AdvisorDocument = HydratedDocument<Advisor>;

@Schema({ timestamps: true, collection: 'advisors' })
export class Advisor {
  @Prop({ required: true })
  name: string;

  @Prop()
  nameEn?: string;

  @Prop({ required: true })
  designation: string;

  @Prop()
  designationEn?: string;

  @Prop()
  organization?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  photo?: Types.ObjectId;

  @Prop({ default: 0, index: true })
  displayOrder: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  year?: number;

  @Prop({ type: Types.ObjectId, ref: 'User' }) createdBy?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) updatedBy?: Types.ObjectId;
}

export const AdvisorSchema = SchemaFactory.createForClass(Advisor);
