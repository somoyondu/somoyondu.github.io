import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators';
import { PaginationDto } from 'src/common/dto';
import { AuditAction, Role } from 'src/common/enums';
import { AuditService } from './audit.service';

@ApiTags('admin/audit')
@ApiBearerAuth()
@Controller('admin/audit-logs')
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  list(@Query() dto: PaginationDto & { entity?: string; action?: AuditAction; actor?: string }) {
    return this.service.paginate(dto);
  }
}
