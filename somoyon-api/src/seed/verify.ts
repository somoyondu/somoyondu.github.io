/**
 * Step 5: migration gate. Compares what is now in MongoDB against the extracted
 * legacy JSON. Nothing ships until this passes for every year.
 */
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import mongoose from 'mongoose';
import * as path from 'path';
import {
  AdvisorSchema, CommitteeSchema, GalleryItemSchema, MediaSchema, PersonSchema, PositionSchema,
} from '../database/schemas';
import { DATA_DIR, YEARS } from './legacy.config';

dotenv.config();

let failures = 0;
let checks = 0;

function assert(condition: boolean, message: string) {
  checks++;
  if (condition) {
    console.log(`  ok   ${message}`);
  } else {
    failures++;
    console.error(`  FAIL ${message}`);
  }
}

function read<T>(file: string, fallback: T): T {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const Committee = mongoose.model('Committee', CommitteeSchema);
  const Position = mongoose.model('Position', PositionSchema);
  const Person = mongoose.model('Person', PersonSchema);
  const Advisor = mongoose.model('Advisor', AdvisorSchema);
  const Media = mongoose.model('Media', MediaSchema);
  const GalleryItem = mongoose.model('GalleryItem', GalleryItemSchema);

  console.log('\n== Committee position counts ==');
  for (const year of YEARS) {
    const legacy = read<any>(path.join(DATA_DIR, `${year}.json`), null);
    if (!legacy) continue;
    const committee = await Committee.findOne({ year });
    assert(!!committee, `${year}: committee document exists`);
    if (!committee) continue;

    for (const [group, rows] of Object.entries<any[]>(legacy.groups)) {
      const count = await Position.countDocuments({ committee: committee._id, group });
      const expected = rows.length;
      // The founding committee adds 6 extra TOP_LEADER rows to 2023.
      const tolerance = year === 2023 && group === 'TOP_LEADER' ? 6 : 0;
      assert(
        count === expected || count === expected + tolerance,
        `${year} ${group}: ${count} positions (legacy ${expected}${tolerance ? ` +${tolerance} founders` : ''})`,
      );
    }
  }

  console.log('\n== Referential integrity ==');
  const orphanDesignation = await Position.countDocuments({ designation: null });
  assert(orphanDesignation === 0, `no position has a null designation (found ${orphanDesignation})`);

  const orphanPerson = await Position.countDocuments({ person: null });
  assert(orphanPerson === 0, `no position has a null person (found ${orphanPerson})`);

  const positions = await Position.find()
    .populate('person', 'photo name')
    .populate('photoOverride')
    .lean();
  const missingPhoto = positions.filter(
    (p: any) => !p.photoOverride && !p.person?.photo,
  );
  assert(
    missingPhoto.length === 0,
    `every position resolves a photo (${missingPhoto.length} missing: ${missingPhoto
      .slice(0, 5)
      .map((p: any) => p.person?.name)
      .join(', ')})`,
  );

  console.log('\n== Deduplication ==');
  const personCount = await Person.countDocuments();
  const positionCount = await Position.countDocuments();
  assert(
    personCount < positionCount,
    `people (${personCount}) < positions (${positionCount}) — duplication was collapsed`,
  );

  const dupes = await Person.aggregate([
    { $group: { _id: '$normalizedName', n: { $sum: 1 } } },
    { $match: { n: { $gt: 1 } } },
  ]);
  assert(dupes.length === 0, `no duplicate normalizedName remains (found ${dupes.length})`);

  console.log('\n== Advisors & gallery ==');
  const legacyAdvisors = read<any[]>(path.join(DATA_DIR, 'advisors.json'), []);
  const advisorCount = await Advisor.countDocuments();
  assert(advisorCount === legacyAdvisors.length, `advisors: ${advisorCount} (legacy ${legacyAdvisors.length})`);

  const legacyGallery = read<any[]>(path.join(DATA_DIR, 'gallery.json'), []);
  const galleryCount = await GalleryItem.countDocuments();
  assert(galleryCount === legacyGallery.length, `gallery items: ${galleryCount} (legacy ${legacyGallery.length})`);

  console.log('\n== Media ==');
  const legacyImages = read<string[]>(path.join(DATA_DIR, 'images.json'), []);
  const mediaCount = await Media.countDocuments();
  assert(
    mediaCount >= legacyImages.length * 0.95,
    `media documents: ${mediaCount} (legacy referenced ${legacyImages.length})`,
  );

  const badUrls = await Media.countDocuments({ secureUrl: { $not: /^https:\/\/res\.cloudinary\.com/ } });
  assert(badUrls === 0, `all media point at Cloudinary (${badUrls} bad)`);

  console.log(`\n${checks - failures}/${checks} checks passed`);
  await mongoose.disconnect();
  process.exit(failures > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
