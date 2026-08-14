import { useEffect, useMemo, useState } from 'react';
import { Plus, RotateCcw, Pencil, Trash2, Paperclip } from 'lucide-react';
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
import { StatusBadge } from '@/components/ui/StatusBadge';
import WagonForm from './WagonForm';
import { queryWagonAlterations, createWagonAlteration, updateWagonAlteration, deleteWagonAlteration } from '@/services/alterationService';
import { formatDate } from '@/utils/format';
import { useToast } from '@/context/ToastContext';
import type { AlterationStatus, NewWagonAlterationRecord, SortState, WagonAlterationRecord, WagonAlterationSortKey } from '@/types';

const STATUS_OPTIONS: (AlterationStatus | 'All')[] = ['All', 'Pending', 'In Progress', 'Completed', 'On Hold'];

export default function WagonAlterationTable() {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AlterationStatus | 'All'>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<SortState<WagonAlterationSortKey>>({ key: 'date', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [rows, setRows] = useState<WagonAlterationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WagonAlterationRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<WagonAlterationRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const query = useMemo(
    () => ({ search, status, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, sort }),
    [search, status, dateFrom, dateTo, sort],
  );

  useEffect(() => {
    setPage(1);
  }, [search, status, dateFrom, dateTo]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      queryWagonAlterations({ ...query, page, pageSize }).then((res) => {
        if (cancelled) return;
        setRows(res.rows);
        setTotal(res.total);
        setLoading(false);
        // Keep the drawer's attachment list in sync with the freshly fetched row.
        setEditingRecord((current) => (current ? res.rows.find((r) => r.id === current.id) ?? current : current));
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page, pageSize, refreshTick]);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key: key as WagonAlterationSortKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: key as WagonAlterationSortKey, direction: 'asc' },
    );
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('All');
    setDateFrom('');
    setDateTo('');
  };
  const hasFilters = !!search || status !== 'All' || !!dateFrom || !!dateTo;

  const openAdd = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };
  const openEdit = (record: WagonAlterationRecord) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleSubmit = async (data: NewWagonAlterationRecord) => {
    if (editingRecord) {
      const updated = await updateWagonAlteration(editingRecord.id, data);
      setEditingRecord(updated);
      showToast('Wagon alteration updated successfully.', 'success');
    } else {
      await createWagonAlteration(data);
      showToast('Wagon alteration added successfully.', 'success');
    }
    setRefreshTick((t) => t + 1);
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setDeleting(true);
    try {
      await deleteWagonAlteration(deletingRecord.id);
      showToast('Wagon alteration deleted.', 'success');
      setDeletingRecord(null);
      setRefreshTick((t) => t + 1);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<WagonAlterationRecord>[] = [
    { key: 'sNo', header: 'S.No.', width: '64px', render: (r) => r.sNo },
    { key: 'date', header: 'Date', sortable: true, width: '120px', render: (r) => formatDate(r.date) },
    { key: 'tlNo', header: 'TL. No.', sortable: true, width: '180px', render: (r) => <span className="font-medium text-slate-800">{r.tlNo}</span> },
    { key: 'description', header: 'Description', width: '240px', render: (r) => <span className="text-slate-600">{r.description}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'remarks',
      header: 'Remarks',
      width: '260px',
      render: (r) => (
        <button
          type="button"
          onClick={() => openEdit(r)}
          className="group flex w-full items-start gap-1.5 text-left"
          title="Click to edit remarks or manage supporting documents"
        >
          <span className="min-w-0 flex-1 text-slate-500 group-hover:text-slate-700">{r.remarks || '—'}</span>
          {r.attachments.length > 0 && (
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-600">
              <Paperclip className="h-3 w-3" />
              {r.attachments.length}
            </span>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      width: '90px',
      render: (r) => (
        <div className="flex items-center justify-center gap-1">
          <button type="button" onClick={() => openEdit(r)} aria-label="Edit" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setDeletingRecord(r)} aria-label="Delete" className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Nomenclature Alteration', to: '/alteration' }, { label: 'Wagon' }]} />
      <PageHeader
        title="Wagon"
        description="Nomenclature alteration register for wagons"
        actions={
          <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openAdd}>
            Add Wagon Alteration
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search TL. No., description, remarks…" className="lg:w-80" />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              className="w-36"
              value={status}
              onChange={(e) => setStatus(e.target.value as AlterationStatus | 'All')}
              options={STATUS_OPTIONS.map((s) => ({ label: s === 'All' ? 'All Statuses' : s, value: s }))}
            />
            <Input type="date" className="w-[150px]" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span className="text-xs text-slate-400">to</span>
            <Input type="date" className="w-[150px]" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            {hasFilters && (
              <Button variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={clearFilters}>
                Clear
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
          emptyTitle="No wagon alteration records found"
          emptyDescription="Try adjusting your search, status or date filters, or add a new entry."
        />

        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
      </Card>

      <WagonForm
        open={formOpen}
        record={editingRecord}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        onAttachmentsChanged={() => setRefreshTick((t) => t + 1)}
      />
      <ConfirmDialog
        open={!!deletingRecord}
        title="Delete Wagon Alteration"
        message={`Are you sure you want to delete TL. No. "${deletingRecord?.tlNo}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRecord(null)}
      />
    </div>
  );
}
