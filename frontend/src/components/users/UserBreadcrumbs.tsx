'use client';

import React from 'react';
import { ArrowLeft, ChevronRight, Network } from 'lucide-react';

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
    <div className="bg-white/75 backdrop-blur-md border border-white/85 shadow-2xs rounded-2xl px-4 py-3 flex items-center space-x-2 text-xs overflow-x-auto select-none">
      <div className="flex items-center gap-1.5 text-slate-400 shrink-0 mr-1">
        <Network className="w-3.5 h-3.5 text-[#009F6B]" />
        <span className="font-semibold text-[11px] text-slate-500 uppercase tracking-wider">Hierarchy:</span>
      </div>

      {breadcrumbs.length > 1 && (
        <button
          onClick={() => onBreadcrumbClick(breadcrumbs.length - 2)}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold mr-1 flex items-center shrink-0 transition-colors cursor-pointer"
          title="Go Up One Level"
        >
          <ArrowLeft className="w-3 h-3 mr-1" />
          Up
        </button>
      )}

      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <React.Fragment key={crumb.id || 'root'}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            <button
              onClick={() => onBreadcrumbClick(idx)}
              className={`font-bold transition-colors shrink-0 px-2 py-0.5 rounded-lg ${
                isLast
                  ? 'bg-emerald-50 text-[#009F6B] border border-emerald-200/80 cursor-default'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
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
