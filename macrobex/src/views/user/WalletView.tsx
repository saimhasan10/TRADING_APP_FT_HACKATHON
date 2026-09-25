import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  FileText, 
  HelpCircle,
  Copy,
  Check,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const WalletView: React.FC = () => {
  const {
    state,
    currentUser,
    currentAccountMode,
    submitDepositRequest,
    submitWithdrawalRequest,
    setActiveTab,
  } = useSimulation();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('2500');
  const [depositMethod, setDepositMethod] = useState<'BKASH' | 'NAGAD' | 'BANK_TRANSFER' | 'CRYPTO'>('BKASH');
  const [depositSender, setDepositSender] = useState('01711223344');
  const [depositRef, setDepositRef] = useState(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [depositQuality, setDepositQuality] = useState<'HIGH' | 'LOW_QUALITY' | 'ALTERED'>('HIGH');

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState('1000');
  const [withdrawMethod, setWithdrawMethod] = useState<'BKASH' | 'NAGAD' | 'BANK_TRANSFER'>('BKASH');
  const [withdrawDest, setWithdrawDest] = useState('01811223344');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const userWallet = state.wallets[currentUser.id]?.[currentAccountMode] || {
    ledgerBalance: 0,
    reservedBalance: 0,
    availableBalance: 0,
  };

  const userDeposits = state.deposits.filter((d) => d.userId === currentUser.id);
  const userWithdrawals = state.withdrawals.filter((w) => w.userId === currentUser.id);
  const activeReservations = state.reservations.filter(
    (r) => r.userId === currentUser.id && r.accountType === currentAccountMode && r.status === 'ACTIVE'
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    submitDepositRequest({
      userId: currentUser.id,
      amount,
      method: depositMethod,
      senderAccount: depositSender,
      referenceNumber: depositRef,
      evidenceQuality: depositQuality,
    });

    setIsDepositOpen(false);
    setDepositRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    const amount = parseFloat(withdrawAmount);

    if (currentUser.isRestricted) {
      setWithdrawError(`Withdrawals are blocked: Account is restricted (${currentUser.restrictionReason || 'Compliance Hold'}).`);
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Please enter a valid positive withdrawal amount.');
      return;
    }

    if (amount > userWallet.availableBalance) {
      setWithdrawError(
        `Insufficient available balance! You requested BDT ${amount.toLocaleString()}, but only BDT ${userWallet.availableBalance.toLocaleString()} is available. BDT ${userWallet.reservedBalance.toLocaleString()} is held in active reservations.`
      );
      return;
    }

    const res = submitWithdrawalRequest({
      userId: currentUser.id,
      accountType: currentAccountMode,
      amount,
      method: withdrawMethod,
      destinationAccount: withdrawDest,
    });

    if (res.success) {
      setIsWithdrawOpen(false);
    } else {
      setWithdrawError(res.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Wallet & Accounting</h1>
            <Badge variant="purple" size="sm">DOUBLE-ENTRY LEDGER</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Exchange treasury vault enforcing balance reconciliation: <span className="font-mono text-emerald-400">Available = Ledger - Reserved</span>.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDepositOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit BDT</span>
          </button>

          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw BDT</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Explain Balances</span>
          </button>
        </div>
      </div>

      {/* Accounting Formula Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-300">Accounting Integrity Rule</div>
            <div className="text-sm sm:text-base font-mono font-bold text-white mt-0.5">
              Available (BDT {userWallet.availableBalance.toLocaleString()}) = Ledger (BDT {userWallet.ledgerBalance.toLocaleString()}) - Reserved (BDT {userWallet.reservedBalance.toLocaleString()})
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('ai')}
          className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-purple-950/60 hover:bg-purple-900/60 px-3 py-1.5 rounded-lg border border-purple-800/60 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why are my balances different?</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Ledger Balance"
          value={`BDT ${userWallet.ledgerBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subValue="Total confirmed funds recorded in user ledger"
          icon={<Wallet className="w-4 h-4 text-emerald-400" />}
          badge={<Badge variant="slate" size="sm">Settled</Badge>}
        />

        <MetricCard
          label="Reserved Balance"
          value={`BDT ${userWallet.reservedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subValue={`${activeReservations.length} active lock${activeReservations.length === 1 ? '' : 's'} (Trades & Withdrawals)`}
          icon={<Lock className="w-4 h-4 text-amber-400" />}
          badge={<Badge variant={userWallet.reservedBalance > 0 ? 'amber' : 'slate'} size="sm">Locked</Badge>}
        />

        <MetricCard
          label="Available Balance"
          value={`BDT ${userWallet.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subValue="Tradable & withdrawable funds right now"
          icon={<CheckCircle2 className="w-4 h-4 text-cyan-400" />}
          badge={<Badge variant="emerald" size="sm">Available</Badge>}
        />
      </div>

      {/* Active Balance Reservations Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Active Balance Reservations</h3>
            <p className="text-xs text-slate-400">
              Audit log of funds currently locked for pending withdrawals or open trade margins.
            </p>
          </div>
          <Badge variant={activeReservations.length > 0 ? 'amber' : 'slate'} size="sm">
            {activeReservations.length} Active Hold{activeReservations.length === 1 ? '' : 's'}
          </Badge>
        </div>

        {activeReservations.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No active balance reservations. All ledger balance funds are currently available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Reservation ID</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Reference Entity</th>
                  <th className="pb-3 text-right">Reserved Amount</th>
                  <th className="pb-3 text-right">Created At</th>
                  <th className="pb-3 text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 pl-2 font-mono font-bold text-slate-200">{r.id}</td>
                    <td className="py-3.5">
                      <Badge variant={r.entityType === 'WITHDRAWAL' ? 'amber' : 'blue'} size="sm">
                        {r.entityType}
                      </Badge>
                    </td>
                    <td className="py-3.5 font-mono text-slate-300">
                      <span>{r.entityId}</span>
                      {r.entityId === 'WD-1007' && (
                        <span className="ml-2 text-[10px] text-amber-400 font-sans font-semibold">
                          (Seeded Scenario: Pending Admin Approval)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-amber-400">
                      BDT {r.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <Badge variant="amber" size="sm">{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposits & Withdrawals History Tabs/Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit History */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Deposit Requests</h3>
              <p className="text-xs text-slate-400">Manual review & proof verification queue</p>
            </div>
            <button
              onClick={() => setIsDepositOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              + New Deposit
            </button>
          </div>

          {userDeposits.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No deposit submissions yet.</div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {userDeposits.map((d) => {
                const statusColors: Record<string, 'emerald' | 'amber' | 'red' | 'slate'> = {
                  APPROVED: 'emerald',
                  PENDING: 'amber',
                  REVIEW_REQUIRED: 'amber',
                  REJECTED: 'red',
                };
                return (
                  <div key={d.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">{d.id}</span>
                        <Badge variant="slate" size="sm">{d.paymentMethod}</Badge>
                      </div>
                      <Badge variant={statusColors[d.status] || 'slate'} size="sm">
                        {d.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span>Ref: {d.paymentReference}</span>
                      <span className="font-mono font-bold text-white text-sm">BDT {d.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                      <span>Method: {d.paymentMethod}</span>
                      <span>{new Date(d.paymentDate).toLocaleDateString()}</span>
                    </div>

                    {d.reviewerNotes && (
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                        <span className="font-semibold text-slate-400">Admin Note: </span>
                        {d.reviewerNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Withdrawal History */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Withdrawal Requests</h3>
              <p className="text-xs text-slate-400">Pending & finalized payout requests</p>
            </div>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              + New Withdrawal
            </button>
          </div>

          {userWithdrawals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No withdrawal requests yet.</div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {userWithdrawals.map((w) => {
                const statusColors: Record<string, 'emerald' | 'amber' | 'red' | 'slate'> = {
                  APPROVED: 'emerald',
                  PENDING: 'amber',
                  REJECTED: 'red',
                };
                return (
                  <div key={w.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">{w.id}</span>
                        <Badge variant="slate" size="sm">{w.method}</Badge>
                      </div>
                      <Badge variant={statusColors[w.status] || 'slate'} size="sm">
                        {w.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span>Dest: {w.destination}</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">BDT {w.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                      <span>Reservation: {w.reservationId || 'N/A'}</span>
                      <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                    </div>

                    {w.reviewerNotes && (
                      <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/50 text-[11px] text-red-300">
                        <span className="font-semibold text-red-200">Reviewer Note: </span>
                        {w.reviewerNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-2">Submit BDT Deposit</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter deposit payment details. Manual compliance verification is conducted prior to crediting your ledger balance.
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deposit Amount (BDT)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={depositMethod}
                  onChange={(e) => setDepositMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="BKASH">bKash Personal / Merchant</option>
                  <option value="NAGAD">Nagad Wallet</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NPSB / BEFTN)</option>
                  <option value="CRYPTO">Crypto USDT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sender Mobile / Account Number</label>
                <input
                  type="text"
                  value={depositSender}
                  onChange={(e) => setDepositSender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 01711223344"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Reference / TrxID</label>
                <input
                  type="text"
                  value={depositRef}
                  onChange={(e) => setDepositRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. TXN-847291"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Evidence Voucher Quality</label>
                <select
                  value={depositQuality}
                  onChange={(e) => setDepositQuality(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="HIGH">High Quality (Clear receipt & matching TrxID)</option>
                  <option value="LOW_QUALITY">Low Quality / Blurry (Triggers review flag)</option>
                  <option value="ALTERED">Altered / Suspicious (Triggers duplicate or tamper flag)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Proof Voucher Attached:</div>
                <div className="font-mono text-emerald-400">proof_receipt_{depositRef}.png</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/40"
                >
                  Submit Deposit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-2">Request BDT Withdrawal</h3>
            <p className="text-xs text-slate-400 mb-4">
              Upon submission, funds are immediately moved into <strong className="text-amber-400">Reserved Balance</strong>. Available balance will decrease immediately while Ledger balance stays intact until approved.
            </p>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              {withdrawError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{withdrawError}</span>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <label className="font-semibold text-slate-300">Withdrawal Amount (BDT)</label>
                  <span className="text-slate-400 font-mono">
                    Max Available: <strong className="text-emerald-400">BDT {userWallet.availableBalance.toLocaleString()}</strong>
                  </span>
                </div>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="BKASH">bKash Personal Account</option>
                  <option value="NAGAD">Nagad Wallet</option>
                  <option value="BANK_TRANSFER">Bank Account (BEFTN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Number / Account</label>
                <input
                  type="text"
                  value={withdrawDest}
                  onChange={(e) => setWithdrawDest(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 01811223344"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Current Ledger Balance:</span>
                  <span className="font-mono text-white">BDT {userWallet.ledgerBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current Reserved Balance:</span>
                  <span className="font-mono text-amber-400">BDT {userWallet.reservedBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>New Reserved (Hold):</span>
                  <span className="font-mono text-amber-300 font-bold">
                    +BDT {parseFloat(withdrawAmount) || 0}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 font-semibold pt-1 border-t border-slate-800">
                  <span>New Available Balance:</span>
                  <span className="font-mono text-cyan-400">
                    BDT {Math.max(0, userWallet.availableBalance - (parseFloat(withdrawAmount) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-950/40"
                >
                  Confirm & Reserve Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
