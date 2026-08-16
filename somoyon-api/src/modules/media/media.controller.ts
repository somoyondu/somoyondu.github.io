import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { AuditAction, Role } from 'src/common/enums';
import { CacheBustService } from 'src/common/services';
import { AuditService } from '../audit/audit.service';
import { MediaQueryDto, RegisterMediaDto, SignUploadDto, UpdateMediaDto } from './dto/media.dto';
import { MediaService } from './media.service';

@ApiTags('admin/media')
@ApiBearerAuth()
@Controller('admin/media')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
export class MediaController {
  constructor(
    private readonly service: MediaService,
    private readonly audit: AuditService,
    private readonly cacheBust: CacheBustService,
  ) {}

  @Post('signature')
  sign(@Body() dto: SignUploadDto) {
    return this.service.sign(dto);
  }

  @Post()
  async register(@Body() dto: RegisterMediaDto, @CurrentUser() user: JwtUser) {
    const media = await this.service.register(dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CREATE,
      entity: 'Media', entityId: String((media as any)._id), summary: `Uploaded ${dto.publicId}`,
    });
    return media;
  }

  @Get()
  list(@Query() dto: MediaQueryDto) {
    return this.service.list(dto);
  }

  @Get('folders')
  folders() {
    return this.service.folders();
  }

  @Get('orphans')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  orphans() {
    return this.service.findOrphans();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/usage')
  usage(@Param('id') id: string) {
    return this.service.usage(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMediaDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.updateMeta(id, dto, user.sub);
    await this.cacheBust.bustAll();
    return res;
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @Query('force') force: string,
    @CurrentUser() user: JwtUser,
  ) {
    const res = await this.service.removeWithCloud(id, force === 'true');
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.DELETE,
      entity: 'Media', entityId: id, summary: `Deleted media ${id}`,
    });
    await this.cacheBust.bustAll();
    return res;
  }
}
