import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  ArrowDownLeft, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink,
  Lock,
  Sparkles,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { DepositRequest } from '../../types';

export const DepositReviewsView: React.FC = () => {
  const { state, currentUser, approveDeposit, rejectDeposit } = useSimulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedDepositId, setSelectedDepositId] = useState<string>(
    state.deposits[0]?.id || 'DEP-2001'
  );

  // Decision state
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Duplicate Transaction Reference ID');
  const [idempotencyKey, setIdempotencyKey] = useState(`IDEMP-${Date.now()}`);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const selectedDeposit = state.deposits.find((d) => d.id === selectedDepositId) || state.deposits[0];

  // Duplicate detection logic
  const selectedRef = selectedDeposit?.paymentReference || selectedDeposit?.referenceNumber;
  const duplicateDeposits = state.deposits.filter(
    (d) => d.id !== selectedDeposit?.id && selectedRef && (d.paymentReference === selectedRef || d.referenceNumber === selectedRef)
  );
  const isDuplicate = duplicateDeposits.length > 0;

  const filteredDeposits = state.deposits.filter((d) => {
    const q = searchQuery.toLowerCase();
    const ref = (d.paymentReference || d.referenceNumber || '').toLowerCase();
    const sender = (d.userName || d.senderAccount || '').toLowerCase();
    const matchesSearch =
      d.id.toLowerCase().includes(q) ||
      ref.includes(q) ||
      sender.includes(q) ||
      d.userId.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = () => {
    if (!selectedDeposit) return;
    approveDeposit(
      selectedDeposit.id,
      reviewerNotes || `Approved by ${currentUser.name}`,
      idempotencyKey
    );
    setShowApproveModal(false);
    setIdempotencyKey(`IDEMP-${Date.now()}`);
  };

  const handleReject = () => {
    if (!selectedDeposit) return;
    rejectDeposit(
      selectedDeposit.id,
      `${rejectionReason}: ${reviewerNotes || 'Rejected during compliance review'}`
    );
    setShowRejectModal(false);
  };

  const statusColors: Record<string, 'emerald' | 'amber' | 'red' | 'slate'> = {
    APPROVED: 'emerald',
    REVIEW_REQUIRED: 'amber',
    PENDING: 'amber',
    REJECTED: 'red',
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Deposit Evidence Review Workspace</h1>
            <Badge variant="purple" size="sm">DOUBLE-ENTRY TREASURY</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Desktop side-by-side proof verification, automated duplicate TrxID detection, and idempotent crediting.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
          Total Submissions: <strong className="text-white">{state.deposits.length}</strong>
        </div>
      </div>

      {/* Desktop 2-Column Split: Queue on Left, Detailed Workspace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Submissions Queue */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submissions Queue</h3>
            <span className="text-xs text-slate-500 font-mono">{filteredDeposits.length} items</span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search TrxID, User, or Sender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {['ALL', 'REVIEW_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    filterStatus === st
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Queue List */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredDeposits.map((dep) => {
              const isSelected = selectedDeposit?.id === dep.id;
              const hasDuplicate = state.deposits.some(
                (other) => other.id !== dep.id && other.referenceNumber === dep.referenceNumber
              );

              return (
                <div
                  key={dep.id}
                  onClick={() => setSelectedDepositId(dep.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/70 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">{dep.id}</span>
                      <Badge variant="slate" size="sm">{dep.method}</Badge>
                    </div>
                    <Badge variant={statusColors[dep.status]} size="sm">{dep.status}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Sender: {dep.userName || dep.senderAccount || dep.userId}</span>
                    <span className="font-mono font-bold text-white">BDT {dep.amount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/60">
                    <span className="truncate max-w-[150px]">Ref: {dep.paymentReference || dep.referenceNumber}</span>
                    <span>{new Date(dep.paymentDate || dep.createdAt || '').toLocaleDateString()}</span>
                  </div>

                  {hasDuplicate && (
                    <div className="mt-1.5 p-1 rounded bg-red-950/60 border border-red-800/60 text-[10px] text-red-300 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                      <span>DUPLICATE TRXID DETECTED</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 Cols): Detailed Evidence Workspace */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[600px]">
          {selectedDeposit ? (
            <div className="space-y-5">
              {/* Header Details */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white font-mono">{selectedDeposit.id}</h2>
                    <Badge variant={statusColors[selectedDeposit.status]} size="sm">
                      {selectedDeposit.status}
                    </Badge>
                    <Badge variant="slate" size="sm">{selectedDeposit.paymentMethod || selectedDeposit.method}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    User: <strong className="text-slate-200 font-mono">{selectedDeposit.userId}</strong> | Submitted:{' '}
                    {new Date(selectedDeposit.paymentDate || selectedDeposit.createdAt || '').toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    BDT {selectedDeposit.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Net Credit Valuation</div>
                </div>
              </div>

              {/* Duplicate Flag Alert if applicable */}
              {isDuplicate && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-red-100 text-sm">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>DUPLICATE TRANSACTION REFERENCE DETECTED</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    TrxID <strong className="font-mono text-white">{selectedDeposit.referenceNumber}</strong> matches prior deposit{' '}
                    <strong className="font-mono text-white">{duplicateDeposits[0].id}</strong> (Status:{' '}
                    {duplicateDeposits[0].status}). The idempotency engine blocks duplicate ledger crediting.
                  </p>
                </div>
              )}

              {/* Side-by-Side Review Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Panel A: Submission Metadata */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800">
                    Gateway Metadata
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Payment Channel:</span>
                    <span className="font-semibold text-white">{selectedDeposit.method}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sender Phone / Account:</span>
                    <span className="font-mono text-white font-medium">{selectedDeposit.senderAccount}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction Reference (TrxID):</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedDeposit.paymentReference || selectedDeposit.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Evidence Quality Rating:</span>
                    <Badge
                      variant={
                        selectedDeposit.evidenceQuality === 'Clear' || (selectedDeposit.evidenceQuality as string) === 'HIGH'
                          ? 'emerald'
                          : selectedDeposit.evidenceQuality === 'Altered' || (selectedDeposit.evidenceQuality as string) === 'ALTERED'
                          ? 'red'
                          : 'amber'
                      }
                      size="sm"
                    >
                      {selectedDeposit.evidenceQuality}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                    <span>Target Credit Wallet:</span>
                    <span className="text-slate-200">Main Account (BDT)</span>
                  </div>
                </div>

                {/* Panel B: Digital Receipt Proof Inspection */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs flex flex-col justify-between">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-800">
                    Payment Voucher Inspection
                  </div>

                  {/* Receipt graphic */}
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                      <span className="font-bold text-pink-400">{selectedDeposit.paymentMethod || selectedDeposit.method} MONEY RECEIPT</span>
                      <span>SUCCESS</span>
                    </div>
                    <div className="flex justify-between text-slate-300 pt-1">
                      <span>TrxID:</span>
                      <span className="text-white font-bold">{selectedDeposit.paymentReference || selectedDeposit.referenceNumber}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Amount:</span>
                      <span className="text-emerald-400 font-bold">BDT {selectedDeposit.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Sender:</span>
                      <span>{selectedDeposit.userName || selectedDeposit.senderAccount || selectedDeposit.userId}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Date:</span>
                      <span>{new Date(selectedDeposit.paymentDate || selectedDeposit.createdAt || '').toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono text-center">
                    Attachment: {selectedDeposit.proofUrl || 'payment_receipt.png'}
                  </div>
                </div>
              </div>

              {/* Reviewer Notes & Idempotency Key */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Compliance Reviewer Note:
                  </label>
                  <input
                    type="text"
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="e.g. Verified against gateway ledger. TrxID matches verified bank feed."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-slate-300 block">Idempotency Protection Key</span>
                      <span className="text-[10px] text-slate-500 font-mono">Ensures this request cannot be credited more than once</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {idempotencyKey}
                  </span>
                </div>
              </div>

              {/* Decision Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={selectedDeposit.status === 'REJECTED' || selectedDeposit.status === 'APPROVED'}
                  className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 text-xs font-semibold disabled:opacity-40 transition-colors"
                >
                  Reject Deposit
                </button>

                <button
                  type="button"
                  onClick={() => setShowApproveModal(true)}
                  disabled={selectedDeposit.status === 'APPROVED'}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Credit Balance</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select a deposit request from the queue on the left.
            </div>
          )}
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedDeposit && (
        <ConfirmModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          onConfirm={handleApprove}
          title={`Approve Deposit: ${selectedDeposit.id}`}
          description={`You are about to approve BDT ${selectedDeposit.amount.toLocaleString()} for User ${selectedDeposit.userId}.`}
          confirmLabel="Execute Credit"
          confirmVariant="emerald"
          riskWarning={
            isDuplicate
              ? 'Warning: This transaction has a duplicate TrxID! The idempotency engine will verify against previous credits before processing.'
              : undefined
          }
        >
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>TrxID:</span>
              <span className="text-white font-bold">{selectedDeposit.referenceNumber}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Idempotency Key:</span>
              <span className="text-emerald-400">{idempotencyKey}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Ledger Balance Impact:</span>
              <span className="text-white">+BDT {selectedDeposit.amount.toLocaleString()}</span>
            </div>
          </div>
        </ConfirmModal>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedDeposit && (
        <ConfirmModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleReject}
          title={`Reject Deposit: ${selectedDeposit.id}`}
          description={`Reject deposit of BDT ${selectedDeposit.amount.toLocaleString()}. No balance credit will be executed.`}
          confirmLabel="Confirm Rejection"
          confirmVariant="red"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Rejection Reason:</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="Duplicate Transaction Reference ID">Duplicate Transaction Reference ID</option>
                <option value="Blurry or unreadable proof receipt">Blurry or unreadable proof receipt</option>
                <option value="Sender name does not match KYC verification">Sender name does not match KYC verification</option>
                <option value="Payment not found in gateway records">Payment not found in gateway records</option>
              </select>
            </div>
          </div>
        </ConfirmModal>
      )}
    </div>
  );
};
