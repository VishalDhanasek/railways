// ---------------------------------------------------------------------------
// Domain types for the NOMENCLATURE application.
// Kept independent of any transport (mock/local vs. future REST/GraphQL API)
// so the same shapes can be reused once a real backend is wired in.
// ---------------------------------------------------------------------------

export type AlterationStatus = 'Pending' | 'In Progress' | 'Completed' | 'On Hold';

/** Supported supporting-document formats for Nomenclature Alteration remarks. */
export type AttachmentFileType = 'pdf' | 'excel' | 'word' | 'image';

export interface Attachment {
  id: string;
  name: string;
  type: AttachmentFileType;
  size: number; // bytes
  /** Object URL — valid for the current session only (no backend storage). */
  url: string;
  uploadedAt: string; // ISO datetime
}

export type AssetKind = 'coach' | 'wagon';

/**
 * Nomenclature Alteration record — shared shape for both the Coach and
 * Wagon subsections: S.No., Date, TL. No., Description, Status, Remarks
 * (with supporting-document attachments).
 */
export interface AlterationRecord {
  id: string;
  sNo: number;
  kind: AssetKind;
  date: string; // ISO date (yyyy-mm-dd)
  tlNo: string; // TL. No.
  description: string;
  status: AlterationStatus;
  remarks: string;
  attachments: Attachment[];
}

export type NewAlterationRecord = Omit<AlterationRecord, 'id' | 'sNo' | 'kind' | 'attachments'>;

/** Coach/Wagon tag used on Stocking Application records. */
export type StockingAssetTag = 'Coach' | 'Wagon';

/** Unit of measure options for the Stocking Application "Unit" field. */
export const UNIT_OF_MEASURE_OPTIONS = ['Nos', 'Metres', 'Sq. Metres', 'Kg', 'Litres', 'Set', 'Pair'] as const;
export type UnitOfMeasure = (typeof UNIT_OF_MEASURE_OPTIONS)[number];

/** Stocking Application record — fields per the business reference sheet. */
export interface StockingRecord {
  id: string;
  sNo: number;
  dateReceived: string; // ISO date (yyyy-mm-dd)
  year: number;
  /** Coach / Wagon tag — placed immediately after Year. */
  cw: StockingAssetTag;
  yw: string;
  qForm: string;
  itemDescription: string;
  plNo: string;
  /** Numeric quantity field (formerly "Gear"). */
  ear: number;
  unit: number;
  unitOfMeasure: UnitOfMeasure;
  costPerItem: number;
  /** Derived: unit * costPerItem. Never edited directly. */
  totalValue: number;
  pendingWith: string;
  remarks: string;
}

export type NewStockingRecord = Omit<StockingRecord, 'id' | 'sNo' | 'totalValue'>;

export interface ActivityLogEntry {
  id: string;
  message: string;
  category: 'Coach' | 'Wagon' | 'Stocking';
  timestamp: string; // ISO datetime
}

export interface DashboardSummary {
  totalCoachAlterations: number;
  totalWagonAlterations: number;
  pendingAlterations: number;
  completedAlterations: number;
  totalStockingRecords: number;
  pendingStockingRecords: number;
}

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SortState<TKey extends string = string> {
  key: TKey;
  direction: 'asc' | 'desc';
}

export type AlterationSortKey = 'sNo' | 'date' | 'tlNo' | 'status';

export interface AlterationQuery {
  search?: string;
  status?: AlterationStatus | 'All';
  dateFrom?: string;
  dateTo?: string;
  sort?: SortState<AlterationSortKey>;
  page?: number;
  pageSize?: number;
}

export type StockingSortKey = 'sNo' | 'dateReceived' | 'year' | 'itemDescription' | 'totalValue';

export interface StockingPageResult extends PaginatedResult<StockingRecord> {
  /** Sum of totalValue across the *filtered* result set (not just the current page). */
  filteredTotalValue: number;
}

export interface StockingQuery {
  search?: string;
  year?: number | 'All';
  cw?: StockingAssetTag | 'All';
  qForm?: string | 'All';
  yw?: string | 'All';
  pendingWith?: string | 'All';
  dateFrom?: string;
  dateTo?: string;
  sort?: SortState<StockingSortKey>;
  page?: number;
  pageSize?: number;
}
