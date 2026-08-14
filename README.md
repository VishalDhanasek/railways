# NOMENCLATURE

Enterprise railway asset management console — coach & wagon nomenclature
alteration tracking and stores stocking application management.

## Stack

**Frontend:** React 19 · TypeScript · Tailwind CSS v4 · React Router v7 · ExcelJS · jsPDF + AutoTable
**Backend:** Node · Express · ExcelJS · **Vercel Blob** (data is stored in real `.xlsx` files —
just in Vercel's persistent blob storage instead of on local disk, so it works on Vercel's
serverless functions, which don't keep local files between requests)

## Deploying on Vercel

This project is built to deploy on Vercel as-is: `vercel.json` builds the Vite
frontend as static output, and `api/[...all].js` turns the Express app in
`server/index.js` into a single serverless function that handles every
`/api/*` request.

**One manual step required — connect a Blob store:**

1. In the Vercel dashboard, open your project → **Storage** tab → **Create Database** → **Blob**.
2. Connect it to the project. Vercel automatically adds a `BLOB_READ_WRITE_TOKEN`
   environment variable — you don't need to copy anything yourself.
3. Redeploy (or it'll pick up the token on the next deploy).

That's it — every create/edit/delete now durably persists as real `.xlsx`
files in that Blob store, survives page refreshes, cold starts, and
redeploys, and works from any number of concurrent serverless invocations
(they all talk to the same remote storage — nothing is on the function's
own local disk).

**Local development** needs the same token so it's hitting real storage
(there's no separate "local mode" — one code path, same as production):

```bash
npm i -g vercel        # if you don't have it already
vercel link            # links this folder to your Vercel project
vercel env pull .env.local
```

`server/index.js` loads `.env.local` automatically via `dotenv`. Without it,
API calls will fail with a clear "No blob credentials found" error rather
than silently doing nothing.

## Getting started

```bash
npm install
vercel env pull .env.local   # see above — one-time, needed before first run
npm run dev      # starts BOTH the frontend (Vite, :5173) and the API (Express, :4000)
npm run build    # type-check + production frontend build
npm start        # after building — one Express process serves the API + the built app
                  # (for self-hosting off Vercel; Vercel itself uses api/[...all].js instead)
```

`npm run dev` runs both processes together via `concurrently`. If you want them
separate (e.g. for debugging), use `npm run dev:client` and `npm run dev:server`
in two terminals.

Default login: **admin / Admin@123** (see [Login](#login) below — change this).

## Structure

```
src/
  types/         Shared domain types (AlterationRecord, StockingRecord, ...)
  data/          activityData.ts (empty seed for the in-memory activity feed),
                 trainPhotos.ts (login carousel)
  services/      Async CRUD + query functions — call the Express API below.
                 Filtering/sorting/pagination stay client-side against the
                 full list the API returns.
  context/       AuthContext (session), ToastContext (toast notifications)
  components/
    layout/      Sidebar, Header, Breadcrumbs, AppLayout, ProtectedRoute
    ui/          Reusable primitives (Table, Pagination, Modal, Drawer,
                 Button, Select, StatusBadge, ConfirmDialog, DropdownMenu, ...)
    dashboard/   StatCard, RecentActivity
    alteration/  AlterationTable + AlterationForm (shared by Coach & Wagon),
                 AttachmentUploader (Excel/PDF/Word/Image uploads on Remarks)
    stocking/    StockingForm, StockingViewModal, ExportButtons
  pages/         Route-level pages (incl. Login)
  utils/         formatters, exportExcel.ts, exportPdf.ts, downloadBlob.ts
server/
  index.js       Express app — REST API, see Backend below. Exported (not
                 `.listen()`-ing) when running under Vercel; runs as a
                 normal long-lived server otherwise (npm run dev:server / start).
  lib/
    excelStore.js  Generic read/mutate helper for an .xlsx-backed table,
                   stored in Vercel Blob (see Backend below)
api/
  [...all].js    Vercel serverless entry point — a catch-all that hands
                 every /api/* request to the same Express app above
public/
  credentials.xlsx   Login credentials workbook — see Login below
  images/trains/     Photos for the login page carousel — see Photo credits
```

## Backend

The Express app in `server/index.js` is the actual data store — every
create/update/delete goes through it, and it persists to a real `.xlsx`
file via `exceljs`, stored remotely in **Vercel Blob** (see
`server/lib/excelStore.js`) rather than on local disk. That's the detail
that makes this work as serverless functions: local files written by one
invocation wouldn't be visible to the next (different container, or the
same one after a cold start) — Blob storage is external to the function,
so every invocation sees the same data.

| Route | Backs onto (Blob pathname) |
|---|---|
| `GET/POST /api/alterations/:kind` | `data/{kind}-alterations.xlsx` |
| `PUT/DELETE /api/alterations/:kind/:id` | " |
| `POST/DELETE /api/alterations/:kind/:id/attachments[/:attachmentId]` | `uploads/{kind}/{id}/...` — attachment URLs point straight at Blob's public CDN |
| `GET/POST /api/stocking` | `data/stocking.xlsx` |
| `PUT/DELETE /api/stocking/:id` | " |

**Concurrency note:** each request is an isolated function invocation, so
there's no in-process lock the way a long-running server could have. Two
writes that land at almost the same instant can race (last write wins) —
an acceptable risk for a small internal tool's usage pattern, not a
substitute for a real database under heavy concurrent load.

Deleting a record removes its row and re-sequences `S.No.` for the rest,
same as before — deletion was already supported, it just wasn't durable
until the Blob-backed storage was added.

In dev, Vite proxies `/api` to `http://localhost:4000` (see
`vite.config.ts`) so the frontend can just call relative paths — same
paths work unchanged once deployed, since Vercel's own routing sends
`/api/*` to `api/[...all].js` there instead.

**Want to inspect or bulk-edit the data directly?** Download the blob from
the Storage tab in the Vercel dashboard (or `vercel blob list` /
`vercel blob download` via the CLI), edit it in Excel, then re-upload it to
the same pathname — just don't do this while the app is actively being
used, since a concurrent write from the app could get overwritten or
clobber your edit.

## Login

Sign-in is gated by **`public/credentials.xlsx`** — a workbook with columns
`Username | Password | Name | Role`. Open it in Excel to add, remove, or
change users; changes take effect immediately (no rebuild needed) since the
file is fetched at login time. This part is unrelated to the backend above —
it's still read directly by the browser, not through the Express API.

**Security note:** `credentials.xlsx` is a static file the browser fetches
and parses client-side — anyone who can reach the deployed app can also
download and read it (plaintext passwords included). Treat this as an
access gate for a trusted/internal tool, **not** real authentication. For
an internet-facing deployment, move credential checking into
`server/index.js` (which now exists) behind a real `/login` endpoint,
instead of `src/services/authService.ts` fetching the file client-side.

A session persists in `localStorage` until the user logs out.

## Photo credits

The login page carousel (`src/components/login/PhotoCarousel.tsx`,
`src/data/trainPhotos.ts`) uses real photographs from Wikimedia Commons,
each under a Creative Commons license:

- *Vande Bharat Express around Mumbai* — Harshul12345, CC BY-SA 4.0
- *WAP-7 class electric locomotive of Indian Railways* — Shan.H.Fernandes, CC BY-SA 3.0
- *Steam locomotive in India (loco pilot at the controls)* — Joost J. Bakker, CC BY 2.0
- *MGR Central Railway Station (Chennai Central)* — Yamuna D., CC BY-SA 4.0

**On-page attribution was intentionally removed** at the user's request —
there is currently no visible credit line anywhere in the running app, only
here in this README. CC BY / CC BY-SA technically require attribution "in
any reasonable manner," and a README in a private/internal tool is a
defensible place to keep it — but if this app is ever distributed or
deployed somewhere the license terms would be scrutinized, put a visible
credit back (even a small "ⓘ Credits" link) or swap in public-domain
images instead. If you change the photos, update the credits above and
the `credit` field in `trainPhotos.ts` to match.

## Notes

- The dashboard's "Recent Activity" feed is still in-memory client-side
  (resets on refresh) — only the actual business records (alterations,
  stocking) persist to Excel now. Give it its own `createExcelStore('data/activity-log.xlsx', ...)`
  and a couple of routes in `server/index.js` if you want that to persist too.
- Excel/PDF export libraries (`exceljs`, `jspdf`) and the login workbook
  parser are lazy-loaded on demand to keep the initial frontend bundle small.
