import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from 'src/common/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  nameBn?: string;

  @Prop({ type: String, enum: Role, default: Role.EDITOR, index: true })
  role: Role;

  @Prop({ type: Types.ObjectId, ref: 'Media' })
  avatar?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ select: false })
  refreshTokenHash?: string;

  @Prop({ select: false })
  passwordResetTokenHash?: string;

  @Prop({ select: false })
  passwordResetExpiresAt?: Date;

  @Prop({ default: true })
  mustChangePassword: boolean;

  @Prop({ default: 0, select: false })
  failedLoginAttempts: number;

  @Prop({ select: false })
  lockedUntil?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ role: 1, isActive: 1 });
