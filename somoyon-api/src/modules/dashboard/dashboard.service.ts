import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContentStatus } from 'src/common/enums';
import {
  Advisor, Committee, Event, GalleryAlbum, Person, Position, Post,
} from 'src/database/schemas';
import { AuditService } from '../audit/audit.service';
import { ContactService } from '../contact/contact.service';
import { GalleryService } from '../gallery/gallery.service';
import { MediaService } from '../media/media.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Committee.name) private readonly committees: Model<Committee>,
    @InjectModel(Position.name) private readonly positions: Model<Position>,
    @InjectModel(Person.name) private readonly people: Model<Person>,
    @InjectModel(Advisor.name) private readonly advisors: Model<Advisor>,
    @InjectModel(GalleryAlbum.name) private readonly albums: Model<GalleryAlbum>,
    @InjectModel(Event.name) private readonly events: Model<Event>,
    @InjectModel(Post.name) private readonly posts: Model<Post>,
    private readonly gallery: GalleryService,
    private readonly media: MediaService,
    private readonly users: UsersService,
    private readonly contact: ContactService,
    private readonly audit: AuditService,
  ) {}

  async stats() {
    const [
      committees, draftCommittees, positions, people, advisors,
      albums, photos, events, upcomingEvents, posts, draftPosts,
      mediaStats, users, unreadMessages, recent, byYear,
    ] = await Promise.all([
      this.committees.countDocuments(),
      this.committees.countDocuments({ status: ContentStatus.DRAFT }),
      this.positions.countDocuments(),
      this.people.countDocuments(),
      this.advisors.countDocuments({ isActive: true }),
      this.albums.countDocuments(),
      this.gallery.countItems(),
      this.events.countDocuments(),
      this.events.countDocuments({ startAt: { $gte: new Date() }, status: ContentStatus.PUBLISHED }),
      this.posts.countDocuments(),
      this.posts.countDocuments({ status: ContentStatus.DRAFT }),
      this.media.stats(),
      this.users.countAll(),
      this.contact.unreadCount(),
      this.audit.recentActivity(12),
      this.positions.aggregate([
        { $lookup: { from: 'committees', localField: 'committee', foreignField: '_id', as: 'c' } },
        { $unwind: '$c' },
        { $group: { _id: '$c.year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      counts: {
        committees, draftCommittees, positions, people, advisors,
        albums, photos, events, upcomingEvents, posts, draftPosts,
        media: mediaStats.count, mediaBytes: mediaStats.totalBytes,
        users, unreadMessages,
      },
      membersByYear: byYear.map((r: any) => ({ year: r._id, count: r.count })),
      recentActivity: recent,
    };
  }
}
