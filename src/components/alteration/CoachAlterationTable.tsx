import { useEffect, useState } from 'react';
import { Plus, RotateCcw, Pencil, Trash2 } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import SearchInput from '@/components/ui/SearchInput';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Table, { type Column } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CoachForm from './CoachForm';
import { queryCoachAlterations, createCoachAlteration, updateCoachAlteration, deleteCoachAlteration } from '@/services/alterationService';
import { formatDate } from '@/utils/format';
import { useToast } from '@/context/ToastContext';
import type { CoachAlterationRecord, CoachAlterationSortKey, NewCoachAlterationRecord, SortState } from '@/types';

export default function CoachAlterationTable() {
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<SortState<CoachAlterationSortKey>>({ key: 'date', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [rows, setRows] = useState<CoachAlterationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CoachAlterationRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<CoachAlterationRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, dateFrom, dateTo]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      queryCoachAlterations({ search, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, sort, page, pageSize }).then((res) => {
        if (cancelled) return;
        setRows(res.rows);
        setTotal(res.total);
        setLoading(false);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search, dateFrom, dateTo, sort, page, pageSize, refreshTick]);

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key: key as CoachAlterationSortKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: key as CoachAlterationSortKey, direction: 'asc' },
    );
  };

  const clearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
  };
  const hasFilters = !!search || !!dateFrom || !!dateTo;

  const openAdd = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };
  const openEdit = (record: CoachAlterationRecord) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleSubmit = async (data: NewCoachAlterationRecord) => {
    if (editingRecord) {
      await updateCoachAlteration(editingRecord.id, data);
      showToast('Coach alteration updated successfully.', 'success');
    } else {
      await createCoachAlteration(data);
      showToast('Coach alteration added successfully.', 'success');
    }
    setRefreshTick((t) => t + 1);
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setDeleting(true);
    try {
      await deleteCoachAlteration(deletingRecord.id);
      showToast('Coach alteration deleted.', 'success');
      setDeletingRecord(null);
      setRefreshTick((t) => t + 1);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<CoachAlterationRecord>[] = [
    { key: 'sNo', header: 'S.No.', width: '72px', render: (r) => r.sNo },
    { key: 'date', header: 'Date', sortable: true, width: '140px', render: (r) => formatDate(r.date) },
    { key: 'tlNo', header: 'TL. No.', sortable: true, width: '190px', render: (r) => <span className="font-medium text-slate-800">{r.tlNo}</span> },
    { key: 'description', header: 'Description', render: (r) => <span className="text-slate-600">{r.description}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      width: '110px',
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
      <Breadcrumbs items={[{ label: 'Nomenclature Alteration', to: '/alteration' }, { label: 'Coach' }]} />
      <PageHeader
        title="Coach"
        description="Nomenclature alteration register for coaches"
        actions={
          <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openAdd}>
            Add Coach Alteration
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search TL. No. or description…" className="lg:w-80" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Date:</span>
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
          emptyTitle="No coach alteration records found"
          emptyDescription="Try adjusting your search or date filters, or add a new entry."
        />

        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
      </Card>

      <CoachForm open={formOpen} record={editingRecord} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />
      <ConfirmDialog
        open={!!deletingRecord}
        title="Delete Coach Alteration"
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
