# somoyon-admin

Bengali-first admin panel for the সময়ন CMS. React 18 + TypeScript + Vite.

> **This is a separate repository.** Move it out of the public-site folder and
> `git init` it before pushing.

## Quick start

```bash
cp .env.example .env      # VITE_API_URL=http://localhost:4000/api/v1
npm install
npm run dev               # http://localhost:5174
```

Log in with the account created by the API's `npm run seed:admin`. You will be
forced to change the password on first login.

## Why it is a separate app

The public site loads on slow mobile connections. The admin panel needs heavy
dependencies — data tables, a rich-text editor, drag-and-drop, charts — that
visitors should never have to download. Keeping them apart keeps the public
bundle small.

## Screens

| Route | Purpose |
|---|---|
| `/` | Dashboard — counts, members-per-year chart, recent activity |
| `/committees` | Year list · **নতুন বছরের কমিটি তৈরি করুন** (clone) |
| `/committees/:id` | Tabbed by group, drag-to-reorder, per-year photo override |
| `/people` | Person directory + duplicate merge tool |
| `/designations` | Bengali/English title lookup table |
| `/advisors` | Drag-to-reorder advisory board |
| `/gallery`, `/gallery/:id` | Albums, bulk upload, featured toggle |
| `/events`, `/posts` | Rich-text content with draft/publish |
| `/media` | Media library with usage counts before deletion |
| `/settings` | All site copy, logos, contact, donation, menu, SEO |
| `/inbox` | Contact-form submissions |
| `/users` | Admin accounts and roles (SUPER_ADMIN only) |
| `/audit` | Full activity log |

## Security notes

- The access token lives **in memory only** — never `localStorage`. A page
  reload silently re-authenticates from the httpOnly refresh cookie.
- Image uploads go **directly from the browser to Cloudinary** using a one-shot
  signature from the API. The API secret never reaches the client, and the API
  re-verifies each `public_id` against Cloudinary before storing it.
- `robots.txt` and `X-Robots-Tag` keep the panel out of search results.

## Deployment (Netlify)

`netlify.toml` is ready. Set `VITE_API_URL` (and optionally
`VITE_PUBLIC_SITE_URL`) in the Netlify dashboard. Add the deployed admin origin
to the API's `CORS_ORIGINS`.
