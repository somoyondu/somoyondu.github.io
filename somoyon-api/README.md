# somoyon-api

NestJS + MongoDB Atlas + Cloudinary content API for the সময়ন website.

> **This is a separate repository.** It currently sits inside the public-site
> folder for convenience. Move it out and `git init` it as its own repo:
> ```bash
> mv somoyon-api ../somoyon-api && cd ../somoyon-api && git init
> ```

## Quick start

```bash
cp .env.example .env      # fill in MONGODB_URI + CLOUDINARY_* + JWT secrets
npm install
npm run start:dev         # http://localhost:4000/api/v1
```

Swagger docs: `http://localhost:4000/api/docs`

## Migrating the legacy data

Run once, in order. `LEGACY_ROOT` must point at the public-site repo (it
defaults to the parent folder).

```bash
npm run seed:extract   # src/services/*.jsx  ->  seed/data/*.json
npm run seed:upload    # public/**/*.jpg     ->  Cloudinary (resumable)
npm run seed:import    # JSON + Cloudinary   ->  MongoDB
npm run seed:admin     # creates the first SUPER_ADMIN
npm run seed:verify    # migration gate — must pass before going live
```

`npm run seed:all` chains all five.

`seed:verify` asserts, per year, that the position counts match the legacy
arrays, every position resolves a photo, no designation is null, and the person
records were genuinely deduplicated. **Do not launch until it exits 0.**

`seed:import` also writes `seed/review-merges.csv` — a list of person records
whose names look like duplicates. Review these and merge from the admin panel
(**সদস্য তালিকা → ডুপ্লিকেট মেলান**).

## Architecture

```
src/
├── common/      guards, interceptors, filters, BaseCrudService, DTOs
├── config/      env loading + Joi validation (fails fast on boot)
├── database/    all Mongoose schemas, registered globally
├── modules/
│   ├── auth/        JWT access (15m) + rotating refresh cookie (7d)
│   ├── users/       admin accounts, roles
│   ├── media/       Cloudinary signed direct uploads
│   ├── people/      one record per human
│   ├── committees/  committees + positions + the clone-year endpoint
│   ├── public/      anonymous read API consumed by the website
│   └── …            designations, advisors, gallery, events, posts,
│                    settings, contact, dashboard, audit, health, tasks
└── seed/        one-time migration scripts
```

`BaseCrudService` holds the list/get/create/update/delete/reorder logic so each
module only implements what is genuinely specific to it.

### Response envelope

```json
{ "success": true, "data": …, "meta": { "page": 1, "total": 42 } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "…" } }
```

### Roles

| | SUPER_ADMIN | ADMIN | EDITOR |
|---|:--:|:--:|:--:|
| Manage users | ✅ | ❌ | ❌ |
| Site settings | ✅ | ✅ | ❌ |
| Delete content | ✅ | ✅ | ❌ |
| Publish | ✅ | ✅ | ❌ |
| Create/edit content | ✅ | ✅ | ✅ |
| Upload media | ✅ | ✅ | ✅ |

### The clone-year endpoint

`POST /admin/committees/clone { sourceYear, targetYear, copyPeople }`

This is the feature that removes the annual code deploy: it duplicates last
year's designation structure into a new **DRAFT** committee. Swap the people,
publish, done.

## Caching

All `/public/*` GETs are cached in-memory for 5 minutes. Every admin mutation
calls `CacheBustService.bustAll()`, so edits appear on the website within one
request rather than waiting out the TTL.

## Deployment (Render)

`render.yaml` is a ready blueprint. Set these in the dashboard — never commit
them: `MONGODB_URI`, `CLOUDINARY_*`, `CORS_ORIGINS`, `SMTP_*`.

Health check: `/api/v1/health` · keep-warm ping: `/api/v1/health/ping`
