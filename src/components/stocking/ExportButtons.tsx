import { FileSpreadsheet, FileText, ChevronDown, Layers, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';
import DropdownMenu from '@/components/ui/DropdownMenu';
import { useToast } from '@/context/ToastContext';
import type { StockingRecord } from '@/types';

interface ExportButtonsProps {
  allCount: number;
  filteredCount: number;
  getAllRecords: () => Promise<StockingRecord[]>;
  getFilteredRecords: () => Promise<StockingRecord[]>;
}

export default function ExportButtons({ allCount, filteredCount, getAllRecords, getFilteredRecords }: ExportButtonsProps) {
  const { showToast } = useToast();

  const runExport = async (
    format: 'Excel' | 'PDF',
    scope: 'All' | 'Filtered',
    fetchRecords: () => Promise<StockingRecord[]>,
  ) => {
    const records = await fetchRecords();
    if (records.length === 0) {
      showToast('No stocking records available for export.', 'error');
      return;
    }
    try {
      if (format === 'Excel') {
        const { exportStockingToExcel } = await import('@/utils/exportExcel');
        await exportStockingToExcel(records);
      } else {
        const { exportStockingToPdf } = await import('@/utils/exportPdf');
        exportStockingToPdf(records);
      }
      showToast(`${scope} records exported to ${format} successfully (${records.length} records).`, 'success');
    } catch {
      showToast(`${format} export failed. Please try again.`, 'error');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu
        trigger={({ toggle }) => (
          <Button variant="outline" size="sm" icon={<FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />} onClick={toggle}>
            Export Excel
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </Button>
        )}
        items={[
          {
            label: `Export All (${allCount})`,
            icon: <Layers className="h-3.5 w-3.5 text-slate-400" />,
            onClick: () => runExport('Excel', 'All', getAllRecords),
          },
          {
            label: `Export Filtered (${filteredCount})`,
            icon: <Filter className="h-3.5 w-3.5 text-slate-400" />,
            onClick: () => runExport('Excel', 'Filtered', getFilteredRecords),
          },
        ]}
      />

      <DropdownMenu
        trigger={({ toggle }) => (
          <Button variant="outline" size="sm" icon={<FileText className="h-3.5 w-3.5 text-red-500" />} onClick={toggle}>
            Export PDF
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </Button>
        )}
        items={[
          {
            label: `Export All (${allCount})`,
            icon: <Layers className="h-3.5 w-3.5 text-slate-400" />,
            onClick: () => runExport('PDF', 'All', getAllRecords),
          },
          {
            label: `Export Filtered (${filteredCount})`,
            icon: <Filter className="h-3.5 w-3.5 text-slate-400" />,
            onClick: () => runExport('PDF', 'Filtered', getFilteredRecords),
          },
        ]}
      />
    </div>
  );
}
