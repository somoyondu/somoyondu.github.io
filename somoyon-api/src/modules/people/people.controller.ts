import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { PaginationDto } from 'src/common/dto';
import { AuditAction, Role } from 'src/common/enums';
import { CacheBustService } from 'src/common/services';
import { AuditService } from '../audit/audit.service';
import { CreatePersonDto, MergePeopleDto, UpdatePersonDto } from './dto/person.dto';
import { PeopleService } from './people.service';

@ApiTags('admin/people')
@ApiBearerAuth()
@Controller('admin/people')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
export class PeopleController {
  constructor(
    private readonly service: PeopleService,
    private readonly audit: AuditService,
    private readonly cacheBust: CacheBustService,
  ) {}

  @Get() list(@Query() dto: PaginationDto) { return this.service.listWithPositionCount(dto); }
  @Get('duplicates') duplicates() { return this.service.duplicateCandidates(); }
  @Get(':id') get(@Param('id') id: string) { return this.service.findById(id); }
  @Get(':id/history') history(@Param('id') id: string) { return this.service.history(id); }

  @Post()
  async create(@Body() dto: CreatePersonDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.createOne(dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CREATE,
      entity: 'Person', entityId: String((res as any)._id), summary: dto.name,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Post('merge')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async merge(@Body() dto: MergePeopleDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.merge(dto);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.UPDATE,
      entity: 'Person', entityId: dto.keepId,
      summary: `Merged ${dto.mergeIds.length} duplicate(s) into ${dto.keepId}`,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePersonDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.updateOne(id, dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.UPDATE,
      entity: 'Person', entityId: id, after: dto,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const res = await this.service.removeSafely(id);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.DELETE,
      entity: 'Person', entityId: id,
    });
    await this.cacheBust.bustAll();
    return res;
  }
}
