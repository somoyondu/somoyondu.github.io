import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { PaginationDto, ReorderDto } from 'src/common/dto';
import { AuditAction, Role } from 'src/common/enums';
import { CacheBustService } from 'src/common/services';
import { AuditService } from '../audit/audit.service';
import { AdvisorsService } from './advisors.service';
import { CreateAdvisorDto, UpdateAdvisorDto } from './dto/advisor.dto';

@ApiTags('admin/advisors')
@ApiBearerAuth()
@Controller('admin/advisors')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
export class AdvisorsController {
  constructor(
    private readonly service: AdvisorsService,
    private readonly audit: AuditService,
    private readonly cacheBust: CacheBustService,
  ) {}

  @Get() list(@Query() dto: PaginationDto) { return this.service.paginate(dto); }
  @Get(':id') get(@Param('id') id: string) { return this.service.findById(id); }

  @Post()
  async create(@Body() dto: CreateAdvisorDto, @CurrentUser() user: JwtUser) {
    const displayOrder = dto.displayOrder ?? (await this.service.nextOrder());
    const res = await this.service.create({ ...dto, displayOrder } as any, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CREATE,
      entity: 'Advisor', entityId: String((res as any)._id), summary: dto.name,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch('reorder')
  async reorder(@Body() dto: ReorderDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.reorder(dto.items);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.REORDER, entity: 'Advisor',
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAdvisorDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.update(id, dto as any, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.UPDATE,
      entity: 'Advisor', entityId: id, after: dto,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const res = await this.service.remove(id);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.DELETE,
      entity: 'Advisor', entityId: id,
    });
    await this.cacheBust.bustAll();
    return res;
  }
}
