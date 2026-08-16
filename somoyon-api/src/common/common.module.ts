import { Global, Module } from '@nestjs/common';
import { CacheBustService } from './services';

@Global()
@Module({
  providers: [CacheBustService],
  exports: [CacheBustService],
})
export class CommonModule {}
