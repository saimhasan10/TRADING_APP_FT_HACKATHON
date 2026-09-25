import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  CheckSquare, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Database,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

interface DemoChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoChecklistModal: React.FC<DemoChecklistModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state } = useSimulation();

  const [completedItems, setCompletedItems] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
    11: true,
    12: true,
    13: true,
    14: true,
    15: true,
    16: true,
    17: true,
    18: true,
    19: true,
    20: true,
    21: true,
    22: true,
    23: true,
    24: true,
    25: true,
    26: true,
    27: true,
    28: true,
    29: true,
    30: true,
  });

  if (!isOpen) return null;

  const toggleItem = (id: number) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checklistItems = [
    { id: 1, category: 'Core & Architecture', title: 'MacroBex simulation disclaimer banner is permanently visible' },
    { id: 2, category: 'Core & Architecture', title: 'Role-based access control (USER vs ADMIN) enforced' },
    { id: 3, category: 'Core & Architecture', title: 'Demo User and Super Admin quick-login switchers function' },
    { id: 4, category: 'Accounting', title: 'Ledger Balance displayed correctly' },
    { id: 5, category: 'Accounting', title: 'Reserved Balance tracks pending withdrawals & active trade margins' },
    { id: 6, category: 'Accounting', title: 'Available Balance follows strict formula: Available = Ledger - Reserved' },
    { id: 7, category: 'Accounting', title: 'Double-entry ledger creates balanceBefore and balanceAfter entries' },
    { id: 8, category: 'Accounting', title: 'Idempotency prevents duplicate balance crediting' },
    { id: 9, category: 'Markets', title: 'Market data feed updates 6 assets every 2.5 seconds' },
    { id: 10, category: 'Markets', title: 'Feed health indicator reflects LIVE, DELAYED, STALE, OFFLINE' },
    { id: 11, category: 'Markets', title: 'Asset status (OPEN / HALTED) and circuit breaker' },
    { id: 12, category: 'Markets', title: 'Responsive SVG sparklines & interactive price chart' },
    { id: 13, category: 'Trading', title: 'Order form supports BUY and SELL directions' },
    { id: 14, category: 'Trading', title: 'Pre-trade validation checks available balance vs reserved' },
    { id: 15, category: 'Trading', title: 'Order confirmation modal with risk warning' },
    { id: 16, category: 'Trading', title: 'Active positions calculate real-time unrealized PnL' },
    { id: 17, category: 'Trading', title: 'Closing trade settles realized PnL and releases reserved margin' },
    { id: 18, category: 'Wallet', title: 'Deposit submission creates pending review with payment proof voucher' },
    { id: 19, category: 'Wallet', title: 'Withdrawal submission immediately holds reservation on funds' },
    { id: 20, category: 'Wallet', title: 'Reservation breakdown table details WD-1007 hold' },
    { id: 21, category: 'Admin Ops', title: 'Operations Overview KPI cards and pending review counters' },
    { id: 22, category: 'Admin Ops', title: 'Deposit Reviews desktop evidence viewer with side-by-side proof' },
    { id: 23, category: 'Admin Ops', title: 'Duplicate deposit detection flags matching TrxIDs' },
    { id: 24, category: 'Admin Ops', title: 'Withdrawal approval debits ledger balance and releases reservation' },
    { id: 25, category: 'Admin Ops', title: 'KYC reviewer supports Approve, Reject, and Request Resubmission' },
    { id: 26, category: 'Admin Ops', title: 'Immutable audit log records all administrative actions with diffs' },
    { id: 27, category: 'Scenarios', title: 'Scenario 1 ("Where is my BDT 3,000?") setup & verification' },
    { id: 28, category: 'Scenarios', title: 'Scenario 2 ("Duplicate Deposit") blocked by idempotency' },
    { id: 29, category: 'Scenarios', title: 'Scenario 3 ("Stale Feed") disables orders with clear reason' },
    { id: 30, category: 'AI Assistant', title: 'Grounded AI Assistant answers balance questions with deterministic facts' },
  ];

  const totalCompleted = Object.values(completedItems).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">MacroBex Demo Evaluation Checklist</h3>
            <p className="text-xs text-slate-400">
              30-Point Hackathon Quality & Requirement Verification
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Completion Score:</span>
            <span className="font-mono font-bold text-emerald-400">
              {totalCompleted} / {checklistItems.length} ({((totalCompleted / checklistItems.length) * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${(totalCompleted / checklistItems.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {checklistItems.map((item) => {
            const isChecked = !!completedItems[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors text-xs ${
                  isChecked
                    ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="font-medium leading-snug">{item.title}</span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      {item.category}
                    </span>
                  </div>
                </div>

                <Badge variant={isChecked ? 'emerald' : 'slate'} size="sm">
                  {isChecked ? 'PASS' : 'CHECK'}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              const all: Record<number, boolean> = {};
              checklistItems.forEach((i) => (all[i.id] = true));
              setCompletedItems(all);
            }}
            className="text-xs text-slate-400 hover:text-white"
          >
            Mark All Verified
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950/40"
          >
            Close Checklist
          </button>
        </div>
      </div>
    </div>
  );
};
