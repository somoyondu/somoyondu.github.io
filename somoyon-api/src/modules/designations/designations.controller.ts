import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { PaginationDto, ReorderDto } from 'src/common/dto';
import { AuditAction, Role } from 'src/common/enums';
import { CacheBustService } from 'src/common/services';
import { AuditService } from '../audit/audit.service';
import { DesignationsService } from './designations.service';
import { CreateDesignationDto, UpdateDesignationDto } from './dto/designation.dto';

@ApiTags('admin/designations')
@ApiBearerAuth()
@Controller('admin/designations')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
export class DesignationsController {
  constructor(
    private readonly service: DesignationsService,
    private readonly audit: AuditService,
    private readonly cacheBust: CacheBustService,
  ) {}

  @Get() list(@Query() dto: PaginationDto) { return this.service.paginate(dto); }
  @Get('all') all() { return this.service.listGrouped(); }
  @Get(':id') get(@Param('id') id: string) { return this.service.findById(id); }

  @Post()
  async create(@Body() dto: CreateDesignationDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.createOne(dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CREATE,
      entity: 'Designation', entityId: String((res as any)._id), summary: dto.nameBn,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch('reorder')
  async reorder(@Body() dto: ReorderDto) {
    const res = await this.service.reorder(dto.items);
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDesignationDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.updateOne(id, dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.UPDATE,
      entity: 'Designation', entityId: id, after: dto,
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
      entity: 'Designation', entityId: id,
    });
    await this.cacheBust.bustAll();
    return res;
  }
}
