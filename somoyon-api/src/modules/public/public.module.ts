import { Module } from '@nestjs/common';
import { AdvisorsModule } from '../advisors/advisors.module';
import { CommitteesModule } from '../committees/committees.module';
import { ContactModule } from '../contact/contact.module';
import { EventsModule } from '../events/events.module';
import { GalleryModule } from '../gallery/gallery.module';
import { MediaModule } from '../media/media.module';
import { PostsModule } from '../posts/posts.module';
import { SettingsModule } from '../settings/settings.module';
import { PublicController } from './public.controller';
import { PublicMapper } from './public.mapper';
import { PublicService } from './public.service';

@Module({
  imports: [
    CommitteesModule, AdvisorsModule, GalleryModule, EventsModule,
    PostsModule, SettingsModule, ContactModule, MediaModule,
  ],
  controllers: [PublicController],
  providers: [PublicService, PublicMapper],
  exports: [PublicService],
})
export class PublicModule {}
