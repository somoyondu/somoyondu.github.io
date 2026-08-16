import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtUser, Roles } from 'src/common/decorators';
import { PaginationDto } from 'src/common/dto';
import { AuditAction, Role } from 'src/common/enums';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('admin/users')
@ApiBearerAuth()
@Controller('admin/users')
@Roles(Role.SUPER_ADMIN)
export class UsersController {
  constructor(
    private readonly service: UsersService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  list(@Query() dto: PaginationDto) {
    return this.service.paginate(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: JwtUser) {
    const created = await this.service.create(dto, user.role as Role);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.CREATE,
      entity: 'User', entityId: String((created as any)._id),
      summary: `Created ${dto.role} ${dto.email}`,
    });
    return created;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: JwtUser) {
    const updated = await this.service.update(id, dto, user.sub, user.role as Role);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.UPDATE,
      entity: 'User', entityId: id, after: dto, summary: `Updated user ${id}`,
    });
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const res = await this.service.remove(id, user.sub);
    await this.audit.record({
      actor: user.sub, actorEmail: user.email, action: AuditAction.DELETE,
      entity: 'User', entityId: id, summary: `Deleted user ${id}`,
    });
    return res;
  }
}
