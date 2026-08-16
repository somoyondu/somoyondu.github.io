import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { PaginationDto, ReorderDto } from 'src/common/dto';
import { AuditAction, Role } from 'src/common/enums';
import { CacheBustService } from 'src/common/services';
import { AuditService } from '../audit/audit.service';
import {
  BulkAddItemsDto, CreateAlbumDto, CreateGalleryItemDto, UpdateAlbumDto, UpdateGalleryItemDto,
} from './dto/gallery.dto';
import { GalleryService } from './gallery.service';

@ApiTags('admin/gallery')
@ApiBearerAuth()
@Controller('admin/gallery')
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR)
export class GalleryController {
  constructor(
    private readonly service: GalleryService,
    private readonly audit: AuditService,
    private readonly cacheBust: CacheBustService,
  ) {}

  @Get('albums') albums(@Query() dto: PaginationDto) {
    return dto.q ? this.service.paginate(dto) : this.service.albumsWithCounts();
  }

  @Get('albums/:id') album(@Param('id') id: string) { return this.service.findById(id); }
  @Get('albums/:id/items') items(@Param('id') id: string) { return this.service.listItems(id); }

  @Post('albums')
  async createAlbum(@Body() dto: CreateAlbumDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.createAlbum(dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CREATE,
      entity: 'GalleryAlbum', entityId: String((res as any)._id), summary: dto.title,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Post('albums/:id/items')
  async addItem(@Param('id') id: string, @Body() dto: CreateGalleryItemDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.addItem(id, dto, user.sub);
    await this.cacheBust.bustAll();
    return res;
  }

  @Post('albums/:id/items/bulk')
  async bulkAdd(@Param('id') id: string, @Body() dto: BulkAddItemsDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.bulkAddItems(id, dto, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CREATE,
      entity: 'GalleryItem', summary: `Added ${res.added} photos to album ${id}`,
    });
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch('albums/reorder')
  async reorderAlbums(@Body() dto: ReorderDto) {
    const res = await this.service.reorder(dto.items);
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch('items/reorder')
  async reorderItems(@Body() dto: ReorderDto) {
    const res = await this.service.reorderItems(dto.items);
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch('albums/:id')
  async updateAlbum(@Param('id') id: string, @Body() dto: UpdateAlbumDto, @CurrentUser() user: JwtUser) {
    const res = await this.service.updateAlbum(id, dto, user.sub);
    await this.cacheBust.bustAll();
    return res;
  }

  @Patch('items/:itemId')
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateGalleryItemDto,
    @CurrentUser() user: JwtUser,
  ) {
    const res = await this.service.updateItem(itemId, dto, user.sub);
    await this.cacheBust.bustAll();
    return res;
  }

  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string) {
    const res = await this.service.removeItem(itemId);
    await this.cacheBust.bustAll();
    return res;
  }

  @Delete('albums/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async removeAlbum(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const res = await this.service.removeAlbum(id);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.DELETE,
      entity: 'GalleryAlbum', entityId: id,
    });
    await this.cacheBust.bustAll();
    return res;
  }
}
