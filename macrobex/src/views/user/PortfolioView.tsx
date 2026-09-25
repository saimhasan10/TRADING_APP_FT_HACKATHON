import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { Badge } from '../../components/common/Badge';

export const PortfolioView: React.FC = () => {
  const { state, currentUser, currentAccountMode, closeTrade } = useSimulation();

  const userWallet = state.wallets[currentUser.id]?.[currentAccountMode] || {
    ledgerBalance: 0,
    reservedBalance: 0,
    availableBalance: 0,
  };

  const activeTrades = state.trades.filter(
    (t) => t.userId === currentUser.id && t.accountType === currentAccountMode && t.status === 'ACTIVE'
  );
  const closedTrades = state.trades.filter(
    (t) => t.userId === currentUser.id && t.accountType === currentAccountMode && t.status === 'CLOSED'
  );

  // Compute live unrealized PnL
  let unrealizedPnL = 0;
  activeTrades.forEach((trade) => {
    const asset = state.assets.find((a) => a.symbol === trade.assetSymbol);
    const currPrice = asset ? asset.currentPrice : trade.entryPrice;
    if (trade.direction === 'BUY') {
      unrealizedPnL += trade.amount * ((currPrice - trade.entryPrice) / trade.entryPrice);
    } else {
      unrealizedPnL += trade.amount * ((trade.entryPrice - currPrice) / trade.entryPrice);
    }
  });
  unrealizedPnL = Number(unrealizedPnL.toFixed(2));

  // Compute historical realized PnL
  let realizedPnL = 0;
  closedTrades.forEach((t) => {
    realizedPnL += t.realizedPnL || 0;
  });
  realizedPnL = Number(realizedPnL.toFixed(2));

  const totalPortfolioValue = Number((userWallet.ledgerBalance + unrealizedPnL).toFixed(2));

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Portfolio & Performance</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your asset allocation, live unrealized position marks, and settled trade records.
          </p>
        </div>
        <Badge variant="emerald" size="md">
          {currentAccountMode.toUpperCase()} ACCOUNT
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Portfolio Value"
          value={`BDT ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subValue="Ledger balance + live unrealized PnL"
          icon={<PieChart className="w-4 h-4 text-emerald-400" />}
        />

        <MetricCard
          label="Unrealized PnL"
          value={`${unrealizedPnL >= 0 ? '+' : ''}BDT ${unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subValue={`${activeTrades.length} open position${activeTrades.length === 1 ? '' : 's'}`}
          isPositive={unrealizedPnL >= 0}
          icon={unrealizedPnL >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
        />

        <MetricCard
          label="Realized PnL"
          value={`${realizedPnL >= 0 ? '+' : ''}BDT ${realizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subValue={`From ${closedTrades.length} settled trade${closedTrades.length === 1 ? '' : 's'}`}
          isPositive={realizedPnL >= 0}
          icon={realizedPnL >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
        />

        <MetricCard
          label="Ledger vs Available"
          value={`BDT ${userWallet.availableBalance.toLocaleString()}`}
          subValue={`Ledger: BDT ${userWallet.ledgerBalance.toLocaleString()} | Reserved: BDT ${userWallet.reservedBalance.toLocaleString()}`}
          icon={<Receipt className="w-4 h-4 text-cyan-400" />}
        />
      </div>

      {/* Active Positions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">Active Open Positions</h3>
          <Badge variant="blue" size="sm">{activeTrades.length} Active</Badge>
        </div>

        {activeTrades.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No active positions in this account.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Trade ID</th>
                  <th className="pb-3">Asset</th>
                  <th className="pb-3">Side</th>
                  <th className="pb-3 text-right">Margin Held</th>
                  <th className="pb-3 text-right">Entry Price</th>
                  <th className="pb-3 text-right">Current Price</th>
                  <th className="pb-3 text-right">Unrealized PnL</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeTrades.map((t) => {
                  const asset = state.assets.find((a) => a.symbol === t.assetSymbol);
                  const currPrice = asset ? asset.currentPrice : t.entryPrice;
                  let pnl = 0;
                  if (t.direction === 'BUY') {
                    pnl = t.amount * ((currPrice - t.entryPrice) / t.entryPrice);
                  } else {
                    pnl = t.amount * ((t.entryPrice - currPrice) / t.entryPrice);
                  }
                  pnl = Number(pnl.toFixed(2));
                  const isProfit = pnl >= 0;

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-bold text-slate-200">{t.id}</td>
                      <td className="py-3 font-bold text-white">{t.assetSymbol}</td>
                      <td className="py-3">
                        <Badge variant={t.direction === 'BUY' ? 'emerald' : 'red'} size="sm">
                          {t.direction}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-mono text-amber-400 font-semibold">
                        BDT {t.amount.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-400">${t.entryPrice}</td>
                      <td className="py-3 text-right font-mono text-slate-200 font-bold">${currPrice}</td>
                      <td className="py-3 text-right font-mono font-bold">
                        <span className={isProfit ? 'text-emerald-400' : 'text-red-400'}>
                          {isProfit ? '+' : ''}BDT {pnl.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => closeTrade(t.id)}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Closed Positions History */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">Settled Trades History</h3>
          <span className="text-xs text-slate-400 font-mono">{closedTrades.length} Total</span>
        </div>

        {closedTrades.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No settled trade history yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Trade ID</th>
                  <th className="pb-3">Side</th>
                  <th className="pb-3">Asset</th>
                  <th className="pb-3 text-right">Settled Amount</th>
                  <th className="pb-3 text-right">Entry Price</th>
                  <th className="pb-3 text-right">Exit Price</th>
                  <th className="pb-3 text-right">Realized PnL</th>
                  <th className="pb-3 text-right">Closed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {closedTrades.map((t) => {
                  const isProfit = (t.realizedPnL || 0) >= 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/20">
                      <td className="py-3 font-mono text-slate-400">{t.id}</td>
                      <td className="py-3">
                        <Badge variant={t.direction === 'BUY' ? 'emerald' : 'red'} size="sm">
                          {t.direction}
                        </Badge>
                      </td>
                      <td className="py-3 font-bold text-white">{t.assetSymbol}</td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        BDT {t.amount.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-400">${t.entryPrice}</td>
                      <td className="py-3 text-right font-mono text-slate-300">${t.closingPrice || t.entryPrice}</td>
                      <td className="py-3 text-right font-mono font-bold">
                        <span className={isProfit ? 'text-emerald-400' : 'text-red-400'}>
                          {isProfit ? '+' : ''}BDT {(t.realizedPnL || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500">
                        {t.closingTime ? new Date(t.closingTime).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
