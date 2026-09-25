import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'emerald' | 'red' | 'amber' | 'purple';
  riskWarning?: string;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  confirmVariant = 'emerald',
  riskWarning,
  children,
}) => {
  if (!isOpen) return null;

  const btnStyles = {
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40',
    red: 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40',
    amber: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40',
    purple: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">{description}</p>

        {riskWarning && (
          <div className="p-3.5 mb-4 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold block text-amber-200">Pre-Execution Risk Notice:</strong>
              {riskWarning}
            </div>
          </div>
        )}

        {children && <div className="mb-5">{children}</div>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 text-sm font-semibold rounded-xl shadow-lg transition-all ${btnStyles[confirmVariant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
