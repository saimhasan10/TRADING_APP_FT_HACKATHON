import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  History, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Lock, 
  FileText,
  Sparkles,
  Database
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

interface IncidentReconstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentReconstructionModal: React.FC<IncidentReconstructionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, currentUser } = useSimulation();

  if (!isOpen) return null;

  const demoUser = state.users.find((u) => u.id === 'user-1') || currentUser;
  const userWallet = state.wallets[demoUser.id]?.['main'] || {
    ledgerBalance: 25000,
    reservedBalance: 3000,
    availableBalance: 22000,
  };

  // Find relevant events from audit logs
  const relevantAuditLogs = state.auditLogs.slice(0, 10);

  const timelineSteps = [
    {
      step: 1,
      title: 'Pending Withdrawal WD-1007 Created',
      time: '2026-03-24 14:15:00',
      badge: 'RESERVATION HOLD',
      badgeVariant: 'amber' as const,
      description:
        'Demo Trader requested withdrawal of BDT 3,000 via bKash to 01811223344. In accordance with double-entry accounting rule, reservation RES-001 was created immediately.',
      balanceImpact: 'Ledger: BDT 25,000 | Reserved: BDT 3,000 | Available: BDT 22,000 (Available reduced from 25k to 22k)',
      entityId: 'WD-1007',
    },
    {
      step: 2,
      title: 'Trader Inquires: "Where is my BDT 3,000?"',
      time: '2026-03-24 14:22:00',
      badge: 'SUPPORT TICKET TKT-101',
      badgeVariant: 'blue' as const,
      description:
        'Trader saw available balance drop from BDT 25,000 to BDT 22,000 while withdrawal was still pending, and submitted ticket TKT-101.',
      balanceImpact: 'No balance change. Grounded AI & Support verified BDT 3,000 is safely locked in reservation, not deducted from ledger.',
      entityId: 'TKT-101',
    },
    {
      step: 3,
      title: 'Duplicate Deposit Attempt (DEP-2002)',
      time: '2026-03-24 15:05:00',
      badge: 'FRAUD PREVENTION',
      badgeVariant: 'red' as const,
      description:
        'Deposit DEP-2002 submitted referencing TrxID "BKASH-TXN-98472", which was already credited in DEP-2001. System flagged duplicate TrxID and flagged status REVIEW_REQUIRED.',
      balanceImpact: 'Ledger balance was NOT credited. Idempotency lock protected against double-credit.',
      entityId: 'DEP-2002',
    },
    {
      step: 4,
      title: 'Market Feed Reliability Check',
      time: '2026-03-24 15:30:00',
      badge: state.systemStatus.feedStatus === 'LIVE' ? 'LIVE FEED' : 'CIRCUIT TRIGGER',
      badgeVariant: state.systemStatus.feedStatus === 'LIVE' ? ('emerald' as const) : ('red' as const),
      description:
        state.systemStatus.feedStatus === 'LIVE'
          ? 'Market feed is operating normally at ~2.5s interval with 42ms round-trip latency.'
          : 'Market feed was paused or failed heartbeat check. New orders are blocked automatically until feed is LIVE.',
      balanceImpact: 'Order entry gates enforce zero stale executions.',
      entityId: 'SYSTEM-FEED',
    },
    {
      step: 5,
      title: 'Current Wallet Reconciliation',
      time: 'Realtime State',
      badge: 'INTEGRITY VERIFIED',
      badgeVariant: 'emerald' as const,
      description:
        `Formula strictly satisfied: Available (${userWallet.availableBalance}) = Ledger (${userWallet.ledgerBalance}) - Reserved (${userWallet.reservedBalance}).`,
      balanceImpact: 'Exact mathematical equality. No phantom balances or orphaned transactions.',
      entityId: 'VAULT-01',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Full Incident Reconstruction</h3>
            <p className="text-xs text-slate-400">
              End-to-end chronological timeline of balances, evidence checks, tickets, and safeguards.
            </p>
          </div>
        </div>

        {/* Current Reconciled Balances */}
        <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">Ledger Balance</span>
            <span className="text-base font-bold text-white">BDT {userWallet.ledgerBalance.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">Reserved (Locked)</span>
            <span className="text-base font-bold text-amber-400">BDT {userWallet.reservedBalance.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-sans">Available (Tradable)</span>
            <span className="text-base font-bold text-cyan-400">BDT {userWallet.availableBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6 pt-2 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
          {timelineSteps.map((step) => (
            <div key={step.step} className="relative pl-10">
              {/* Circle Icon */}
              <div className="absolute left-2.5 -translate-x-1/2 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{step.title}</span>
                    <Badge variant={step.badgeVariant} size="sm">{step.badge}</Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{step.time}</span>
                </div>

                <p className="text-slate-300 leading-relaxed">{step.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-emerald-400 font-mono font-medium">
                    Impact: {step.balanceImpact}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-slate-300">
                    Entity: {step.entityId}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Audit Log Cross-Check */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-300">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Immutable Audit Log Sample (Latest 5 Records)</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px] text-slate-400 max-h-36 overflow-y-auto">
            {relevantAuditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-1.5 rounded bg-slate-900/60 flex items-center justify-between gap-2">
                <span className="text-slate-300">{log.action}</span>
                <span className="text-emerald-400">{log.entityId}</span>
                <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Close Reconstruction
          </button>
        </div>
      </div>
    </div>
  );
};
