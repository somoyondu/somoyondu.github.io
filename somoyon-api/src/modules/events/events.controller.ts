import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { AuditAction, ContentStatus, Role } from 'src/common/enums';
import { CacheBustService } from 'src/common/services';
import { AuditService } from '../audit/audit.service';
import { CreateEventDto, EventQueryDto, UpdateEventDto } from './dto/event.dto';
import { EventsService } from './events.service';

@ApiTags('admin/events')
@ApiBearerAuth()
@Controller('admin/events')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
export class EventsController {
  constructor(
    private readonly service: EventsService,
    private readonly audit: AuditService,
    private readonly cacheBust: CacheBustService,
  ) {}

  @Get() list(@Query() dto: EventQueryDto) { return this.service.listAdmin(dto); }
  @Get(':id') get(@Param('id') id: string) { return this.service.findById(id); }

  @Post()
  async create(@Body() dto: CreateEventDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.createOne(dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CREATE,
      entity: 'Event', entityId: String((res as any)._id), summary: dto.title,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch(':id/publish')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async publish(@Param('id') id: string, @Body('status') status: ContentStatus, @CurrentUser() user: JwtUser) {
    const res = await this.service.setStatus(id, status ?? ContentStatus.PUBLISHED, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.PUBLISH,
      entity: 'Event', entityId: id, summary: `Status → ${status ?? ContentStatus.PUBLISHED}`,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.updateOne(id, dto, user.sub);
    await this.cacheBust.bustAll();
    return res;
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const res = await this.service.remove(id);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.DELETE,
      entity: 'Event', entityId: id,
    });
    await this.cacheBust.bustAll();
    return res;
  }
}
