import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MediaService } from '../media/media.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly media: MediaService) {}

  /** Nightly reconcile between Cloudinary and the media collection. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async reconcileMedia() {
    try {
      const { orphanedInCloud, missingInCloud } = await this.media.findOrphans();
      if (orphanedInCloud.length || missingInCloud.length) {
        this.logger.warn(
          `Media drift — ${orphanedInCloud.length} orphaned in Cloudinary, ${missingInCloud.length} missing from Cloudinary`,
        );
      } else {
        this.logger.log('Media reconcile clean');
      }
    } catch (err) {
      this.logger.error(`Media reconcile failed: ${(err as Error).message}`);
    }
  }
}
