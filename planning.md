# সময়ন (Somoyon) — Static Site → Full CMS Platform

**Migration plan: Vite React + NestJS API + MongoDB Atlas + Cloudinary**

--> Comment: I don't want to use React SPA for this project, instead, I want to use React (which is already implemented I need this same strcuture not SPA)

Version 1.0 · Owner: Md. Rakib Trofder · Last updated: 2026-08-15

---

## 1. Current State Audit

### 1.1 What exists today

| Aspect | Current |
|---|---|
| Framework | React 18 + Vite 4, JavaScript (no TypeScript) |
| Styling | Tailwind CSS 3 + `keep-react` preset |
| Routing | `react-router-dom` 
| Data | **Hardcoded** in `src/services/*.jsx` — plain JS functions returning arrays |
| Images | **Static files** in `public/` (~200 files, ~ committee-2026/, committee-members/, members/2024, members/2025, advisors/, gallery/) |
| Content language | Bengali (bn-BD), hardcoded in JSX |
| Hosting | Netlify + Renderer
| Backend | None |
| Auth | None |

### 1.2 Content domains discovered in the code

| Domain | Source file | Notes |
|---|---|---|
| Founding members (2023) | `FoundingMembersService.jsx` | 36 lines, flat list |
| Top leaders (সভাপতি/সা. সম্পাদক) | `TopLeadersService.jsx` | keyed by year |
| Top executives (সহ-সভাপতি, যুগ্ম-সা. সম্পাদক) | `TopExecutivesService.jsx` | keyed by year (2023–2026) |
| Organizing executives (সাংগঠনিক সম্পাদক) | `OrganizingExecutivesService.jsx` | keyed by year |
| Officials (দাপ্তরিক: কোষাধ্যক্ষ, দপ্তর, প্রচার, ক্রীড়া, আইটি, সাংস্কৃতিক…) | `OfficialsService.jsx` | 413 lines, largest |
| Executive members (কার্যনির্বাহী সদস্য) | `ExecutiveMembersService.jsx` | keyed by year |
| Advisors (উপদেষ্টামণ্ডলী) | `AdvisorsService.jsx` | flat list, no year |
| Gallery | `features/Gallery.jsx` | `import.meta.glob` over `public/gallery/*` — title derived from filename |
| About text | `components/AboutUs.jsx` | hardcoded paragraph |
| Founding blurb / advisory blurb | `FoundingMembers.jsx`, `AdvisoryCommittee.jsx` | hardcoded |
| Donation (bKash / Nagad) | `Donation/DonationCard.jsx`, `InfoCard.jsx` | hardcoded numbers |
| Contact & socials | `Contact.jsx`, `SocialMedia.jsx`, `Icon.jsx` | hardcoded email/phone/FB |
| Events | `features/Events.jsx` | hardcoded, currently **commented out** of `MainSection` |

### 1.3 Structural problems to fix during migration

1. **Every yearly committee update requires a code deploy.** This is the core pain the CMS solves.
2. **`ExecutiveCommitteeSection.jsx` hardcodes 2023–2026** — adding 2027 means editing a file. Must become a query.
3. **Duplicate `id="executives"`** on `FoundingMembers` and `ExecutiveCommittee` — breaks anchor nav and a11y.
4. **Image paths are strings** relative to `public/` with inconsistent casing (`.JPG`, `.jpeg`, `.png`) and duplicated people across years (e.g. `nazmul` appears in 3 folders).
5. **No image optimization** — full-size JPEGs served raw; Cloudinary fixes this.
6. **No SEO/meta** — single `<title>সময়ন</title>`, no OG tags, no sitemap.
7. **`.DS_Store` files committed** — clean up + `.gitignore`.
8. **No TypeScript, no tests, no CI.**

---

## 2. Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Public frontend | **Keep Vite React** | Minimal churn; existing components reused. Content is fetched at runtime from the API. |
| Admin panel | **Separate Vite React app** (`somoyon-admin`) | Keeps the public bundle small; admin needs heavy deps (tables, rich text, uploaders) that public visitors should never download. |
| Public access | **No login required** | Anonymous read of all published content. Auth guards write endpoints only. |
| Admins | **Multiple, with roles** | SUPER_ADMIN / ADMIN / EDITOR. Full audit log. |
| Backend | **NestJS 10 + TypeScript** | Modules map cleanly to content domains. |
| Database | **MongoDB Atlas** (Mongoose) | Free tier M0 to start; documents suit nested committee data. |
| Media | **Cloudinary** | Signed direct uploads, on-the-fly transforms, CDN. |
| Repos | **Separate repos** | 3 repos, independent CI/CD. |

### 2.1 Repository layout

```
somoyondu.github.io   (existing)  → public site, Vite React SPA
somoyon-api           (new)       → NestJS REST API
somoyon-admin         (new)       → Vite React admin dashboard
```

**Shared types:** publish `@somoyon/types` as a small package to GitHub Packages (or, simpler to start: a `types/` folder duplicated by a `sync-types` script in CI that copies `src/common/dto/*.ts` from the API repo). Start with the copy script; promote to a published package only if drift becomes painful.

