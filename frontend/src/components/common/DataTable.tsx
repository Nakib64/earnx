import React from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = 'No records found.',
  className = '',
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full space-y-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 text-sm font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-200 ${className}`}>
      <table className="w-full text-left text-[11px] sm:text-sm text-slate-600">
        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[9px] sm:text-[11px]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`p-2 sm:p-3.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((item, idx) => (
            <tr
              key={keyExtractor(item, idx)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-sky-50/70' : 'hover:bg-slate-50/80'}`}
            >
              {columns.map((col) => (
                <td
                  key={`${keyExtractor(item, idx)}-${col.key}`}
                  className={`p-1.5 sm:p-3.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                >
                  {col.render ? col.render(item, idx) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
