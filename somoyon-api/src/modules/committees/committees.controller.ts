import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { PaginationDto, ReorderDto } from 'src/common/dto';
import { AuditAction, ContentStatus, PositionGroup, Role } from 'src/common/enums';
import { CacheBustService } from 'src/common/services';
import { AuditService } from '../audit/audit.service';
import { CommitteesService } from './committees.service';
import {
  CloneCommitteeDto, CreateCommitteeDto, CreatePositionDto, UpdateCommitteeDto, UpdatePositionDto,
} from './dto/committee.dto';

@ApiTags('admin/committees')
@ApiBearerAuth()
@Controller('admin/committees')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
export class CommitteesController {
  constructor(
    private readonly service: CommitteesService,
    private readonly audit: AuditService,
    private readonly cacheBust: CacheBustService,
  ) {}

  @Get() list(@Query() dto: PaginationDto) { return this.service.paginate(dto); }
  @Get('summary') summary() { return this.service.summary(); }
  @Get(':id') get(@Param('id') id: string) { return this.service.findById(id); }

  @Get(':id/positions')
  positions(@Param('id') id: string, @Query('group') group?: PositionGroup) {
    return this.service.listPositions(id, group);
  }

  @Get(':id/positions/grouped')
  grouped(@Param('id') id: string) {
    return this.service.positionsGrouped(id);
  }

  @Post()
  async create(@Body() dto: CreateCommitteeDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.createOne(dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CREATE,
      entity: 'Committee', entityId: String((res as any)._id), summary: `Created committee ${dto.year}`,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Post('clone')
  @ApiOperation({ summary: 'Duplicate a year into a new DRAFT committee' })
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async clone(@Body() dto: CloneCommitteeDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.clone(dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CLONE, entity: 'Committee',
      entityId: String((res.committee as any)._id),
      summary: `Cloned ${dto.sourceYear} → ${dto.targetYear} (${res.positionsCopied} positions)`,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Post(':id/positions')
  async addPosition(
    @Param('id') id: string,
    @Body() dto: CreatePositionDto,
    @CurrentUser() user: JwtUser,
  ) {
    const res = await this.service.addPosition(id, dto, user.sub);
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch(':id/positions/reorder')
  async reorderPositions(@Param('id') _id: string, @Body() dto: ReorderDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.reorderPositions(dto.items);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.REORDER,
      entity: 'Position', summary: `Reordered ${dto.items.length} positions`,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch('positions/:positionId')
  async updatePosition(
    @Param('positionId') positionId: string,
    @Body() dto: UpdatePositionDto,
    @CurrentUser() user: JwtUser,
  ) {
    const res = await this.service.updatePosition(positionId, dto, user.sub);
    await this.cacheBust.bustAll();
    return res;
  }

  @Delete('positions/:positionId')
  async removePosition(@Param('positionId') positionId: string, @CurrentUser() user: JwtUser) {
    const res = await this.service.removePosition(positionId);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.DELETE,
      entity: 'Position', entityId: positionId,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch(':id/publish')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async publish(
    @Param('id') id: string,
    @Body('status') status: ContentStatus,
    @CurrentUser() user: JwtUser,
  ) {
    const res = await this.service.setStatus(id, status ?? ContentStatus.PUBLISHED, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.PUBLISH,
      entity: 'Committee', entityId: id, summary: `Status → ${status ?? ContentStatus.PUBLISHED}`,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCommitteeDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.updateOne(id, dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.UPDATE,
      entity: 'Committee', entityId: id, after: dto,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const res = await this.service.removeWithPositions(id);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.DELETE,
      entity: 'Committee', entityId: id,
    });
    await this.cacheBust.bustAll();
    return res;
  }
}