---

## 3. Target Architecture

```
                    ┌────────────────────────────┐
   Visitors ───────▶│ somoyondu.github.io        │
   (no login)       │ Vite React SPA · GH Pages  │
                    └─────────────┬──────────────┘
                                  │ GET /api/v1/public/*  (no auth, cached)
                                  ▼
   Admins ─────────▶┌────────────────────────────┐      ┌──────────────────┐
   (JWT)            │ somoyon-api                │─────▶│ MongoDB Atlas    │
                    │ NestJS · Render/Railway    │      └──────────────────┘
                    │ /api/v1/admin/*  (guarded) │      ┌──────────────────┐
                    └─────────────┬──────────────┘─────▶│ Cloudinary       │
                                  ▲                     └──────────────────┘
                    ┌─────────────┴──────────────┐              ▲
   Admin panel ────▶│ somoyon-admin              │──────────────┘
                    │ Vite React · Vercel/Netlify│  signed direct upload
                    └────────────────────────────┘
```

**Key flows**

- **Read (public):** SPA → `GET /public/*` → Nest → Mongo (with in-memory/Redis cache) → JSON with Cloudinary URLs already transformed.
- **Write (admin):** Admin app → login → JWT access (15 min) + refresh (7 d, httpOnly cookie) → `POST/PATCH /admin/*`.
- **Upload:** Admin requests a **signed upload signature** from the API → browser uploads **directly to Cloudinary** (file never touches our server) → admin posts the returned `public_id` + metadata to the API, which stores a `Media` document.

---

## 4. Data Model (MongoDB / Mongoose)

All collections carry `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.

### 4.1 `users`
```ts
{
  _id, email: string (unique, lowercase),
  passwordHash: string,            // argon2id
  name: string, nameBn?: string,
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR',
  avatar?: MediaRef,
  isActive: boolean,
  lastLoginAt?: Date,
  refreshTokenHash?: string,
  mustChangePassword: boolean,
  twoFactorEnabled: boolean,       // phase 4
}
```

### 4.2 `media` (Cloudinary mirror)
```ts
{
  _id,
  publicId: string (unique),       // cloudinary public_id
  url: string, secureUrl: string,
  format: string, width: number, height: number, bytes: number,
  folder: string,                  // 'somoyon/committee/2026', 'somoyon/gallery'
  alt?: string, altBn?: string,
  caption?: string, captionBn?: string,
  tags: string[],
  blurhash?: string,               // for placeholders
  uploadedBy: ObjectId(users),
}
```

### 4.3 `people` — **the biggest win of this migration**

Today the same person is duplicated across `members/2024/nazmul.jpg`, `members/2025/nazmul.jpg`, `committee-members/2026/president/nazmul.jpg`. Normalize to one Person record with many Positions.

```ts
{
  _id,
  slug: string (unique),           // 'md-nazmul'
  name: string,                    // 'মো. নাজমুল' (Bengali, display)
  nameEn?: string,
  photo?: MediaRef,                // default/latest photo
  department?: string, session?: string,
  bio?: string, bioBn?: string,
  socials?: { facebook?, linkedin?, email?, phone? },
  isPublic: boolean,               // hide phone/email publicly
}
```

### 4.4 `committees` (one document per year)
```ts
{
  _id,
  year: number (unique),           // 2023..2026..
  title: string,                   // 'কার্যনির্বাহী পরিষদ ২০২৬'
  expandButtonText: string,
  collapseButtonText: string,
  description?: string,
  isFounding: boolean,             // 2023 founding committee flag
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  displayOrder: number,
  coverImage?: MediaRef,
}
```

### 4.5 `positions` (membership of a person in a committee)
```ts
{
  _id,
  committee: ObjectId(committees),
  person: ObjectId(people),
  designation: ObjectId(designations),
  photoOverride?: MediaRef,        // year-specific photo
  group: 'TOP_LEADER' | 'TOP_EXECUTIVE' | 'ORGANIZING' | 'OFFICIAL' | 'MEMBER',
  displayOrder: number,            // preserves current manual ordering
  isActive: boolean,
}
```
> `group` maps 1:1 to today's four tabs in `AllExecutives.jsx` plus `TopLeaders`. The public API returns positions already grouped, so **no frontend layout change is needed**.

### 4.6 `designations` (lookup — avoids typo drift in Bengali titles)
```ts
{
  _id, slug: 'vice-president',
  nameBn: 'সহ-সভাপতি', nameEn: 'Vice President',
  group: 'TOP_EXECUTIVE',
  rank: number,                    // sort weight within group
}
```
Seed from the distinct designations in the current services files (~30 values).

### 4.7 `advisors`
```ts
{
  _id, name, nameEn?, designation, designationBn,
  organization?, photo: MediaRef,
  displayOrder: number, isActive: boolean,
  year?: number,                   // optional; currently year-less
}
```

### 4.8 `galleryAlbums` + `galleryItems`
```ts
// album
{ _id, slug, title, titleBn, description?, coverImage: MediaRef,
  eventDate?: Date, year: number, status, displayOrder }

