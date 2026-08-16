import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'crypto';
import { Model } from 'mongoose';
import { SubmissionStatus } from 'src/common/enums';
import { BaseCrudService } from 'src/common/services';
import { ContactSubmission, ContactSubmissionDocument } from 'src/database/schemas';
import { MailService } from '../mail/mail.service';
import { ContactQueryDto, CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService extends BaseCrudService<ContactSubmissionDocument> {
  constructor(
    @InjectModel(ContactSubmission.name) model: Model<ContactSubmissionDocument>,
    private readonly mail: MailService,
  ) {
    super(model, { searchFields: ['name', 'email', 'subject', 'message'], defaultSort: '-createdAt' });
  }

  async submit(dto: CreateContactDto, ip?: string, userAgent?: string) {
    // Honeypot filled -> silently accept and mark spam, so bots see success.
    const isSpam = Boolean(dto.website);

    await this.model.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      subject: dto.subject,
      message: dto.message,
      status: isSpam ? SubmissionStatus.SPAM : SubmissionStatus.NEW,
      ipHash: ip ? createHash('sha256').update(ip).digest('hex') : undefined,
      userAgent,
    } as any);

    if (!isSpam) {
      await this.mail.sendContactNotification(dto);
    }

    return { success: true as const, message: 'আপনার বার্তা পাঠানো হয়েছে। ধন্যবাদ!' };
  }

  listAdmin(dto: ContactQueryDto) {
    const filter: any = {};
    if (dto.status) filter.status = dto.status;
    return this.paginate(dto, filter);
  }

  updateStatus(id: string, dto: UpdateContactDto, userId?: string) {
    return this.update(id, dto as any, userId);
  }

  unreadCount() {
    return this.model.countDocuments({ status: SubmissionStatus.NEW });
  }
}
