import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';
import { DashboardService } from './dashboard.service';

@ApiTags('admin/dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  stats() {
    return this.service.stats();
  }
}
