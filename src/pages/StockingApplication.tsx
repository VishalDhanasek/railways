import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RotateCcw, Eye, Pencil, Trash2 } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import SearchInput from '@/components/ui/SearchInput';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Table, { type Column } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { PendingWithBadge } from '@/components/ui/StatusBadge';
import StockingForm from '@/components/stocking/StockingForm';
import StockingViewModal from '@/components/stocking/StockingViewModal';
import ExportButtons from '@/components/stocking/ExportButtons';
import {
  queryStocking,
  getAllStocking,
  getFilteredStocking,
  createStocking,
  updateStocking,
  deleteStocking,
  getStockingFilterOptions,
  type StockingFilterOptions,
} from '@/services/stockingService';
import { formatCurrency, formatDate } from '@/utils/format';
import { useToast } from '@/context/ToastContext';
import type { NewStockingRecord, SortState, StockingAssetTag, StockingRecord, StockingSortKey, StockingQuery } from '@/types';

export default function StockingApplication() {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [year, setYear] = useState<string>('All');
  const [cw, setCw] = useState<StockingAssetTag | 'All'>('All');
  const [qForm, setQForm] = useState<string>('All');
  const [yw, setYw] = useState<string>('All');
  const [pendingWith, setPendingWith] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<SortState<StockingSortKey>>({ key: 'dateReceived', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [rows, setRows] = useState<StockingRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [filteredTotalValue, setFilteredTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [allCount, setAllCount] = useState(0);
  // When true, the next fetch is a background reconciliation (after an
  // optimistic local update already showed the change) — skip the loading
  // skeleton so it doesn't flash over a table that's already correct.
  const silentRef = useRef(false);
  const scheduleReconcile = () => {
    setTimeout(() => {
      silentRef.current = true;
      setRefreshTick((t) => t + 1);
    }, 3000);
  };

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StockingRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<StockingRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<StockingRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [filterOptionsRaw, setFilterOptionsRaw] = useState<StockingFilterOptions>({
    years: [],
    cws: [],
    qForms: [],
    yws: [],
    pendingWiths: [],
  });
  useEffect(() => {
    let cancelled = false;
    getStockingFilterOptions().then((opts) => !cancelled && setFilterOptionsRaw(opts));
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const filterOptions = useMemo(
    () => ({
      years: ['All', ...filterOptionsRaw.years.map(String)],
      cws: ['All', ...filterOptionsRaw.cws],
      qForms: ['All', ...filterOptionsRaw.qForms],
      yws: ['All', ...filterOptionsRaw.yws],
      pendingWiths: ['All', ...filterOptionsRaw.pendingWiths],
    }),
    [filterOptionsRaw],
  );

  const currentQuery: StockingQuery = useMemo(
    () => ({
      search,
      year: year === 'All' ? 'All' : Number(year),
      cw,
      qForm,
      yw,
      pendingWith,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sort,
    }),
    [search, year, cw, qForm, yw, pendingWith, dateFrom, dateTo, sort],
  );

  useEffect(() => {
    setPage(1);
  }, [search, year, cw, qForm, yw, pendingWith, dateFrom, dateTo]);

  useEffect(() => {
    let cancelled = false;
    const isSilent = silentRef.current;
    silentRef.current = false;
    if (!isSilent) setLoading(true);
    const t = setTimeout(
      () => {
        queryStocking({ ...currentQuery, page, pageSize }).then((res) => {
          if (cancelled) return;
          setRows(res.rows);
          setTotal(res.total);
          setFilteredTotalValue(res.filteredTotalValue);
          setLoading(false);
        });
        getAllStocking().then((all) => !cancelled && setAllCount(all.length));
      },
      isSilent ? 0 : 200,
    );
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuery, page, pageSize, refreshTick]);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key: key as StockingSortKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: key as StockingSortKey, direction: 'asc' },
    );
  };

  const clearFilters = () => {
    setSearch('');
    setYear('All');
    setCw('All');
    setQForm('All');
    setYw('All');
    setPendingWith('All');
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = !!search || year !== 'All' || cw !== 'All' || qForm !== 'All' || yw !== 'All' || pendingWith !== 'All' || !!dateFrom || !!dateTo;

  const openAddForm = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };
  const openEditForm = (record: StockingRecord) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: NewStockingRecord) => {
    if (editingRecord) {
      const updated = await updateStocking(editingRecord.id, data);
      showToast('Stocking entry updated successfully.', 'success');
      // Optimistic: this record is already on screen — patch it in place
      // rather than waiting on a fresh (possibly still-propagating) read.
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setFilteredTotalValue((prev) => prev - editingRecord.totalValue + updated.totalValue);
    } else {
      const created = await createStocking(data);
      showToast('Stocking entry added successfully.', 'success');
      // Optimistic: show it immediately on page 1 (where a new, newest-first
      // entry belongs by default); other pages just get the reconciliation
      // fetch below since we can't know where it'd sort into those.
      if (page === 1) setRows((prev) => [created, ...prev].slice(0, pageSize));
      setTotal((prev) => prev + 1);
      setAllCount((prev) => prev + 1);
      setFilteredTotalValue((prev) => prev + created.totalValue);
    }
    // The backend persists to Vercel Blob, which can take a moment to
    // reflect a write on a fresh read — reconcile quietly in the background
    // (exact S.No./total/sort position) without blocking what's already shown.
    scheduleReconcile();
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setDeleting(true);
    try {
      await deleteStocking(deletingRecord.id);
      showToast('Stocking entry deleted.', 'success');
      // Optimistic: remove it right away — always correct, since we know
      // exactly which visible row is gone.
      setRows((prev) => prev.filter((r) => r.id !== deletingRecord.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setAllCount((prev) => Math.max(0, prev - 1));
      setFilteredTotalValue((prev) => prev - deletingRecord.totalValue);
      setDeletingRecord(null);
      scheduleReconcile();
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<StockingRecord>[] = [
    { key: 'sNo', header: 'S.No.', width: '60px', render: (r) => r.sNo },
    { key: 'dateReceived', header: 'Date Received', sortable: true, render: (r) => formatDate(r.dateReceived) },
    { key: 'year', header: 'Year', sortable: true, align: 'center', render: (r) => r.year },
    { key: 'cw', header: 'C/W', align: 'center', render: (r) => r.cw },
    { key: 'yw', header: 'YW', render: (r) => r.yw },
    { key: 'qForm', header: 'Q-Form', render: (r) => r.qForm },
    { key: 'itemDescription', header: 'Item Description', sortable: true, width: '220px', render: (r) => <span className="font-medium text-slate-800">{r.itemDescription}</span> },
    { key: 'plNo', header: 'PL No.', render: (r) => r.plNo },
    { key: 'ear', header: 'EAR', align: 'right', render: (r) => r.ear },
    { key: 'unit', header: 'Unit', align: 'right', render: (r) => `${r.unit} ${r.unitOfMeasure}` },
    { key: 'costPerItem', header: 'Cost/Item', align: 'right', render: (r) => formatCurrency(r.costPerItem) },
    { key: 'totalValue', header: 'Total Value', sortable: true, align: 'right', render: (r) => <span className="font-semibold text-slate-800">{formatCurrency(r.totalValue)}</span> },
    { key: 'pendingWith', header: 'Pending With', render: (r) => <PendingWithBadge value={r.pendingWith} /> },
    { key: 'remarks', header: 'Remarks', width: '200px', render: (r) => <span className="text-slate-500">{r.remarks || '—'}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (r) => (
        <div className="flex items-center justify-center gap-1">
          <button type="button" onClick={() => setViewingRecord(r)} aria-label="View" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600">
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => openEditForm(r)} aria-label="Edit" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setDeletingRecord(r)} aria-label="Delete" className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const footerRow = (
    <tr className="bg-slate-50">
      <td colSpan={11} className="px-4 py-3 text-right text-[13px] font-semibold text-slate-600">
        TOTAL VALUE (filtered)
      </td>
      <td className="px-4 py-3 text-right text-[15px] font-bold text-brand-700">{formatCurrency(filteredTotalValue)}</td>
      <td colSpan={3} />
    </tr>
  );

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Stocking Application' }]} />
      <PageHeader
        title="Stocking Application"
        description="Manage stores stocking records with automatic total value calculation"
        actions={
          <>
            <ExportButtons
              allCount={allCount}
              filteredCount={total}
              getAllRecords={getAllStocking}
              getFilteredRecords={() => getFilteredStocking(currentQuery)}
            />
            <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openAddForm}>
              Add Stocking Entry
            </Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SearchInput value={search} onChange={setSearch} placeholder="Search item, PL no., remarks…" className="lg:w-80" />
            <div className="flex flex-wrap items-center gap-2">
              <Select className="w-28" value={year} onChange={(e) => setYear(e.target.value)} options={filterOptions.years.map((y) => ({ label: y === 'All' ? 'All Years' : y, value: y }))} />
              <Select className="w-28" value={cw} onChange={(e) => setCw(e.target.value as StockingAssetTag | 'All')} options={filterOptions.cws.map((c) => ({ label: c === 'All' ? 'All C/W' : c, value: c }))} />
              <Select className="w-32" value={qForm} onChange={(e) => setQForm(e.target.value)} options={filterOptions.qForms.map((q) => ({ label: q === 'All' ? 'All Q-Forms' : q, value: q }))} />
              <Select className="w-32" value={yw} onChange={(e) => setYw(e.target.value)} options={filterOptions.yws.map((w) => ({ label: w === 'All' ? 'All YW' : w, value: w }))} />
              <Select className="w-44" value={pendingWith} onChange={(e) => setPendingWith(e.target.value)} options={filterOptions.pendingWiths.map((p) => ({ label: p === 'All' ? 'All Pending With' : p, value: p }))} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Date Received:</span>
            <Input type="date" className="w-[150px]" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span className="text-xs text-slate-400">to</span>
            <Input type="date" className="w-[150px]" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            {hasFilters && (
              <Button variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <Table
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          loading={loading}
          sortKey={sort.key}
          sortDirection={sort.direction}
          onSortChange={handleSort}
          emptyTitle="No stocking records found"
          emptyDescription="Try adjusting your search or filters, or add a new stocking entry."
          footerRow={footerRow}
        />

        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
      </Card>

      <StockingForm open={formOpen} record={editingRecord} onClose={() => setFormOpen(false)} onSubmit={handleFormSubmit} />
      <StockingViewModal record={viewingRecord} onClose={() => setViewingRecord(null)} />
      <ConfirmDialog
        open={!!deletingRecord}
        title="Delete Stocking Entry"
        message={`Are you sure you want to delete "${deletingRecord?.itemDescription}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRecord(null)}
      />
    </div>
  );
}
