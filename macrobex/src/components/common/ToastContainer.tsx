import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSimulation();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-700/60 bg-slate-900/95',
          error: 'border-red-700/60 bg-slate-900/95',
          warning: 'border-amber-700/60 bg-slate-900/95',
          info: 'border-blue-700/60 bg-slate-900/95',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-slate-100">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
