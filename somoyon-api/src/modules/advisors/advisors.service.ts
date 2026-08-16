import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseCrudService } from 'src/common/services';
import { Advisor, AdvisorDocument } from 'src/database/schemas';

@Injectable()
export class AdvisorsService extends BaseCrudService<AdvisorDocument> {
  constructor(@InjectModel(Advisor.name) model: Model<AdvisorDocument>) {
    super(model, {
      searchFields: ['name', 'nameEn', 'designation', 'organization'],
      defaultSort: 'displayOrder',
      populate: ['photo'],
    });
  }

  listPublic() {
    return this.findAll({ isActive: true }, 'displayOrder');
  }

  async nextOrder() {
    const last = await this.model.findOne().sort('-displayOrder').lean();
    return ((last as any)?.displayOrder ?? -10) + 10;
  }
}
