/**
 * Step 3: import the extracted JSON into MongoDB.
 *
 * Order: designations → media → people (deduplicated) → committees →
 * positions → advisors → gallery → siteSettings.
 *
 * Idempotent: re-running upserts rather than duplicating.
 */
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import mongoose, { Types } from 'mongoose';
import * as path from 'path';
import {
  AdvisorSchema, CommitteeSchema, DesignationSchema, GalleryAlbumSchema, GalleryItemSchema,
  MediaSchema, PersonSchema, PositionSchema, SiteSettingsSchema,
} from '../database/schemas';
import { normalizeBnName, toSlug } from '../common/utils/slugify.util';
import { DATA_DIR, DESIGNATION_RANKS, MEDIA_MAP, REVIEW_CSV, YEARS } from './legacy.config';
import { DEFAULT_SETTINGS } from './default-settings';

dotenv.config();

type LegacyEntry = { name: string; designation: string; image: string };

function read<T>(file: string, fallback: T): T {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
}

function toBengaliDigits(n: number | string) {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => map[Number(d)]);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const Designation = mongoose.model('Designation', DesignationSchema);
  const Media = mongoose.model('Media', MediaSchema);
  const Person = mongoose.model('Person', PersonSchema);
  const Committee = mongoose.model('Committee', CommitteeSchema);
  const Position = mongoose.model('Position', PositionSchema);
  const Advisor = mongoose.model('Advisor', AdvisorSchema);
  const GalleryAlbum = mongoose.model('GalleryAlbum', GalleryAlbumSchema);
  const GalleryItem = mongoose.model('GalleryItem', GalleryItemSchema);
  const SiteSettings = mongoose.model('SiteSettings', SiteSettingsSchema);

  const mediaMap: Record<string, any> = read(MEDIA_MAP, {});
  const foundingRows: LegacyEntry[] = read(path.join(DATA_DIR, 'founding.json'), []);
  const advisorRows: LegacyEntry[] = read(path.join(DATA_DIR, 'advisors.json'), []);
  const galleryRows: any[] = read(path.join(DATA_DIR, 'gallery.json'), []);

  // ---------- 1. media ----------
  const mediaIdByPath = new Map<string, Types.ObjectId>();
  for (const [legacyPath, entry] of Object.entries(mediaMap)) {
    const doc = await Media.findOneAndUpdate(
      { publicId: entry.publicId },
      {
        $set: {
          publicId: entry.publicId,
          secureUrl: entry.secureUrl,
          url: entry.url,
          format: entry.format,
          width: entry.width,
          height: entry.height,
          bytes: entry.bytes,
          folder: entry.folder,
          resourceType: 'image',
          tags: ['legacy-migration'],
        },
      },
      { upsert: true, new: true },
    );
    mediaIdByPath.set(legacyPath, doc._id as Types.ObjectId);
  }
  console.log(`  media: ${mediaIdByPath.size}`);

  // ---------- 2. designations ----------
  const designationCache = new Map<string, any>();
  async function designationFor(nameBn: string, group: string) {
    const key = `${nameBn}|${group}`;
    if (designationCache.has(key)) return designationCache.get(key);
    const doc = await Designation.findOneAndUpdate(
      { nameBn: nameBn.trim() },
      {
        $setOnInsert: {
          slug: toSlug(nameBn, 'designation'),
          nameBn: nameBn.trim(),
          group,
          rank: DESIGNATION_RANKS[nameBn.trim()] ?? 100,
        },
      },
      { upsert: true, new: true },
    );
    designationCache.set(key, doc);
    return doc;
  }

  // ---------- 3. people (deduplicated) ----------
  const peopleByKey = new Map<string, any>();
  const reviewRows: string[] = ['normalizedName,names,imagePaths,action'];
  const nameVariants = new Map<string, Set<string>>();

  async function personFor(entry: LegacyEntry) {
    const normalized = normalizeBnName(entry.name);
    const imageBase = (entry.image || '').split('/').pop()?.replace(/\.[^/.]+$/, '')?.toLowerCase() ?? '';

    // Primary key: normalised Bengali name. Image basename is recorded so
    // ambiguous matches can be reviewed in seed/review-merges.csv.
    const key = normalized || `img:${imageBase}`;
    if (!nameVariants.has(key)) nameVariants.set(key, new Set());
    nameVariants.get(key)!.add(`${entry.name}::${entry.image}`);

    if (peopleByKey.has(key)) {
      const existing = peopleByKey.get(key);
      // Backfill a photo if this occurrence has one and the record does not.
      if (!existing.photo && entry.image && mediaIdByPath.has(entry.image)) {
        existing.photo = mediaIdByPath.get(entry.image);
        await existing.save();
      }
      return existing;
    }

    let slugBase = toSlug(imageBase || entry.name, 'person');
    let slug = slugBase;
    let n = 1;
    while (await Person.exists({ slug, normalizedName: { $ne: normalized } })) {
      slug = `${slugBase}-${++n}`;
    }

    const doc = await Person.findOneAndUpdate(
      { normalizedName: normalized || slug },
      {
        $setOnInsert: {
          slug,
          name: entry.name.trim(),
          normalizedName: normalized || slug,
          photo: entry.image ? mediaIdByPath.get(entry.image) : undefined,
          isPublic: false,
        },
      },
      { upsert: true, new: true },
    );
    peopleByKey.set(key, doc);
    return doc;
  }

  // ---------- 4. committees + positions ----------
  const importedCounts: Record<string, number> = {};

  for (const year of YEARS) {
    const data = read<any>(path.join(DATA_DIR, `${year}.json`), null);
    if (!data) {
      console.warn(`  ! no data file for ${year}, skipping`);
      continue;
    }
    const bnYear = toBengaliDigits(year);
    const committee = await Committee.findOneAndUpdate(
      { year },
      {
        $set: {
          title: `কার্যনির্বাহী পরিষদ ${bnYear}`,
          expandButtonText: `${bnYear} এর পূর্ণাঙ্গ কার্যনির্বাহী পরিষদ দেখুন`,
          collapseButtonText: `${bnYear} এর সংক্ষিপ্ত কমিটি দেখুন`,
          status: 'PUBLISHED',
          displayOrder: -year,
          isFounding: false,
        },
      },
      { upsert: true, new: true },
    );

    // Rebuild positions for this year so re-running is idempotent.
    await Position.deleteMany({ committee: committee._id });

    let count = 0;
    for (const [group, rows] of Object.entries<LegacyEntry[]>(data.groups)) {
      let order = 0;
      for (const row of rows) {
        const person = await personFor(row);
        const designation = await designationFor(row.designation, group);
        const photoOverride = row.image ? mediaIdByPath.get(row.image) : undefined;

        await Position.updateOne(
          { committee: committee._id, person: person._id, designation: designation._id },
          {
            $set: {
              group,
              displayOrder: (order += 10),
              isActive: true,
              photoOverride,
            },
          },
          { upsert: true },
        );
        count++;
      }
    }
    importedCounts[year] = count;
    console.log(`  committee ${year}: ${count} positions`);
  }

  // ---------- 5. founding committee ----------
  if (foundingRows.length) {
    const foundingCommittee = await Committee.findOneAndUpdate(
      { year: 2023 },
      { $set: { isFounding: true } },
      { upsert: true, new: true },
    );
    let order = 0;
    for (const row of foundingRows) {
      const person = await personFor(row);
      const designation = await designationFor(row.designation, 'TOP_LEADER');
      await Position.updateOne(
        { committee: foundingCommittee._id, person: person._id, designation: designation._id },
        {
          $set: {
            group: 'TOP_LEADER',
            displayOrder: (order += 1), // founders render before the 2023 board
            isActive: true,
            photoOverride: row.image ? mediaIdByPath.get(row.image) : undefined,
          },
        },
        { upsert: true },
      );
    }
    console.log(`  founding members: ${foundingRows.length}`);
  }

  // ---------- 6. advisors ----------
  let advisorOrder = 0;
  for (const row of advisorRows) {
    await Advisor.findOneAndUpdate(
      { name: row.name.trim() },
      {
        $set: {
          designation: row.designation,
          photo: row.image ? mediaIdByPath.get(row.image) : undefined,
          displayOrder: (advisorOrder += 10),
          isActive: true,
        },
      },
      { upsert: true },
    );
  }
  console.log(`  advisors: ${advisorRows.length}`);

  // ---------- 7. gallery ----------
  const albumsBySlug = new Map<string, any>();
  let albumOrder = 0;
  for (const row of galleryRows) {
    if (!albumsBySlug.has(row.albumSlug)) {
      const album = await GalleryAlbum.findOneAndUpdate(
        { slug: row.albumSlug },
        {
          $set: {
            title: row.albumTitle,
            titleBn: row.albumTitle,
            year: row.year ?? undefined,
            status: 'PUBLISHED',
            displayOrder: (albumOrder += 10),
          },
        },
        { upsert: true, new: true },
      );
      albumsBySlug.set(row.albumSlug, album);
    }
    const album = albumsBySlug.get(row.albumSlug);
    const mediaId = mediaIdByPath.get(row.file);
    if (!mediaId) continue;

    await GalleryItem.updateOne(
      { album: album._id, media: mediaId },
      { $set: { title: row.title, titleBn: row.title, isFeatured: true, displayOrder: albumOrder } },
      { upsert: true },
    );
    if (!album.coverImage) {
      album.coverImage = mediaId;
      await album.save();
    }
  }
  console.log(`  gallery: ${albumsBySlug.size} albums / ${galleryRows.length} photos`);

  // ---------- 8. site settings ----------
  const settingsPatch: any = { ...DEFAULT_SETTINGS, key: 'singleton' };
  const logo = mediaIdByPath.get('logo.png');
  const whiteLogo = mediaIdByPath.get('white-logo.png');
  const hero = mediaIdByPath.get('somoyon-bg.png');
  if (logo) settingsPatch.logo = logo;
  if (whiteLogo) settingsPatch.whiteLogo = whiteLogo;
  if (logo) settingsPatch.favicon = logo;
  if (hero) settingsPatch.heroBackground = hero;

  settingsPatch.donation.methods = settingsPatch.donation.methods.map((m: any) => {
    const mediaId = m.legacyIcon ? mediaIdByPath.get(m.legacyIcon) : undefined;
    const { legacyIcon, ...rest } = m;
    return { ...rest, logo: mediaId };
  });

  await SiteSettings.updateOne({ key: 'singleton' }, { $set: settingsPatch }, { upsert: true });
  console.log('  site settings: written');

  // ---------- review file for ambiguous merges ----------
  for (const [key, variants] of nameVariants) {
    if (variants.size > 1) {
      const names = [...variants].map((v) => v.split('::')[0]);
      const images = [...variants].map((v) => v.split('::')[1]);
      const unique = new Set(names);
      if (unique.size > 1 || new Set(images.map((i) => i?.split('/').pop())).size > 1) {
        reviewRows.push(`"${key}","${[...unique].join(' | ')}","${images.join(' | ')}",review`);
      }
    }
  }
  fs.writeFileSync(REVIEW_CSV, reviewRows.join('\n'));
  console.log(`\n  ${reviewRows.length - 1} person records need a manual duplicate review → ${REVIEW_CSV}`);

  console.log('\nImport complete:', importedCounts);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