// item
{ _id, album: ObjectId, media: MediaRef, title?, titleBn?,
  displayOrder, isFeatured }
```
> Today `Gallery.jsx` globs a flat folder and derives titles from filenames (`iftar-mahfil-2024` → "Iftar Mahfil 2024"). Albums are the natural upgrade — group by event, keep a "featured" flat feed for the existing slider.

### 4.9 `events`
```ts
{ _id, slug, title, titleBn, excerpt, content (rich HTML/JSON),
  coverImage: MediaRef, gallery: MediaRef[],
  startAt: Date, endAt?: Date, venue?, venueBn?,
  registrationUrl?, status: 'DRAFT'|'PUBLISHED'|'ARCHIVED',
  isFeatured, tags: string[], publishedAt }
```
Revives the currently commented-out `Events` feature.

### 4.10 `posts` (notices / blog)
```ts
{ _id, slug, title, titleBn, excerpt, content, coverImage,
  category: 'NOTICE'|'BLOG'|'PRESS', author: ObjectId(users),
  status, publishedAt, tags, viewCount, seo: { metaTitle, metaDescription, ogImage } }
```

### 4.11 `siteSettings` (singleton)
```ts
{
  _id: 'singleton',
  siteName: 'সময়ন',
  logo: MediaRef, whiteLogo: MediaRef, favicon: MediaRef, heroBackground: MediaRef,
  hero: { headline, subheadline, ctaText },
  about: { title, body },                       // from AboutUs.jsx
  foundingBlurb: { title, body },
  advisoryBlurb: { title, body },
  contact: { email, phone, address },
  socials: [{ platform, url, icon: MediaRef, isActive }],
  donation: {
    isEnabled: boolean,
    title, description,
    methods: [{ name: 'bKash', number: '017…', type: 'Personal', logo: MediaRef, instructions }]
  },
  seo: { defaultTitle, defaultDescription, ogImage, gaTrackingId },
  navLinks: [{ id, title, order, isActive }],   // from NavBar.jsx
  maintenanceMode: boolean,
}
```

### 4.12 `contactSubmissions` (new capability)
```ts
{ _id, name, email, phone?, subject, message,
  status: 'NEW'|'READ'|'REPLIED'|'SPAM',
  ipHash, userAgent, createdAt }
```

### 4.13 `auditLogs`
```ts
{ _id, actor: ObjectId(users), action: 'CREATE'|'UPDATE'|'DELETE'|'PUBLISH'|'LOGIN',
  entity: string, entityId: ObjectId,
  before?: object, after?: object, ip, createdAt }
