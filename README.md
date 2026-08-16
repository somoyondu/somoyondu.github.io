# সময়ন (Somoyon) — public website

React + Vite front end for the সময়ন organisation site. Content is no longer
hardcoded: everything comes from the [somoyon-api](./somoyon-api) CMS.

## Quick start

```bash
cp .env.example .env      # VITE_API_URL=http://localhost:4000/api/v1
npm install
npm run dev
```

## The three repositories

| Repo | What it is | Host |
|---|---|---|
| `somoyondu.github.io` (this one) | Public website | Netlify |
| `somoyon-api` | NestJS CMS API | Render |
| `somoyon-admin` | Bengali admin panel | Netlify |

`somoyon-api/` and `somoyon-admin/` currently live inside this folder for
convenience. Move each out and `git init` it as its own repository before
pushing.

## What changed in the CMS migration

- `src/services/*.jsx` no longer feed the UI. They are kept **only** because
  `somoyon-api/src/seed/extract.ts` reads them during the one-time migration.
  Delete them once `npm run seed:verify` has passed.
- `src/api/queries.js` is the single place the site talks to the API.
- Committee years are no longer hardcoded — `ExecutiveCommitteeSection` renders
  whatever the API returns, so adding 2027 needs no code change.
- Images are served from Cloudinary with `f_auto,q_auto` and face-aware
  cropping, replacing the raw JPEGs in `public/`.
- New routes: `/committee/:year`, `/gallery`, `/gallery/:slug`, `/events`,
  `/events/:slug`, `/notices`, `/notices/:slug`, `/contact`.

## Surviving a sleeping backend

The API runs on a free tier that sleeps after inactivity, so a cold request can
take 30–50 seconds. Two mechanisms keep the site from ever rendering blank:

1. **`public/fallback.json`** — `npm run build` fetches a full content snapshot
   from `/public/snapshot` and bakes it into the bundle. If a live request
   fails, every query falls back to this file.
2. **Persisted React Query cache** — a returning visitor sees their cached
   content instantly while the network request is still in flight.

A subtle banner appears while snapshot content is being shown.

If the API is unreachable at build time the build still succeeds — it just
keeps the previous snapshot.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Snapshot content → Vite build → generate sitemap |
| `npm run build:only` | Vite build without the snapshot/sitemap steps |
| `npm run fallback` | Refresh `public/fallback.json` only |

## Deployment (Netlify)

`netlify.toml` handles the SPA redirect and asset caching. Set `VITE_API_URL`
and `VITE_SITE_URL` in the Netlify dashboard, and add the site origin to the
API's `CORS_ORIGINS`.

## Housekeeping still to do by hand

The sandbox could not delete files. Once you have verified the migration:

```bash
rm -f .DS_Store public/.DS_Store public/committee-2026/.DS_Store \
      public/committee-members/.DS_Store public/committee-members/2026/.DS_Store \
      public/members/.DS_Store
rm -rf src/services                      # after seed:verify passes
rm -f src/components/Executives.jsx \
      src/components/Executives/{TopLeaders,TopExecutives,OrganizingExecutives,OfficialExecutives,ExecutiveMembers}.jsx
```

Those component files are currently deprecation stubs re-exporting
`PositionGrid`, so nothing breaks either way.
