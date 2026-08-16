import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Advisor, AdvisorSchema,
  AuditLog, AuditLogSchema,
  Committee, CommitteeSchema,
  ContactSubmission, ContactSubmissionSchema,
  Designation, DesignationSchema,
  Event, EventSchema,
  GalleryAlbum, GalleryAlbumSchema,
  GalleryItem, GalleryItemSchema,
  Media, MediaSchema,
  Person, PersonSchema,
  Position, PositionSchema,
  Post, PostSchema,
  SiteSettings, SiteSettingsSchema,
  User, UserSchema,
} from './schemas';

const models = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
  { name: Media.name, schema: MediaSchema },
  { name: Person.name, schema: PersonSchema },
  { name: Designation.name, schema: DesignationSchema },
  { name: Committee.name, schema: CommitteeSchema },
  { name: Position.name, schema: PositionSchema },
  { name: Advisor.name, schema: AdvisorSchema },
  { name: GalleryAlbum.name, schema: GalleryAlbumSchema },
  { name: GalleryItem.name, schema: GalleryItemSchema },
  { name: Event.name, schema: EventSchema },
  { name: Post.name, schema: PostSchema },
  { name: SiteSettings.name, schema: SiteSettingsSchema },
  { name: ContactSubmission.name, schema: ContactSubmissionSchema },
  { name: AuditLog.name, schema: AuditLogSchema },
]);

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongoUri'),
        autoIndex: config.get('env') !== 'production',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      }),
    }),
    models,
  ],
  exports: [models],
})
export class DatabaseModule {}
