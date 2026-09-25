import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Users, 
  Wallet, 
  Lock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileCheck, 
  LifeBuoy, 
  Radio, 
  Sliders, 
  History, 
  CheckSquare, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { IncidentReconstructionModal } from './IncidentReconstructionModal';
import { DemoChecklistModal } from './DemoChecklistModal';

export const AdminOverviewView: React.FC = () => {
  const { state, currentUser, setActiveAdminTab } = useSimulation();

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Platform aggregates
  let totalLedger = 0;
  let totalReserved = 0;
  Object.values(state.wallets).forEach((uw) => {
    totalLedger += (uw.main?.ledgerBalance || 0) + (uw.demo?.ledgerBalance || 0);
    totalReserved += (uw.main?.reservedBalance || 0) + (uw.demo?.reservedBalance || 0);
  });

  const pendingDeposits = state.deposits.filter((d) => d.status === 'REVIEW_REQUIRED' || d.status === 'PENDING').length;
  const pendingWithdrawals = state.withdrawals.filter((w) => w.status === 'PENDING').length;
  const pendingKYC = state.verifications.filter((v) => v.status === 'PENDING').length;
  const openTickets = state.tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_REVIEW').length;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Operations Command Center</h1>
            <Badge variant="purple" size="sm">SUPER ADMIN CONSOLE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Realtime compliance, treasury vault monitoring, review queues, and audit event logs.
          </p>
        </div>

        {/* Modal Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowIncidentModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 text-xs font-semibold shadow-sm transition-all"
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Incident Reconstruction</span>
          </button>

          <button
            onClick={() => setShowChecklistModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 text-xs font-semibold shadow-sm transition-all"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Demo Checklist</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('scenarios')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/40 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Scenario Controls</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Treasury Balance"
          value={`BDT ${totalLedger.toLocaleString()}`}
          subValue="Aggregate ledger across all user vaults"
          icon={<Wallet className="w-4 h-4 text-emerald-400" />}
          badge={<Badge variant="emerald" size="sm">Ledger</Badge>}
        />

        <MetricCard
          label="Platform Active Reserves"
          value={`BDT ${totalReserved.toLocaleString()}`}
          subValue="Funds locked for pending payouts & trades"
          icon={<Lock className="w-4 h-4 text-amber-400" />}
          badge={<Badge variant="amber" size="sm">Reserved</Badge>}
        />

        <MetricCard
          label="Pending Review Queues"
          value={pendingDeposits + pendingWithdrawals + pendingKYC}
          subValue={`${pendingDeposits} Dep | ${pendingWithdrawals} W/D | ${pendingKYC} KYC`}
          icon={<FileCheck className="w-4 h-4 text-purple-400" />}
          badge={<Badge variant="purple" size="sm">Review</Badge>}
        />

        <MetricCard
          label="Market Engine Status"
          value={state.systemStatus.feedStatus}
          subValue={`Latency: ${state.systemStatus.feedLatencyMs}ms | Auto-tick: 2.5s`}
          icon={<Radio className={`w-4 h-4 ${state.systemStatus.feedStatus === 'LIVE' ? 'text-emerald-400' : 'text-red-400'}`} />}
          badge={<Badge variant={state.systemStatus.feedStatus === 'LIVE' ? 'emerald' : 'red'} size="sm">Feed</Badge>}
        />
      </div>

      {/* Review Workspaces Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveAdminTab('deposits')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 cursor-pointer transition-all space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            {pendingDeposits > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                {pendingDeposits} Pending
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Deposit Reviews
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Desktop side-by-side evidence inspection & duplicate TrxID guard.
            </p>
          </div>
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 pt-1">
            <span>Open Queue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setActiveAdminTab('withdrawals')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 cursor-pointer transition-all space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            {pendingWithdrawals > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                {pendingWithdrawals} Pending
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              Withdrawal Reviews
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Release or finalize reserved payout balances (e.g. WD-1007).
            </p>
          </div>
          <div className="text-xs text-amber-400 font-semibold flex items-center gap-1 pt-1">
            <span>Open Queue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setActiveAdminTab('kyc')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/60 cursor-pointer transition-all space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <FileCheck className="w-5 h-5" />
            </div>
            {pendingKYC > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {pendingKYC} Pending
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
              KYC Reviews
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Verify NID/passport submissions, request resubmission, or reject.
            </p>
          </div>
          <div className="text-xs text-purple-400 font-semibold flex items-center gap-1 pt-1">
            <span>Open Queue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => setActiveAdminTab('support')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 cursor-pointer transition-all space-y-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            {openTickets > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                {openTickets} Open
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              Support Desk
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Respond to trader inquiries (e.g. TKT-101 inquiry on WD-1007).
            </p>
          </div>
          <div className="text-xs text-blue-400 font-semibold flex items-center gap-1 pt-1">
            <span>Open Queue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Recent System Audit Activity */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Administrative & Vault Audits</h3>
            <p className="text-xs text-slate-400">Real-time immutable log stream</p>
          </div>
          <button
            onClick={() => setActiveAdminTab('audit')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Action</th>
                <th className="pb-3">Entity</th>
                <th className="pb-3">Operator</th>
                <th className="pb-3">Details / Idempotency Key</th>
                <th className="pb-3 text-right pr-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.auditLogs.slice(0, 6).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-3 pl-2 font-mono font-bold text-slate-200">
                    <Badge variant="blue" size="sm">{log.eventType || log.action || 'EVENT'}</Badge>
                  </td>
                  <td className="py-3 font-mono text-emerald-400 font-semibold">{log.entityId}</td>
                  <td className="py-3 text-slate-300">{log.actorName || log.operatorName}</td>
                  <td className="py-3 text-slate-400 font-mono text-[11px] truncate max-w-xs">
                    {log.idempotencyKey ? `Idemp: ${log.idempotencyKey}` : (log.reason || JSON.stringify(log.newState || log.afterState || '')).substring(0, 45)}
                  </td>
                  <td className="py-3 text-right pr-2 font-mono text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <IncidentReconstructionModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
      />

      <DemoChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
      />
    </div>
  );
};
