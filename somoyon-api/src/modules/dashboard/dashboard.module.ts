import { Module } from '@nestjs/common';
import { ContactModule } from '../contact/contact.module';
import { GalleryModule } from '../gallery/gallery.module';
import { MediaModule } from '../media/media.module';
import { UsersModule } from '../users/users.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [GalleryModule, MediaModule, UsersModule, ContactModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
