import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * Public GET responses are cached. Any admin mutation calls bust() so visitors
 * see changes within one request instead of waiting for the TTL.
 */
@Injectable()
export class CacheBustService {
  private readonly logger = new Logger(CacheBustService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async bustAll(): Promise<void> {
    try {
      const store: any = (this.cache as any).store;
      if (typeof store?.reset === 'function') {
        await store.reset();
      } else if (typeof (this.cache as any).reset === 'function') {
        await (this.cache as any).reset();
      } else if (typeof store?.keys === 'function') {
        const keys: string[] = await store.keys();
        await Promise.all(keys.map((k) => this.cache.del(k)));
      }
      this.logger.debug('Public cache flushed');
    } catch (err) {
      this.logger.warn(`Cache bust failed: ${(err as Error).message}`);
    }
  }

  async bust(...keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.cache.del(k).catch(() => undefined)));
  }
}
