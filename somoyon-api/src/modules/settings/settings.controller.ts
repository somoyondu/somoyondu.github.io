import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { AuditAction, Role } from 'src/common/enums';
import { CacheBustService } from 'src/common/services';
import { AuditService } from '../audit/audit.service';
import { UpdateSettingsDto } from './dto/settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('admin/settings')
@ApiBearerAuth()
@Controller('admin/settings')
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class SettingsController {
  constructor(
    private readonly service: SettingsService,
    private readonly audit: AuditService,
    private readonly cacheBust: CacheBustService,
  ) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Patch()
  async update(@Body() dto: UpdateSettingsDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.update(dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.UPDATE,
      entity: 'SiteSettings', after: dto, summary: `Updated ${Object.keys(dto).join(', ')}`,
    });
    await this.cacheBust.bustAll();
    return res;
  }
}
