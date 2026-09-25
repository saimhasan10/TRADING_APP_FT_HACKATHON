import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  LineChart, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Sparkles,
  ChevronRight,
  Receipt,
  Lock
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';
import { MiniSparkline } from '../../components/charts/MiniSparkline';

export const UserDashboardView: React.FC = () => {
  const {
    state,
    currentUser,
    currentAccountMode,
    setAccountMode,
    setActiveTab,
    closeTrade,
  } = useSimulation();

  const userWallet = state.wallets[currentUser.id]?.[currentAccountMode] || {
    ledgerBalance: 0,
    reservedBalance: 0,
    availableBalance: 0,
  };

  const activeTrades = state.trades.filter((t) => t.userId === currentUser.id && t.accountType === currentAccountMode && t.status === 'ACTIVE');
  const activeReservations = state.reservations.filter((r) => r.userId === currentUser.id && r.accountType === currentAccountMode && r.status === 'ACTIVE');
  const recentTransactions = state.ledgerEntries.filter((l) => l.userId === currentUser.id && l.accountType === currentAccountMode).slice(0, 5);

  // Compute unrealized PnL across active trades
  let unrealizedPnL = 0;
  activeTrades.forEach((t) => {
    const asset = state.assets.find((a) => a.symbol === t.assetSymbol);
    const currPrice = asset ? asset.currentPrice : t.entryPrice;
    if (t.direction === 'BUY') {
      unrealizedPnL += t.amount * ((currPrice - t.entryPrice) / t.entryPrice);
    } else {
      unrealizedPnL += t.amount * ((t.entryPrice - currPrice) / t.entryPrice);
    }
  });
  unrealizedPnL = Number(unrealizedPnL.toFixed(2));

  // Check if pending withdrawal WD-1007 exists
  const pendingWD1007 = state.withdrawals.find((w) => w.id === 'WD-1007' && w.userId === currentUser.id && w.status === 'PENDING');

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Good day, {currentUser.name}
            </h1>
            <Badge variant={currentUser.verificationStatus === 'VERIFIED' ? 'emerald' : 'amber'} size="sm">
              {currentUser.verificationStatus === 'VERIFIED' ? 'VERIFIED' : 'KYC PENDING'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Viewing <span className="text-emerald-400 font-semibold uppercase">{currentAccountMode} Account</span>. Synthetic simulation mode enabled.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('wallet')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>

          <button
            onClick={() => setActiveTab('trading')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-950/40 transition-all"
          >
            <LineChart className="w-4 h-4" />
            <span>Trade</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Explain Balance</span>
          </button>
        </div>
      </div>

      {/* Warnings & Notices */}
      {state.systemStatus.feedStatus !== 'LIVE' && (
        <div className="bg-red-950/50 border border-red-800/80 rounded-2xl p-4 flex items-start gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <strong className="font-bold text-red-100 block">
              Market Reliability Alert: Feed is {state.systemStatus.feedStatus}
            </strong>
            Prices have stopped updating or were paused by administration. To protect traders against stale execution, all new BUY and SELL orders are disabled until the feed returns to LIVE status. Active positions remain viewable.
          </div>
        </div>
      )}

      {currentUser.isRestricted && (
        <div className="bg-amber-950/50 border border-amber-800/80 rounded-2xl p-4 flex items-start gap-3 text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <strong className="font-bold text-amber-100 block">Account Restrictions Active</strong>
            {currentUser.restrictionReason || 'Your account trading and withdrawal functions are temporarily held by compliance administration.'}
          </div>
        </div>
      )}

      {/* Balance Explanation Callout (Regarding WD-1007) */}
      {pendingWD1007 && currentAccountMode === 'main' && (
        <div className="bg-blue-950/40 border border-blue-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-200">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs sm:text-sm font-semibold text-blue-100">
                Notice: BDT {pendingWD1007.amount.toLocaleString()} is safely reserved for Withdrawal {pendingWD1007.id}
              </div>
              <div className="text-xs text-blue-300/80 mt-0.5">
                Your Ledger Balance shows BDT {userWallet.ledgerBalance.toLocaleString()}, but BDT {userWallet.reservedBalance.toLocaleString()} is reserved, leaving BDT {userWallet.availableBalance.toLocaleString()} available.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('ai')}
            className="self-start sm:self-auto shrink-0 px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 border border-blue-700 text-xs font-medium transition-colors"
          >
            Why is Available lower?
          </button>
        </div>
      )}

      {/* 3-Core Financial Metric Cards (Strict Formula) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Ledger Balance"
          value={`BDT ${userWallet.ledgerBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue="Settled total funds in this account"
          icon={<Receipt className="w-4 h-4 text-emerald-400" />}
          badge={<Badge variant="slate" size="sm">Total</Badge>}
        />

        <MetricCard
          label="Reserved Balance"
          value={`BDT ${userWallet.reservedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue={`${activeReservations.length} active reservation${activeReservations.length === 1 ? '' : 's'}`}
          icon={<Lock className="w-4 h-4 text-amber-400" />}
          badge={<Badge variant={userWallet.reservedBalance > 0 ? 'amber' : 'slate'} size="sm">Locked</Badge>}
        />

        <MetricCard
          label="Available Balance"
          value={`BDT ${userWallet.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue="Ledger minus Reserved (Tradable)"
          icon={<CheckCircle2 className="w-4 h-4 text-cyan-400" />}
          badge={<Badge variant="emerald" size="sm">Available</Badge>}
        />

        <MetricCard
          label="Unrealized P/L"
          value={`${unrealizedPnL >= 0 ? '+' : ''}BDT ${unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue={`${activeTrades.length} open position${activeTrades.length === 1 ? '' : 's'}`}
          change={unrealizedPnL !== 0 ? `${unrealizedPnL >= 0 ? '+' : ''}${((unrealizedPnL / (userWallet.ledgerBalance || 1)) * 100).toFixed(2)}%` : '0.00%'}
          isPositive={unrealizedPnL >= 0}
          icon={unrealizedPnL >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
          badge={<Badge variant={unrealizedPnL >= 0 ? 'emerald' : 'red'} size="sm">Active</Badge>}
        />
      </div>

      {/* Grid: Market Movers & Active Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Watch (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Market Overview</h3>
              <p className="text-xs text-slate-400">Real-time market tickers with live micro-movements</p>
            </div>
            <button
              onClick={() => setActiveTab('markets')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All Markets</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-1">Asset</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-right">24h Change</th>
                  <th className="pb-3 text-center hidden sm:table-cell">Trend</th>
                  <th className="pb-3 text-right pr-1">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {state.assets.map((asset) => {
                  const isPos = asset.change24h >= 0;
                  return (
                    <tr key={asset.symbol} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pl-1">
                        <div className="font-bold text-white">{asset.symbol}</div>
                        <div className="text-[11px] text-slate-400">{asset.name}</div>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-100">
                        ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`font-semibold font-mono ${
                            isPos ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isPos ? '+' : ''}{asset.change24hPct}%
                        </span>
                      </td>
                      <td className="py-3 text-center hidden sm:table-cell">
                        <div className="inline-block">
                          <MiniSparkline data={asset.history} isPositive={isPos} width={90} height={28} />
                        </div>
                      </td>
                      <td className="py-3 text-right pr-1">
                        <button
                          onClick={() => setActiveTab('trading')}
                          disabled={asset.status === 'HALTED' || state.systemStatus.feedStatus !== 'LIVE'}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Trades Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Active Positions</h3>
                <p className="text-xs text-slate-400">{currentAccountMode.toUpperCase()} Account</p>
              </div>
              <Badge variant="blue" size="sm">
                {activeTrades.length} Open
              </Badge>
            </div>

            {activeTrades.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No active positions in this account.
                <div className="mt-3">
                  <button
                    onClick={() => setActiveTab('trading')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    Open New Trade
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {activeTrades.map((trade) => {
                  const asset = state.assets.find((a) => a.symbol === trade.assetSymbol);
                  const currentPrice = asset ? asset.currentPrice : trade.entryPrice;
                  let pnl = 0;
                  if (trade.direction === 'BUY') {
                    pnl = trade.amount * ((currentPrice - trade.entryPrice) / trade.entryPrice);
                  } else {
                    pnl = trade.amount * ((trade.entryPrice - currentPrice) / trade.entryPrice);
                  }
                  pnl = Number(pnl.toFixed(2));
                  const pnlPct = Number(((pnl / trade.amount) * 100).toFixed(2));
                  const isProfit = pnl >= 0;

                  return (
                    <div
                      key={trade.id}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold font-mono text-[10px] ${
                              trade.direction === 'BUY'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {trade.direction}
                          </span>
                          <span className="font-bold text-white">{trade.assetSymbol}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">
                          BDT {trade.amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>Entry: ${trade.entryPrice}</span>
                        <span>Current: ${currentPrice}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
                        <div className={`font-bold font-mono ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}BDT {pnl.toLocaleString()} ({pnlPct}%)
                        </div>
                        <button
                          onClick={() => closeTrade(trade.id)}
                          className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition-colors"
                        >
                          Close Position
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <button
              onClick={() => setActiveTab('portfolio')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              View Full Portfolio & History →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Ledger Entries</h3>
            <p className="text-xs text-slate-400">Audit-backed balance change log</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            View All Transactions →
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No settled transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Reference / Description</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Balance After</th>
                  <th className="pb-3 text-right pr-1">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/20">
                    <td className="py-3">
                      <Badge
                        variant={
                          item.type === 'DEPOSIT' || item.type === 'TRADE_PROFIT'
                            ? 'emerald'
                            : 'red'
                        }
                        size="sm"
                      >
                        {item.type}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="text-slate-200 font-medium">{item.description}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Ref: {item.referenceId}</div>
                    </td>
                    <td className="py-3 text-right font-mono font-bold">
                      <span className={item.type === 'DEPOSIT' || item.type === 'TRADE_PROFIT' ? 'text-emerald-400' : 'text-red-400'}>
                        {item.type === 'DEPOSIT' || item.type === 'TRADE_PROFIT' ? '+' : '-'}BDT {item.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-300">
                      BDT {item.balanceAfter.toLocaleString()}
                    </td>
                    <td className="py-3 text-right pr-1 text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
