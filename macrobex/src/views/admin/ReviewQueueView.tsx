import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileCheck, 
  LifeBuoy, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const ReviewQueueView: React.FC = () => {
  const { state, setActiveAdminTab } = useSimulation();

  const [activeSubTab, setActiveSubTab] = useState<'DEPOSITS' | 'WITHDRAWALS' | 'KYC'>('DEPOSITS');

  const pendingDeposits = state.deposits.filter((d) => d.status === 'REVIEW_REQUIRED' || d.status === 'PENDING');
  const pendingWithdrawals = state.withdrawals.filter((w) => w.status === 'PENDING');
  const pendingKYC = state.verifications.filter((v) => v.status === 'PENDING');

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Unified Operations Review Queue</h1>
            <Badge variant="purple" size="sm">AUDIT COMPLIANCE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consolidated inbox for pending financial approvals, proof validation, and KYC verifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Total Pending Tasks:{' '}
            <strong className="text-amber-400 font-bold">
              {pendingDeposits.length + pendingWithdrawals.length + pendingKYC.length}
            </strong>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('DEPOSITS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'DEPOSITS'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Pending Deposits</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] font-bold">
            {pendingDeposits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('WITHDRAWALS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'WITHDRAWALS'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Pending Withdrawals</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] font-bold">
            {pendingWithdrawals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('KYC')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'KYC'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Pending KYC</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] font-bold">
            {pendingKYC.length}
          </span>
        </button>
      </div>

      {/* Subtab Content */}
      {activeSubTab === 'DEPOSITS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Deposit Review Tasks</h3>
              <p className="text-xs text-slate-400">Review proof of payment and ensure no duplicate TrxID credit</p>
            </div>
            <button
              onClick={() => setActiveAdminTab('deposits')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open Full Desktop Review Interface</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingDeposits.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{d.id}</span>
                    <Badge variant={d.status === 'REVIEW_REQUIRED' ? 'amber' : 'blue'} size="sm">
                      {d.status}
                    </Badge>
                    <Badge variant="slate" size="sm">{d.paymentMethod}</Badge>
                  </div>
                  <div className="text-slate-300">
                    User: <strong className="text-white">{d.userName}</strong> | TrxID: <strong className="font-mono text-emerald-400">{d.paymentReference}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Submitted: {new Date(d.paymentDate).toLocaleString()} | Evidence: {d.evidenceQuality}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-sm block">BDT {d.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 font-mono">User: {d.userId}</span>
                  </div>
                  <button
                    onClick={() => setActiveAdminTab('deposits')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                  >
                    Inspect & Decide
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'WITHDRAWALS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Pending Withdrawal Approvals</h3>
              <p className="text-xs text-slate-400">
                Approving debits ledger and releases reserved hold. Rejecting returns funds to available.
              </p>
            </div>
            <button
              onClick={() => setActiveAdminTab('withdrawals')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open Withdrawal Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingWithdrawals.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{w.id}</span>
                    <Badge variant="amber" size="sm">PENDING APPROVAL</Badge>
                    <Badge variant="slate" size="sm">{w.method}</Badge>
                  </div>
                  <div className="text-slate-300">
                    Destination: <strong className="text-white">{w.destination}</strong> | Reservation ID: <strong className="font-mono text-amber-400">{w.reservationId}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Created: {new Date(w.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-400 text-sm block">BDT {w.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 font-mono">User: {w.userId}</span>
                  </div>
                  <button
                    onClick={() => setActiveAdminTab('withdrawals')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors"
                  >
                    Review Payout
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'KYC' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Pending KYC Identity Applications</h3>
              <p className="text-xs text-slate-400">Review document photos and liveness checks</p>
            </div>
            <button
              onClick={() => setActiveAdminTab('kyc')}
              className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open KYC Review Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingKYC.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{k.id}</span>
                    <Badge variant="purple" size="sm">{k.documentType}</Badge>
                    <Badge variant="amber" size="sm">{k.status}</Badge>
                  </div>
                  <div className="text-slate-300">
                    Doc Number: <strong className="font-mono text-white">{k.documentNumber}</strong> | User: {k.userId}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Submitted: {new Date(k.submissionDate).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => setActiveAdminTab('kyc')}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
                >
                  Inspect Documents
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
