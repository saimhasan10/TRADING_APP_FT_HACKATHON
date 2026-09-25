import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  ArrowUpRight, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  AlertTriangle, 
  ShieldCheck, 
  Wallet,
  Clock,
  Info
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const WithdrawalReviewsView: React.FC = () => {
  const { state, currentUser, approveWithdrawal, rejectWithdrawal } = useSimulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string>(
    state.withdrawals[0]?.id || 'WD-1007'
  );
  const [rejectionReason, setRejectionReason] = useState('Compliance review failed: Document mismatch');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const selectedWithdrawal = state.withdrawals.find((w) => w.id === selectedWithdrawalId) || state.withdrawals[0];

  const targetUser = state.users.find((u) => u.id === selectedWithdrawal?.userId);
  const targetWallet = selectedWithdrawal ? state.wallets[selectedWithdrawal.userId]?.[selectedWithdrawal.accountType] : null;

  const filteredWithdrawals = state.withdrawals.filter((w) => {
    const matchesSearch =
      w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || w.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = () => {
    if (!selectedWithdrawal) return;
    approveWithdrawal(selectedWithdrawal.id, `Approved by ${currentUser.name}`);
    setShowApproveModal(false);
  };

  const handleReject = () => {
    if (!selectedWithdrawal) return;
    rejectWithdrawal(selectedWithdrawal.id, rejectionReason || `Rejected by ${currentUser.name}`);
    setShowRejectModal(false);
  };

  const statusColors: Record<string, 'emerald' | 'amber' | 'red' | 'slate'> = {
    APPROVED: 'emerald',
    PENDING: 'amber',
    REJECTED: 'red',
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Withdrawal Approvals Desk</h1>
            <Badge variant="amber" size="sm">PAYOUT VAULT</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review and execute payout approvals. Ledger balances are only debited upon verified approval.
          </p>
        </div>

        <div className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
          Pending Payouts: <strong className="text-amber-400 font-bold">{state.withdrawals.filter((w) => w.status === 'PENDING').length}</strong>
        </div>
      </div>

      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (5 cols): Requests List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Withdrawal Requests</h3>
            <span className="text-xs text-slate-500 font-mono">{filteredWithdrawals.length} items</span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, destination, user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === st
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredWithdrawals.map((w) => {
              const isSelected = selectedWithdrawal?.id === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWithdrawalId(w.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/70 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">{w.id}</span>
                      <Badge variant="slate" size="sm">{w.method}</Badge>
                    </div>
                    <Badge variant={statusColors[w.status]} size="sm">{w.status}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Dest: {w.destination}</span>
                    <span className="font-mono font-bold text-amber-400">BDT {w.amount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/60">
                    <span>User: {w.userId}</span>
                    <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col (7 cols): Review & Execution Desk */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[600px]">
          {selectedWithdrawal ? (
            <div className="space-y-5">
              {/* Top Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white font-mono">{selectedWithdrawal.id}</h2>
                    <Badge variant={statusColors[selectedWithdrawal.status]} size="sm">
                      {selectedWithdrawal.status}
                    </Badge>
                    <Badge variant="slate" size="sm">{selectedWithdrawal.method}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    User: <strong className="text-slate-200 font-mono">{selectedWithdrawal.userId}</strong> ({targetUser?.name}) | Submitted:{' '}
                    {new Date(selectedWithdrawal.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-amber-400">
                    BDT {selectedWithdrawal.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Reserved Balance Hold</div>
                </div>
              </div>

              {/* Special Context Banner for WD-1007 */}
              {selectedWithdrawal.id === 'WD-1007' && (
                <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 space-y-1 text-xs">
                  <div className="font-bold text-blue-100 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span>Seeded Hackathon Incident Case: WD-1007</span>
                  </div>
                  <p className="leading-relaxed text-blue-300">
                    This BDT 3,000 request explains why the user's available balance is BDT 22,000 instead of BDT 25,000. It is currently locked in reservation <strong className="font-mono text-white">RES-001</strong> and tied to Support Ticket <strong className="font-mono text-white">TKT-101</strong>.
                  </p>
                </div>
              )}

              {/* Target User Financial Reconciliation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    User Balance & Identity Health
                  </span>
                  <Badge variant={targetUser?.verificationStatus === 'VERIFIED' ? 'emerald' : 'amber'} size="sm">
                    {targetUser?.verificationStatus || 'UNVERIFIED'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] font-sans">Current Ledger Balance</span>
                    <span className="text-white font-bold text-sm">BDT {targetWallet?.ledgerBalance.toLocaleString()}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] font-sans">Reserved Balance</span>
                    <span className="text-amber-400 font-bold text-sm">BDT {targetWallet?.reservedBalance.toLocaleString()}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] font-sans">Available Balance</span>
                    <span className="text-cyan-400 font-bold text-sm">BDT {targetWallet?.availableBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>Destination Account / Number:</span>
                  <span className="font-mono text-white font-bold">{selectedWithdrawal.destination}</span>
                </div>
              </div>

              {/* Accounting Impact Projection */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  Post-Approval Accounting Projection
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-400">
                  <div>
                    <span>If Approved:</span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] mt-1 space-y-0.5 font-mono">
                      <li>Ledger Balance: BDT {((targetWallet?.ledgerBalance || 0) - selectedWithdrawal.amount).toLocaleString()}</li>
                      <li>Reserved Balance: BDT {Math.max(0, (targetWallet?.reservedBalance || 0) - selectedWithdrawal.amount).toLocaleString()}</li>
                      <li>Available: Stays BDT {targetWallet?.availableBalance.toLocaleString()}</li>
                    </ul>
                  </div>

                  <div>
                    <span>If Rejected:</span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] mt-1 space-y-0.5 font-mono">
                      <li>Ledger Balance: Stays BDT {targetWallet?.ledgerBalance.toLocaleString()}</li>
                      <li>Reserved: Released (-BDT {selectedWithdrawal.amount.toLocaleString()})</li>
                      <li>Available: Returns to BDT {((targetWallet?.availableBalance || 0) + selectedWithdrawal.amount).toLocaleString()}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={selectedWithdrawal.status !== 'PENDING'}
                  className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 text-xs font-semibold disabled:opacity-40 transition-colors"
                >
                  Reject & Release Reserved Funds
                </button>

                <button
                  type="button"
                  onClick={() => setShowApproveModal(true)}
                  disabled={selectedWithdrawal.status !== 'PENDING'}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Debit Ledger</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select a withdrawal request from the list.
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedWithdrawal && (
        <ConfirmModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          onConfirm={handleApprove}
          title={`Approve Withdrawal: ${selectedWithdrawal.id}`}
          description={`Execute payout of BDT ${selectedWithdrawal.amount.toLocaleString()} to ${selectedWithdrawal.destination}.`}
          confirmLabel="Authorize Payout"
          confirmVariant="emerald"
          riskWarning="This will debit Ledger Balance and release Reservation hold. Action will be written permanently to the immutable audit log."
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedWithdrawal && (
        <ConfirmModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          title={`Reject Withdrawal: ${selectedWithdrawal.id}`}
          description={`Reject payout of BDT ${selectedWithdrawal.amount.toLocaleString()}. Reserved funds will be returned to the trader's Available Balance.`}
          confirmLabel="Confirm Rejection"
          confirmVariant="red"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Rejection:</label>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              required
            />
          </div>
        </ConfirmModal>
      )}
    </div>
  );
};
