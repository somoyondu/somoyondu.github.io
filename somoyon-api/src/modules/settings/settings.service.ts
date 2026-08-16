import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SiteSettings, SiteSettingsDocument } from 'src/database/schemas';
import { UpdateSettingsDto } from './dto/settings.dto';

const POPULATE = ['logo', 'whiteLogo', 'favicon', 'heroBackground'];

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(SiteSettings.name) private readonly model: Model<SiteSettingsDocument>,
  ) {}

  /** Creates the singleton on first read so the API never 404s on settings. */
  async get() {
    let doc = await this.model.findOne({ key: 'singleton' }).populate(POPULATE).lean();
    if (!doc) {
      await this.model.create({ key: 'singleton' } as any);
      doc = await this.model.findOne({ key: 'singleton' }).populate(POPULATE).lean();
    }
    return doc;
  }

  async update(dto: UpdateSettingsDto, userId?: string) {
    await this.model.updateOne(
      { key: 'singleton' },
      { $set: { ...dto, updatedBy: userId } },
      { upsert: true },
    );
    return this.get();
  }
}
