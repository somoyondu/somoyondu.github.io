import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SiteSettingsDocument = HydratedDocument<SiteSettings>;

@Schema({ _id: false })
export class RichBlock {
  @Prop() title?: string;
  @Prop() body?: string;
  @Prop() subtitle?: string;
}
const RichBlockSchema = SchemaFactory.createForClass(RichBlock);

@Schema({ _id: false })
export class SocialLink {
  @Prop({ required: true }) platform: string;
  @Prop({ required: true }) url: string;
  @Prop() iconUrl?: string;
  @Prop({ default: 0 }) displayOrder: number;
  @Prop({ default: true }) isActive: boolean;
}
const SocialLinkSchema = SchemaFactory.createForClass(SocialLink);

@Schema({ _id: false })
export class DonationMethod {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) number: string;
  @Prop() type?: string;
  @Prop() iconUrl?: string;
  @Prop({ type: Types.ObjectId, ref: 'Media' }) logo?: Types.ObjectId;
  @Prop() instructions?: string;
  @Prop({ default: 0 }) displayOrder: number;
  @Prop({ default: true }) isActive: boolean;
}
const DonationMethodSchema = SchemaFactory.createForClass(DonationMethod);

@Schema({ _id: false })
export class NavLink {
  @Prop({ required: true }) id: string;
  @Prop({ required: true }) title: string;
  @Prop() href?: string;
  @Prop({ default: 0 }) displayOrder: number;
  @Prop({ default: true }) isActive: boolean;
}
const NavLinkSchema = SchemaFactory.createForClass(NavLink);

@Schema({ timestamps: true, collection: 'siteSettings' })
export class SiteSettings {
  /** Singleton document — always the literal key 'singleton'. */
  @Prop({ default: 'singleton', unique: true, index: true })
  key: string;

  @Prop({ default: 'সময়ন' }) siteName: string;
  @Prop() tagline?: string;

  @Prop({ type: Types.ObjectId, ref: 'Media' }) logo?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Media' }) whiteLogo?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Media' }) favicon?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Media' }) heroBackground?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  hero?: { headline?: string; subheadline?: string; body?: string; ctaText?: string };

  @Prop({ type: RichBlockSchema, default: {} }) about?: RichBlock;
  @Prop({ type: RichBlockSchema, default: {} }) foundingBlurb?: RichBlock;
  @Prop({ type: RichBlockSchema, default: {} }) advisoryBlurb?: RichBlock;
  @Prop({ type: RichBlockSchema, default: {} }) galleryBlurb?: RichBlock;

  @Prop({ type: Object, default: {} })
  contact?: { email?: string; phone?: string; address?: string; facebookPage?: string };

  @Prop({ type: [SocialLinkSchema], default: [] })
  socials: SocialLink[];

  @Prop({ type: Object, default: {} })
  donation?: {
    isEnabled?: boolean;
    title?: string;
    description?: string;
    footerTitle?: string;
    footerCta?: string;
    methods?: DonationMethod[];
  };

  @Prop({ type: [NavLinkSchema], default: [] })
  navLinks: NavLink[];

  @Prop({ type: Object, default: {} })
  seo?: {
    defaultTitle?: string;
    defaultDescription?: string;
    ogImageUrl?: string;
    gaTrackingId?: string;
    siteUrl?: string;
  };

  @Prop({ default: false })
  maintenanceMode: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' }) updatedBy?: Types.ObjectId;
}

export const SiteSettingsSchema = SchemaFactory.createForClass(SiteSettings);
export { DonationMethodSchema, SocialLinkSchema, NavLinkSchema };
