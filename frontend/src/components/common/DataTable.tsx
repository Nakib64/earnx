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
      <div className="w-full space-y-2 p-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-none" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-xs font-medium border border-dashed border-slate-200 rounded-none bg-slate-50/50">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-none border border-slate-200 ${className}`}>
      <table className="w-full text-left text-[10px] sm:text-[11px] text-slate-600">
        <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200 uppercase tracking-wider text-[9px] sm:text-[10px]">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={`px-3 py-2.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''} ${idx >= 3 ? 'hidden lg:table-cell' : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white font-medium">
          {data.map((item, idx) => (
            <tr
              key={keyExtractor(item, idx)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-emerald-50/40' : 'hover:bg-slate-50/80'}`}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={`${keyExtractor(item, idx)}-${col.key}`}
                  className={`px-3 py-2 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''} ${colIdx >= 3 ? 'hidden lg:table-cell' : ''}`}
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
