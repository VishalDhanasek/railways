# NOMENCLATURE

Enterprise railway asset management console — coach & wagon alteration status
tracking and stores stocking application management.

## Stack

React 19 · TypeScript · Tailwind CSS v4 · React Router v7 · ExcelJS · jsPDF + AutoTable

## Getting started

```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # type-check + production build
```

## Structure

```
src/
  types/         Shared domain types (AlterationRecord, StockingRecord, ...)
  data/          Deterministic sample/mock data
  services/      Async CRUD + query functions — swap internals for real API
                 calls later without touching any page/component
  context/       ToastContext (global toast notifications)
  components/
    layout/      Sidebar, Header, Breadcrumbs, AppLayout
    ui/          Reusable primitives (Table, Pagination, Modal, Drawer,
                 Button, Select, StatusBadge, ConfirmDialog, ...)
    dashboard/   StatCard, RecentActivity
    alteration/  Generic AlterationStatusReport (used by both Coach & Wagon)
    stocking/    StockingForm, StockingViewModal, ExportButtons
  pages/         Route-level pages
  utils/         formatters, exportExcel.ts, exportPdf.ts, downloadBlob.ts
```

## Connecting a real backend

Every function in `src/services/*.ts` is already `async` and returns plain
data shapes from `src/types`. To connect a real API, replace the in-memory
array logic inside each service file with `fetch`/`axios` calls — no changes
are needed in any page or component.

## Notes

- All data is in-memory (mock) and resets on page reload.
- Excel/PDF export libraries (`exceljs`, `jspdf`) are lazy-loaded on first
  export click to keep the initial bundle small.
