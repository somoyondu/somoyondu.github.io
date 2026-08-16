import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { AuditAction, ContentStatus, Role } from 'src/common/enums';
import { CacheBustService } from 'src/common/services';
import { AuditService } from '../audit/audit.service';
import { CreatePostDto, PostQueryDto, UpdatePostDto } from './dto/post.dto';
import { PostsService } from './posts.service';

@ApiTags('admin/posts')
@ApiBearerAuth()
@Controller('admin/posts')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
export class PostsController {
  constructor(
    private readonly service: PostsService,
    private readonly audit: AuditService,
    private readonly cacheBust: CacheBustService,
  ) {}

  @Get() list(@Query() dto: PostQueryDto) { return this.service.listAdmin(dto); }
  @Get(':id') get(@Param('id') id: string) { return this.service.findById(id); }

  @HttpPost()
  async create(@Body() dto: CreatePostDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.createOne(dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CREATE,
      entity: 'Post', entityId: String((res as any)._id), summary: dto.title,
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
      entity: 'Post', entityId: id, summary: `Status → ${status ?? ContentStatus.PUBLISHED}`,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @CurrentUser() user: JwtUser) {
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
      entity: 'Post', entityId: id,
    });
    await this.cacheBust.bustAll();
    return res;
  }
}
