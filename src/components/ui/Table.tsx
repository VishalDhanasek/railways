import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import clsx from 'clsx';
import LoadingRows from './LoadingRows';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (key: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  footerRow?: ReactNode;
}

export default function Table<T>({
  columns,
  rows,
  rowKey,
  loading,
  sortKey,
  sortDirection,
  onSortChange,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  footerRow,
}: TableProps<T>) {
  const showEmpty = !loading && rows.length === 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={clsx(
                    'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(col.key)}
                      className={clsx(
                        'inline-flex items-center gap-1 hover:text-slate-700',
                        isSorted && 'text-brand-600',
                      )}
                    >
                      {col.header}
                      {isSorted ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 text-slate-300" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading && <LoadingRows columns={columns.length} />}
          {!loading &&
            rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      'px-4 py-3.5 align-middle text-slate-700',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
        {footerRow && !showEmpty && !loading && <tfoot>{footerRow}</tfoot>}
      </table>
      {showEmpty && <EmptyState title={emptyTitle} description={emptyDescription} />}
    </div>
  );
}
