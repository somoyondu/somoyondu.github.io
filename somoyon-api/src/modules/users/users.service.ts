import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { PaginationDto, buildMeta } from 'src/common/dto';
import { Role } from 'src/common/enums';
import { User, UserDocument } from 'src/database/schemas';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';

const PUBLIC_FIELDS = '-passwordHash -refreshTokenHash -passwordResetTokenHash -passwordResetExpiresAt -failedLoginAttempts -lockedUntil';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  hash(plain: string) {
    return argon2.hash(plain, { type: argon2.argon2id });
  }

  verify(hash: string, plain: string) {
    return argon2.verify(hash, plain);
  }

  async paginate(dto: PaginationDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const filter: any = dto.q
      ? { $or: [{ name: new RegExp(dto.q, 'i') }, { email: new RegExp(dto.q, 'i') }] }
      : {};
    const [items, total] = await Promise.all([
      this.model.find(filter).select(PUBLIC_FIELDS).sort(dto.sort || '-createdAt')
        .skip((page - 1) * limit).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  }

  async findById(id: string) {
    const user = await this.model.findById(id).select(PUBLIC_FIELDS).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Includes the secret fields — only for auth flows. */
  findByEmailWithSecrets(email: string) {
    return this.model
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash +refreshTokenHash +failedLoginAttempts +lockedUntil')
      .exec();
  }

  findByIdWithSecrets(id: string) {
    return this.model.findById(id).select('+passwordHash +refreshTokenHash').exec();
  }

  async create(dto: CreateUserDto, actorRole?: Role) {
    if (dto.role === Role.SUPER_ADMIN && actorRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only a SUPER_ADMIN can create another SUPER_ADMIN');
    }
    const exists = await this.model.exists({ email: dto.email.toLowerCase() });
    if (exists) throw new ConflictException('Email already registered');

    const created = await this.model.create({
      email: dto.email.toLowerCase(),
      passwordHash: await this.hash(dto.password),
      name: dto.name,
      nameBn: dto.nameBn,
      role: dto.role,
      isActive: dto.isActive ?? true,
      mustChangePassword: true,
    });
    return this.findById(String(created._id));
  }

  async update(id: string, dto: UpdateUserDto, actorId: string, actorRole: Role) {
    const target = await this.model.findById(id);
    if (!target) throw new NotFoundException('User not found');

    if (target.role === Role.SUPER_ADMIN && actorRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot modify a SUPER_ADMIN');
    }
    if (dto.role === Role.SUPER_ADMIN && actorRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only a SUPER_ADMIN can grant SUPER_ADMIN');
    }
    if (id === actorId && dto.isActive === false) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const patch: any = { ...dto };
    delete patch.password;
    if (dto.password) patch.passwordHash = await this.hash(dto.password);
    if (dto.email) patch.email = dto.email.toLowerCase();

    await this.model.findByIdAndUpdate(id, patch, { runValidators: true });
    return this.findById(id);
  }

  async remove(id: string, actorId: string) {
    if (id === actorId) throw new BadRequestException('You cannot delete your own account');
    const target = await this.model.findById(id);
    if (!target) throw new NotFoundException('User not found');
    if (target.role === Role.SUPER_ADMIN) {
      const remaining = await this.model.countDocuments({ role: Role.SUPER_ADMIN, isActive: true });
      if (remaining <= 1) throw new BadRequestException('Cannot delete the last SUPER_ADMIN');
    }
    await this.model.findByIdAndDelete(id);
    return { id, deleted: true as const };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.findByIdWithSecrets(userId);
    if (!user) throw new NotFoundException('User not found');
    const ok = await this.verify(user.passwordHash, dto.currentPassword);
    if (!ok) throw new BadRequestException('Current password is incorrect');
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must differ from the current one');
    }
    user.passwordHash = await this.hash(dto.newPassword);
    user.mustChangePassword = false;
    user.refreshTokenHash = undefined;
    await user.save();
    return { success: true as const };
  }

  findByResetTokenHash(hash: string) {
    return this.model
      .findOne({ passwordResetTokenHash: hash })
      .select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt +refreshTokenHash')
      .exec();
  }

  countAll() {
    return this.model.countDocuments();
  }
}