```

### 4.14 Indexes

```js
users:        { email: 1 } unique
people:       { slug: 1 } unique, { name: 'text', nameEn: 'text' }
committees:   { year: -1 } unique, { status: 1 }
positions:    { committee: 1, group: 1, displayOrder: 1 }, { person: 1 }
media:        { publicId: 1 } unique, { folder: 1, createdAt: -1 }
galleryItems: { album: 1, displayOrder: 1 }
events:       { slug: 1 } unique, { status: 1, startAt: -1 }
posts:        { slug: 1 } unique, { status: 1, publishedAt: -1 }
auditLogs:    { createdAt: -1 }, TTL 365d
```

---

## 5. NestJS API Design

### 5.1 Project structure (`somoyon-api`)

```
src/
├── main.ts
├── app.module.ts
├── common/
│   ├── decorators/       (@Roles, @Public, @CurrentUser)
│   ├── guards/           (JwtAuthGuard, RolesGuard, ThrottlerGuard)
│   ├── interceptors/     (TransformResponse, AuditLog, CacheInterceptor)
│   ├── filters/          (AllExceptionsFilter)
│   ├── pipes/            (ZodValidationPipe or class-validator)
│   └── dto/              (shared response DTOs → synced to frontends)
├── config/               (@nestjs/config + Joi env validation)
├── database/             (MongooseModule.forRootAsync, schemas barrel)
├── modules/
│   ├── auth/             login, refresh, logout, forgot/reset password
│   ├── users/            admin CRUD, role assignment
│   ├── media/            Cloudinary signature, media CRUD, delete-from-cloud
│   ├── people/
│   ├── designations/
│   ├── committees/       + nested positions controller
│   ├── advisors/
│   ├── gallery/          albums + items
│   ├── events/
│   ├── posts/
│   ├── settings/
│   ├── contact/          public POST + admin inbox
│   ├── audit/
│   └── public/           read-only aggregation endpoints (see 5.3)
└── seed/                 migration scripts (see §7)
```

### 5.2 Cross-cutting

- **Validation:** `class-validator` + `ValidationPipe({ whitelist: true, transform: true })`.
- **Response envelope:** `{ success, data, meta?, error? }` via a global interceptor.
- **Errors:** `AllExceptionsFilter` → consistent `{ success:false, error:{ code, message, details } }`.
- **Docs:** `@nestjs/swagger` at `/api/docs` (basic-auth protected in production).
- **Rate limiting:** `@nestjs/throttler` — 100 req/min public, 10 req/min on `/auth/login` and `/contact`.
- **Security:** `helmet`, CORS allowlist (`somoyondu.github.io`, admin domain, `localhost:5173/5174`), `compression`.
- **Logging:** `nestjs-pino` with request ids; ship to Better Stack / Axiom free tier.
- **Health:** `@nestjs/terminus` at `/health` (Mongo ping + Cloudinary ping) — also keeps free-tier hosts warm.
- **Caching:** `CacheModule` in-memory (TTL 5 min) on all `/public/*` GETs; bust the cache on any admin mutation via a `CacheBustService`. Add Redis (Upstash) only if you outgrow one instance.

### 5.3 Endpoint surface

**Public (no auth, cacheable)**

```
GET  /api/v1/public/bootstrap          → settings + navLinks + socials + donation (one call on app load)
GET  /api/v1/public/committees         → [{ year, title, buttons }] (published only)
GET  /api/v1/public/committees/:year   → full committee, positions grouped by `group`
GET  /api/v1/public/founding-members
GET  /api/v1/public/advisors
GET  /api/v1/public/gallery            → featured flat feed (drop-in for current slider)
GET  /api/v1/public/gallery/albums
GET  /api/v1/public/gallery/albums/:slug
GET  /api/v1/public/events?status=upcoming|past&page=1
GET  /api/v1/public/events/:slug
GET  /api/v1/public/posts?category=NOTICE&page=1
GET  /api/v1/public/posts/:slug
POST /api/v1/public/contact            → rate-limited + honeypot + hCaptcha
```

**Auth**
```
POST /api/v1/auth/login            { email, password } → { accessToken, user } + refresh cookie
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
PATCH /api/v1/auth/change-password
```

**Admin (JWT + RolesGuard)** — standard REST CRUD per module:
```
GET|POST                /api/v1/admin/{resource}
GET|PATCH|DELETE        /api/v1/admin/{resource}/:id
PATCH                   /api/v1/admin/{resource}/reorder     { items: [{id, displayOrder}] }
PATCH                   /api/v1/admin/{resource}/:id/publish
POST                    /api/v1/admin/media/signature        → Cloudinary signed params
POST                    /api/v1/admin/media                  → persist after client upload
POST                    /api/v1/admin/committees/:year/clone → duplicate last year as draft ⭐
GET                     /api/v1/admin/audit-logs
GET                     /api/v1/admin/dashboard/stats
```

⭐ **Clone-committee** is the highest-value admin feature: each January, clone 2026 → 2027 draft, swap the people, publish. Turns a 400-line code edit into a 20-minute task.

### 5.4 Role matrix

| Capability | SUPER_ADMIN | ADMIN | EDITOR |
|---|:--:|:--:|:--:|
| Manage users & roles | ✅ | ❌ | ❌ |
| Site settings, donation info | ✅ | ✅ | ❌ |
| Delete any content | ✅ | ✅ | ❌ |
| Create/edit committees, people, advisors | ✅ | ✅ | ✅ |
| Publish content | ✅ | ✅ | ❌ (submits for review) |
| Upload media | ✅ | ✅ | ✅ |
| Delete media | ✅ | ✅ | ❌ |
| View audit log | ✅ | ✅ | ❌ |
| Read contact inbox | ✅ | ✅ | ❌ |

---

## 6. Cloudinary Strategy

### 6.1 Folder scheme
```
somoyon/
├── committee/{year}/{designation-slug}/     # e.g. somoyon/committee/2026/vice-president/
├── people/                                  # canonical person photos
├── advisors/
├── gallery/{album-slug}/
├── events/{event-slug}/
├── posts/{post-slug}/
└── site/                                    # logo, favicon, hero bg, payment icons
```

### 6.2 Upload flow (signed, direct-to-cloud)
1. Admin selects file → `POST /admin/media/signature` with `{ folder, tags }`.
2. API returns `{ signature, timestamp, apiKey, cloudName, folder, uploadPreset }` (secret never leaves the server).
3. Browser `POST`s the file directly to `https://api.cloudinary.com/v1_1/{cloud}/image/upload`.
4. Browser sends the Cloudinary response to `POST /admin/media` → API validates the `public_id` **by re-fetching it from the Cloudinary Admin API** (prevents forged records) and stores a `Media` doc.

### 6.3 Transformations (named presets, applied at read time)
| Preset | Transform | Used by |
|---|---|---|
| `avatar` | `c_fill,g_face,w_200,h_200,q_auto,f_auto,r_max` | Committee/advisor cards |
| `avatar_2x` | same @ `w_400,h_400` | Retina |
| `gallery_slide` | `c_fill,w_1000,h_1000,q_auto,f_auto` | Home slider |
| `gallery_thumb` | `c_fill,w_400,h_400,q_auto,f_auto` | Album grid |
| `cover` | `c_fill,w_1200,h_630,q_auto,f_auto` | Events/posts + OG images |
| `blur_placeholder` | `w_20,e_blur:200,q_1,f_auto` | LQIP while loading |

`g_face` on avatars is a direct upgrade over today's fixed-crop `<img>` tags — it auto-centers faces across ~200 inconsistently framed photos.

### 6.4 Guardrails
- Free plan = 25 credits/mo (~25 GB bandwidth). Current asset set is small; enable `f_auto,q_auto` everywhere and the site should stay well under.
- Upload constraints enforced server-side in the signature: `max_file_size 5MB`, `allowed_formats: jpg,jpeg,png,webp`.
- **Deleting a Media doc must also delete from Cloudinary** (`cloudinary.uploader.destroy`) — wrap in a try/catch and log orphans to `auditLogs`.
- Nightly cron: reconcile Cloudinary resources vs `media` collection, report orphans.

---

## 7. Data Migration (one-time)

The existing hardcoded data is the seed. Do **not** retype it.

### 7.1 Extraction script (`somoyon-api/src/seed/extract.ts`)

1. Copy the seven `src/services/*.jsx` files into `seed/legacy/`.
2. Strip the `export default` wrapper, convert each into a plain JSON export via a small Node script (`jiti` or `esbuild-register` can import JSX-free JS directly — these files are plain data functions, so a regex-free `import()` after renaming `.jsx`→`.mjs` works).
3. Emit `seed/data/{year}.json` with shape `{ year, groups: { TOP_LEADER: [...], TOP_EXECUTIVE: [...], ORGANIZING: [...], OFFICIAL: [...], MEMBER: [...] } }`.

### 7.2 Person de-duplication

Names repeat across years with slight spelling variance. Strategy:
1. Build a candidate key: normalized Bengali name (strip spaces, punctuation, `মো.`/`মোঃ` prefix variants) + image basename.
2. Auto-merge exact matches; write ambiguous pairs to `seed/review-merges.csv` for **manual review before running the import**. Expect ~30–50 pairs.
3. Import approved merges → `people` collection.

> Budget real time for this. It is the only genuinely fiddly part of the migration.

### 7.3 Image upload script (`seed/upload-media.ts`)

```
for each file in public/{committee-2026,committee-members,members,advisors,gallery,*.png}:
  → normalize extension (.JPG → .jpg)
  → cloudinary.uploader.upload(file, { folder: mapFolder(path), public_id: slug, overwrite: false })
  → write Media doc
  → record { legacyPath → mediaId } in seed/media-map.json
```
Run with concurrency 5 and a resumable checkpoint file — Cloudinary free tier rate-limits.

### 7.4 Import order
```
1. designations   (hand-written seed, ~30 rows)
2. media          (from upload script)
3. people         (de-duplicated)
4. committees     (2023, 2024, 2025, 2026)
5. positions      (join people × committees × designations, preserving array index → displayOrder)
6. advisors
7. galleryAlbums + galleryItems (group public/gallery/* by year in filename)
8. siteSettings   (hand-written from AboutUs/Contact/SocialMedia/DonationCard)
9. users          (1 SUPER_ADMIN, mustChangePassword: true)
```

### 7.5 Verification gate
Write `seed/verify.ts` that asserts, per year:
- position count matches the legacy array lengths exactly,
- every position has a resolvable photo URL (HTTP 200),
- no designation is `null`,
- rendered JSON from `/public/committees/:year` is **deep-equal** (modulo image URLs) to the legacy service output.

Do not proceed to §8 until `verify` passes for all four years.

---

## 8. Public Frontend Refactor (`somoyondu.github.io`)

### 8.1 New dependencies
```
@tanstack/react-query   # caching, loading/error states, retries
axios                   # API client
react-helmet-async      # per-route meta tags
react-loading-skeleton  # replaces "ছবি লোড হচ্ছে ..." text
```
Optionally add TypeScript incrementally (`allowJs: true`, rename files as you touch them).

### 8.2 New structure
```
src/
├── api/
│   ├── client.js            # axios instance, baseURL from VITE_API_URL
│   └── queries/             # useCommittees, useCommittee(year), useAdvisors,
│                            # useGallery, useEvents, usePosts, useSettings
├── context/SettingsContext.jsx   # /public/bootstrap, loaded once at app root
├── components/  (existing, made data-driven)
├── features/    (existing)
├── layouts/     (existing)
├── pages/
│   ├── LandingPage.jsx
│   ├── CommitteePage.jsx    # /committee/:year — deep-linkable ⭐
│   ├── GalleryPage.jsx      # /gallery, /gallery/:albumSlug
│   ├── EventsPage.jsx       # /events, /events/:slug
│   ├── PostsPage.jsx        # /notices, /notices/:slug
│   ├── ContactPage.jsx      # real form → POST /public/contact
│   └── NotFound.jsx
└── services/                # ❌ DELETE after migration verified
```

### 8.3 Component-by-component change list

| File | Change |
|---|---|
| `layouts/ExecutiveCommitteeSection.jsx` | Replace hardcoded 2023–2026 map with `useCommittees()` → `.map()`. New years appear automatically. |
| `components/Executives/TopLeaders/TopExecutives/OrganizingExecutives/OfficialExecutives/ExecutiveMembers.jsx` | Drop the `*Service()` import; accept a `positions` prop from the parent's query. |
| `components/AllExecutives.jsx` | Tabs derive from the groups actually present in the response (hide empty tabs). |
| `components/ExecutiveCard.jsx` / `AdvisorCard.jsx` | `src` = Cloudinary URL; add `srcSet` (1x/2x), `loading="lazy"`, LQIP background. |
| `features/Gallery.jsx` | **Delete the `import.meta.glob` block** → `useGallery()`. Fixes the slowest part of the current build. |
| `features/Events.jsx` | Rebuild from the API; re-enable in `MainSection`. |
| `components/AboutUs.jsx`, `FoundingMembers.jsx`, `AdvisoryCommittee.jsx` | Text from `settings.about` / `.foundingBlurb` / `.advisoryBlurb`. |
| `components/NavBar.jsx` | Links from `settings.navLinks`; add routes for new pages. |
| `components/Contact.jsx`, `SocialMedia.jsx`, `Icon.jsx` | From `settings.contact` / `settings.socials`. |
| `Donation/DonationCard.jsx`, `InfoCard.jsx` | From `settings.donation.methods`. |
| `features/Header.jsx` | Hero background from `settings.heroBackground` (Cloudinary). |
| `features/FoundingMembers.jsx` | Fix duplicate `id="executives"` → `id="founding"`. |
| `App.jsx` / `main.jsx` | Add `QueryClientProvider`, `SettingsProvider`, `HelmetProvider`, `ErrorBoundary`, real `<Routes>`. |

### 8.4 Loading, error & offline behaviour
- **Skeletons**, not spinners — the layout is card-grid-heavy, so skeletons prevent CLS.
- **Stale-while-revalidate:** `staleTime: 5min`, `gcTime: 24h`, `persistQueryClient` to `localStorage` so repeat visitors see content instantly even before the API responds (important — free-tier hosts cold-start in 30–50 s).
- **Fallback snapshot:** ship a build-time-generated `public/fallback.json` (fetched from the API during CI build). If the API is unreachable, render from it and show a subtle "সর্বশেষ হালনাগাদ: {date}" notice. **The site never goes blank because the backend is asleep.** This matters a lot on a free plan.

### 8.5 GitHub Pages SPA routing
GH Pages has no server rewrites. Two options:
- **A (recommended):** keep `BrowserRouter` + copy `index.html` to `404.html` at build time (`"build": "vite build && cp dist/index.html dist/404.html"`), plus the standard redirect shim. Clean URLs, works with the custom domain.
- **B:** switch to `HashRouter` (`/#/committee/2026`). Zero config, uglier URLs, weaker SEO.

Also add `vite.config.js` → `base: '/'` (already correct for a user/org page) and a `CNAME` file if a custom domain is added.

### 8.6 SEO
Since the SPA renders client-side, do the cheap wins:
- `react-helmet-async` per route (title, description, OG image from Cloudinary `cover` preset).
- Static `public/sitemap.xml` regenerated in CI from the API's slug list.
- `robots.txt`, JSON-LD `Organization` + `Event` schema in `index.html`/per page.
- Prerender critical routes at build time with `vite-plugin-prerender` or `puppeteer` in CI if crawler coverage proves insufficient. (This is the one place where the Next.js option would have been easier — revisit only if traffic justifies it.)

---

## 9. Admin Panel (`somoyon-admin`)

### 9.1 Stack
```
Vite + React 18 + TypeScript
react-router-dom v6            (protected routes)
@tanstack/react-query          (server state)
react-hook-form + zod          (forms/validation)
shadcn/ui + Tailwind           (consistent, accessible primitives)
@tanstack/react-table          (sortable/filterable data tables)
@dnd-kit/sortable              (drag-to-reorder — replaces displayOrder editing)
Tiptap                         (rich text for events/posts)
react-dropzone                 (uploads)
sonner                         (toasts)
recharts                       (dashboard stats)
```
Bengali input works natively; ensure a Bengali-capable font stack (Noto Sans Bengali / Hind Siliguri) in both apps.

### 9.2 Screens

```
/login
/                       Dashboard — counts, recent activity, quick actions
/committees             List by year · [Clone last year] ⭐
/committees/:year       Tabbed by group; drag-to-reorder; add/remove positions
/people                 Searchable person directory; merge-duplicates tool
/people/:id             Profile + position history across years
/designations           Lookup table CRUD (Bengali/English titles, rank)
/advisors               List + drag reorder
/gallery                Albums grid
/gallery/:albumId       Bulk upload, drag reorder, set cover, captions
/events                 List/calendar · create/edit with rich text
/posts                  Notices & blog
/media                  Media library — grid, folder filter, search, usage count
/settings/general       Site name, logos, hero, about/blurb text
/settings/contact       Email, phone, socials
/settings/donation      bKash/Nagad methods
/settings/seo           Meta defaults, GA id
/inbox                  Contact submissions
/users                  Admin accounts & roles (SUPER_ADMIN only)
/audit                  Activity log with filters
```

### 9.3 Admin UX principles
- **Bengali-first labels** — the people maintaining this site work in Bengali. Ship the admin UI in Bengali with English fallback.
- **Live preview panel** on committee and settings screens showing the actual public card component, so an editor sees exactly what visitors will get.
- **Draft → Publish** with a "preview as visitor" link (`?preview=<token>`).
- **Autosave drafts** every 30 s to avoid losing long Bengali text entry.
- **Optimistic reorder** with rollback on failure.

---

## 10. Security

| Concern | Mitigation |
|---|---|
| Password storage | argon2id (`@node-rs/argon2`), min 12 chars, zxcvbn strength check |
| Token strategy | Access JWT 15 min (memory only, never `localStorage`) + refresh in `httpOnly; Secure; SameSite=None` cookie, rotated on use, reuse-detection revokes the family |
| Brute force | Throttler: 5 login attempts / 15 min per IP+email; lock account 30 min |
| CORS | Strict allowlist; `credentials: true` |
| Injection | Mongoose strict schemas + `express-mongo-sanitize`; never pass raw user objects into queries |
| XSS from rich text | Sanitize Tiptap HTML server-side with `sanitize-html` on write **and** render-side |
| Upload abuse | Signed uploads only; server-enforced size/format; verify `public_id` against Cloudinary Admin API |
| Secrets | `.env` never committed; host env vars; `Joi` validation fails fast on boot; rotate the Cloudinary API secret after migration since it will have been used locally |
| Contact spam | Honeypot field + hCaptcha + rate limit + `ipHash` (hashed, not raw — privacy) |
| Public data leakage | `/public/*` DTOs explicitly whitelist fields; never return `people.socials.phone` unless `isPublic` |
| Dependency risk | Dependabot + `npm audit` in CI |
| Backups | Atlas automated backups (M10+) or a nightly `mongodump` GitHub Action → private repo/S3 on M0 |

---

## 11. Deployment & Environments

| Component | Host | Notes |
|---|---|---|
| Public site | GitHub Pages (existing) | `gh-pages -d dist` — **note: current `package.json` deploys `-d build`, but Vite outputs `dist`. Fix this.** |
| API | Render / Railway / Fly.io | Free tier sleeps → mitigated by fallback snapshot (§8.4) + a 10-min cron ping |
| Admin | Vercel or Netlify | Password-protected preview deploys |
| DB | MongoDB Atlas M0 (free) | Restrict network access to host IPs where possible; else `0.0.0.0/0` + strong creds |
| Media | Cloudinary free | See §6.4 |

### 11.1 Environments
`local` → `staging` (separate Atlas DB + Cloudinary folder prefix `staging/`) → `production`.

### 11.2 Env vars (API)
```
NODE_ENV, PORT, API_PREFIX=api/v1
MONGODB_URI
JWT_ACCESS_SECRET, JWT_ACCESS_TTL=15m
JWT_REFRESH_SECRET, JWT_REFRESH_TTL=7d
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
CORS_ORIGINS=https://somoyondu.github.io,https://admin.somoyon.org
THROTTLE_TTL, THROTTLE_LIMIT
SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_FROM     # password reset + contact notify
HCAPTCHA_SECRET
SENTRY_DSN
```

### 11.3 CI/CD (GitHub Actions)
- **API:** lint → typecheck → unit tests → e2e (mongodb-memory-server) → build → deploy on `main`.
- **Public:** lint → build → fetch `fallback.json` from prod API → `gh-pages` deploy.
- **Admin:** lint → typecheck → build → Vercel deploy.
- **Nightly:** Mongo backup, Cloudinary orphan reconcile, API keep-warm ping.

---

## 12. Phased Roadmap

Estimates assume one developer working part-time.

### Phase 0 — Prep (3–5 days)
- [ ] Create `somoyon-api` and `somoyon-admin` repos; scaffold Nest + Vite/TS
- [ ] Provision Atlas cluster, Cloudinary account, hosting accounts
- [ ] Clean `somoyondu.github.io`: remove `.DS_Store`, fix `.gitignore`, fix `deploy` script (`build` → `dist`), fix duplicate `id="executives"`
- [ ] Add ESLint/Prettier/husky/commitlint to all three repos

### Phase 1 — API foundation (1–1.5 weeks)
- [ ] Config module + Joi validation, Mongoose connection, health check
- [ ] Global interceptors/filters/response envelope, Swagger
- [ ] `auth` + `users` modules, roles guard, refresh rotation
- [ ] `media` module + Cloudinary signed uploads
- [ ] `audit` interceptor
- [ ] Deploy API to staging; Swagger reachable

### Phase 2 — Content modules (1.5–2 weeks)
- [ ] `designations`, `people`, `committees`, `positions` (incl. clone endpoint)
- [ ] `advisors`, `gallery`, `settings`
- [ ] `public` read module + caching + cache-busting
- [ ] Unit tests on services, e2e on public endpoints

### Phase 3 — Migration (1 week)
- [ ] Extraction script → JSON
- [ ] Cloudinary bulk upload with checkpointing
- [ ] Person de-duplication + manual review pass
- [ ] Import + `verify.ts` green for 2023–2026
- [ ] Freeze: no further edits to `src/services/*` after this point

### Phase 4 — Admin panel (2–2.5 weeks)
- [ ] Auth shell, protected routes, layout, Bengali i18n
- [ ] Media library + uploader
- [ ] Committees (tabs, drag reorder, clone) + people
- [ ] Advisors, gallery albums, settings, users, audit
- [ ] Live preview panel

### Phase 5 — Public site rewire (1–1.5 weeks)
- [ ] React Query + axios + SettingsContext
- [ ] Convert every component per §8.3
- [ ] Skeletons, error boundary, persisted cache, `fallback.json`
- [ ] Router + new pages + 404.html shim
- [ ] Side-by-side visual diff vs the current live site
- [ ] Delete `src/services/*`

### Phase 6 — New capabilities (1–2 weeks)
- [ ] Events module end-to-end (revive the commented-out feature)
- [ ] Notices/blog
- [ ] Contact form + inbox + email notification
- [ ] Gallery albums UI
- [ ] SEO: helmet, sitemap, JSON-LD, OG images

### Phase 7 — Hardening & launch (1 week)
- [ ] Lighthouse ≥ 90 on all four categories, mobile
- [ ] Security review checklist (§10)
- [ ] Backups + monitoring (Sentry, uptime, log drain) verified
- [ ] Admin handover doc **in Bengali** + a screen-recorded walkthrough
- [ ] DNS/custom domain, launch, 48 h watch

**Total: ~9–12 weeks part-time.**

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Free-tier API cold start (30–50 s) | Blank page for first visitor | `fallback.json` + persisted query cache (§8.4) + keep-warm cron |
| Cloudinary free-tier overage | Images stop loading | `f_auto,q_auto` everywhere, monitor monthly, budget ~$0 → paid tier is the escape hatch |
| Bengali name de-duplication errors | Wrong photo on wrong person | Manual review CSV before import; `verify.ts` count assertions |
| SPA + GH Pages SEO weakness | Lower search visibility | Helmet + sitemap + JSON-LD; prerender if needed; Next.js migration remains a later option |
| Non-technical admins overwhelmed | CMS goes unused, data rots | Bengali UI, live preview, clone-year workflow, recorded training |
| Atlas M0 512 MB limit | Writes fail | Media lives in Cloudinary, not Mongo; audit logs TTL 365 d; monitor |
| Lost content during cutover | Data loss | Keep `src/services/*` in git history; run old and new in parallel for 2 weeks before deleting |
| Secret leakage in a public repo | Account takeover | Env vars only; `gitleaks` in CI; rotate secrets post-migration |

---

## 14. Success Criteria

**Functional**
- Adding the 2027 committee requires **zero code changes** and takes < 30 min via clone-year.
- Any authorized admin can upload a gallery photo and see it live within 5 minutes.
- All 2023–2026 committee data renders identically to today's site.
- Multiple admins can work concurrently with role separation and a full audit trail.
- Visitors never log in, never see a blank page.

**Non-functional**
- Lighthouse Performance ≥ 90, Accessibility ≥ 95 (mobile).
- LCP < 2.5 s on 4G; total image payload down ≥ 60 % vs today (Cloudinary `f_auto,q_auto`).
- Public API p95 < 300 ms warm.
- 99.5 % uptime for the public site (static host makes this nearly free).
- API test coverage ≥ 70 % on services.

---

## 15. Open Questions

1. **Custom domain?** `somoyon.org` / `.org.bd` would improve credibility and make admin subdomain routing cleaner. GH Pages supports it via `CNAME`.
2. **Who are the admins?** Confirm the initial list and roles (IT Secretary + Deputy IT Secretary as ADMIN, Press Secretary as EDITOR seems natural given the committee structure).
3. **Bilingual site (bn/en)?** The data model already carries `nameEn`/`titleBn` pairs. Adding an `i18n` layer later is cheap if fields are populated now — worth deciding before migration.
4. **Online donation collection** (bKash/SSLCommerz payment gateway) or keep display-only numbers? Payment integration adds compliance scope; recommend display-only for v1.
5. **Member registration / portal** — deferred out of scope, but the `people` model is ready for it.
6. **Retention:** should old committee years ever be unpublished, or is the archive permanent? (Assumed permanent.)

---

## 16. Immediate Next Steps

1. Answer §15.1–3 (they affect the schema).
2. Create the two new repos and provision Atlas + Cloudinary.
3. Do the Phase 0 cleanup on this repo — it is independently valuable and low-risk.
4. Write `seed/extract.ts` **first**: getting the legacy data into clean JSON de-risks everything downstream and can happen before a single API endpoint exists.
