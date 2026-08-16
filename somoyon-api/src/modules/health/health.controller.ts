import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.mongoose.pingCheck('mongodb', { timeout: 3000 })]);
  }

  /** Cheap endpoint for the keep-warm cron on free-tier hosting. */
  @Get('ping')
  ping() {
    return { pong: true, uptime: process.uptime(), at: new Date().toISOString() };
  }
}
