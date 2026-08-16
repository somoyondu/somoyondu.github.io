import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('mail.host');
    const user = this.config.get<string>('mail.user');
    if (host && user) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('mail.port'),
        secure: this.config.get<number>('mail.port') === 465,
        auth: { user, pass: this.config.get<string>('mail.pass') },
      });
    } else {
      this.logger.warn('SMTP not configured — emails will be logged instead of sent');
    }
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`[MAIL:DEV] to=${to} subject=${subject}\n${html}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('mail.from'),
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send mail to ${to}: ${(err as Error).message}`);
    }
  }

  async sendPasswordReset(to: string, name: string, token: string) {
    const base = this.config.get<string[]>('corsOrigins')?.[0] ?? 'http://localhost:5174';
    const link = `${base}/reset-password?token=${token}`;
    await this.send(
      to,
      'সময়ন CMS — পাসওয়ার্ড রিসেট',
      `<div style="font-family:system-ui,sans-serif;line-height:1.7">
        <h2>পাসওয়ার্ড রিসেট</h2>
        <p>আসসালামু আলাইকুম ${name},</p>
        <p>আপনার সময়ন CMS অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে নিচের লিংকে ক্লিক করুন। লিংকটি ১ ঘণ্টা পর্যন্ত সচল থাকবে।</p>
        <p><a href="${link}" style="background:#1D0061;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">পাসওয়ার্ড রিসেট করুন</a></p>
        <p style="color:#666;font-size:13px">আপনি যদি এই অনুরোধ না করে থাকেন, ইমেইলটি উপেক্ষা করুন।</p>
      </div>`,
    );
  }

  async sendContactNotification(payload: {
    name: string; email: string; phone?: string; subject: string; message: string;
  }) {
    const to = this.config.get<string>('mail.contactNotifyTo');
    if (!to) return;
    await this.send(
      to,
      `নতুন বার্তা: ${payload.subject}`,
      `<div style="font-family:system-ui,sans-serif;line-height:1.7">
        <h3>ওয়েবসাইট থেকে নতুন বার্তা</h3>
        <p><b>নাম:</b> ${payload.name}<br/>
        <b>ইমেইল:</b> ${payload.email}<br/>
        <b>মোবাইল:</b> ${payload.phone ?? '-'}<br/>
        <b>বিষয়:</b> ${payload.subject}</p>
        <hr/>
        <p>${payload.message.replace(/\n/g, '<br/>')}</p>
      </div>`,
    );
  }
}
