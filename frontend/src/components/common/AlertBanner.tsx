import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface AlertBannerProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
  onClose?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  message,
  className = '',
  onClose,
}) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 icon-emerald-600',
    error: 'bg-rose-50 text-rose-800 border-rose-200 icon-rose-600',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 icon-amber-600',
    info: 'bg-sky-50 text-sky-800 border-sky-200 icon-sky-600',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  return (
    <div
      className={`p-4 rounded-xl border flex items-center justify-between space-x-3 text-sm font-medium ${styles[type]} ${className}`}
    >
      <div className="flex items-center space-x-3">
        {icons[type]}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-sm font-bold ml-2"
        >
          ✕
        </button>
      )}
    </div>
  );
};
