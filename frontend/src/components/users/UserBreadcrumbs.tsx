'use client';

import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface UserBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (index: number) => void;
}

export function UserBreadcrumbs({ breadcrumbs, onBreadcrumbClick }: UserBreadcrumbsProps) {
  if (breadcrumbs.length <= 0) return null;

  return (
    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs overflow-x-auto">
      {breadcrumbs.length > 1 && (
        <button
          onClick={() => onBreadcrumbClick(breadcrumbs.length - 2)}
          className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 mr-1 flex items-center text-xs font-bold shrink-0"
          title="Go Back"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </button>
      )}

      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <React.Fragment key={crumb.id || 'root'}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            <button
              onClick={() => onBreadcrumbClick(idx)}
              className={`font-bold transition-colors shrink-0 ${
                isLast
                  ? 'text-sky-700 cursor-default font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 underline underline-offset-2'
              }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
