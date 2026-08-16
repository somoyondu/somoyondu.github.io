import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';
import { ContactService } from './contact.service';
import { ContactQueryDto, UpdateContactDto } from './dto/contact.dto';

@ApiTags('admin/contact')
@ApiBearerAuth()
@Controller('admin/contact')
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class ContactController {
  constructor(private readonly service: ContactService) {}

  @Get() list(@Query() dto: ContactQueryDto) { return this.service.listAdmin(dto); }
  @Get('unread-count') unread() { return this.service.unreadCount().then((count) => ({ count })); }
  @Get(':id') get(@Param('id') id: string) { return this.service.findById(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContactDto, @CurrentUser() user: JwtUser) {
    return this.service.updateStatus(id, dto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
