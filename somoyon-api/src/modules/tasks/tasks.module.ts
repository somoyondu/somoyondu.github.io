import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [MediaModule],
  providers: [TasksService],
})
export class TasksModule {}
