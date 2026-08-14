# NOMENCLATURE

Enterprise railway asset management console — coach & wagon nomenclature
alteration tracking and stores stocking application management.

## Stack

React 19 · TypeScript · Tailwind CSS v4 · React Router v7 · ExcelJS · jsPDF + AutoTable

## Getting started

```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # type-check + production build
```

Default login: **admin / Admin@123** (see [Login](#login) below — change this).

## Structure

```
src/
  types/         Shared domain types (AlterationRecord, StockingRecord, ...)
  data/          Seed data for the in-memory stores — empty by default (no dummy data)
  services/      Async CRUD + query functions — swap internals for real API
                 calls later without touching any page/component
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
public/
  credentials.xlsx   Login credentials workbook — see below
  images/trains/     Photos for the login page carousel — see Photo credits
```

## Login

Sign-in is gated by **`public/credentials.xlsx`** — a workbook with columns
`Username | Password | Name | Role`. Open it in Excel to add, remove, or
change users; changes take effect immediately (no rebuild needed) since the
file is fetched at login time.

**Security note:** this app has no backend, so `credentials.xlsx` is a
static file the browser fetches and parses client-side — anyone who can
reach the deployed app can also download and read it (plaintext passwords
included). Treat this as an access gate for a trusted/internal tool, **not**
real authentication. For an internet-facing deployment, replace
`src/services/authService.ts` with calls to a real backend `/login` endpoint
that keeps the credential store server-side.

A session persists in `localStorage` until the user logs out.

## Connecting a real backend

Every function in `src/services/*.ts` (except `authService.ts`, see above)
is already `async` and returns plain data shapes from `src/types`. To
connect a real API, replace the in-memory array logic inside each service
file with `fetch`/`axios` calls — no changes are needed in any page or
component.

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

- Business data (alterations, stocking records, activity log) is in-memory
  and resets on page reload — `src/data/*.ts` seed arrays are intentionally
  empty; add rows there or wire up a real API to persist data.
- Excel/PDF export libraries (`exceljs`, `jspdf`) and the login workbook
  parser are lazy-loaded on demand to keep the initial bundle small.
