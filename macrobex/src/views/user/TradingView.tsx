import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  LineChart, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Info
} from 'lucide-react';
import { AssetChart } from '../../components/charts/AssetChart';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface TradingViewProps {
  initialAssetSymbol?: string;
}

export const TradingView: React.FC<TradingViewProps> = ({ initialAssetSymbol = 'BTC/USDT' }) => {
  const {
    state,
    currentUser,
    currentAccountMode,
    setAccountMode,
    openTrade,
    closeTrade,
    setActiveTab,
  } = useSimulation();

  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialAssetSymbol);
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeAmount, setTradeAmount] = useState<string>('500');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedAsset = state.assets.find((a) => a.symbol === selectedSymbol) || state.assets[0];
  const userWallet = state.wallets[currentUser.id]?.[currentAccountMode] || {
    ledgerBalance: 0,
    reservedBalance: 0,
    availableBalance: 0,
  };

  const parsedAmount = parseFloat(tradeAmount) || 0;
  const estimatedUnits = selectedAsset && selectedAsset.currentPrice > 0 
    ? (parsedAmount / 120) / selectedAsset.currentPrice 
    : 0;

  // Active trades for this user & mode
  const activeTrades = state.trades.filter(
    (t) => t.userId === currentUser.id && t.accountType === currentAccountMode && t.status === 'ACTIVE'
  );
  const closedTrades = state.trades.filter(
    (t) => t.userId === currentUser.id && t.accountType === currentAccountMode && t.status === 'CLOSED'
  );

  const handleValidationAndPrompt = () => {
    setErrorMsg(null);

    if (currentUser.isRestricted) {
      setErrorMsg(`Trading is blocked: Account is restricted (${currentUser.restrictionReason || 'Administrative Compliance Hold'}).`);
      return;
    }

    if (state.systemStatus.feedStatus !== 'LIVE') {
      setErrorMsg(`Cannot execute order: Market feed reliability status is ${state.systemStatus.feedStatus}. To protect traders from stale execution, order creation is disabled.`);
      return;
    }

    if (selectedAsset.status === 'HALTED') {
      setErrorMsg(`Trading is currently halted for ${selectedAsset.symbol} by exchange circuit breaker.`);
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid positive trade amount in BDT.');
      return;
    }

    if (parsedAmount > userWallet.availableBalance) {
      setErrorMsg(
        `Insufficient available balance! You requested BDT ${parsedAmount.toLocaleString()}, but only BDT ${userWallet.availableBalance.toLocaleString()} is available (Ledger: BDT ${userWallet.ledgerBalance.toLocaleString()}, Reserved: BDT ${userWallet.reservedBalance.toLocaleString()}).`
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleExecuteTrade = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const result = openTrade({
      assetSymbol: selectedAsset.symbol,
      direction,
      amount: parsedAmount,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      setShowConfirmModal(false);
      setTradeAmount('500');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner & Account Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Trading Terminal</h1>
            <Badge variant="blue" size="sm">LIVE ENGINE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Execute market and limit orders with instant reservation accounting and real-time PnL tracking.
          </p>
        </div>

        {/* Account Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setAccountMode('main')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentAccountMode === 'main'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Main Account
          </button>
          <button
            onClick={() => setAccountMode('demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentAccountMode === 'demo'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo Account
          </button>
        </div>
      </div>

      {/* Warnings */}
      {state.systemStatus.feedStatus !== 'LIVE' && (
        <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-4 flex items-start gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <strong className="font-bold text-red-100 block">
              Trading Disabled: Feed is {state.systemStatus.feedStatus}
            </strong>
            The market feed has been paused or lost heartbeat. To safeguard against stale price execution, order creation is temporarily disabled.
          </div>
        </div>
      )}

      {/* Main Trading Stage: Chart on Left, Order Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Asset Selector & Interactive Chart */}
        <div className="lg:col-span-2 space-y-4">
          {/* Asset Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
            {state.assets.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => setSelectedSymbol(asset.symbol)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSymbol === asset.symbol
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{asset.symbol}</span>
                <span
                  className={`font-mono text-[10px] ${
                    asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Chart */}
          <AssetChart
            data={selectedAsset.history}
            symbol={selectedAsset.symbol}
            isPositive={selectedAsset.change24h >= 0}
            currentPrice={selectedAsset.currentPrice}
          />
        </div>

        {/* Right 1 Col: Order Placement Ticket */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white tracking-tight">Order Ticket</h3>
              <Badge variant={selectedAsset.status === 'OPEN' ? 'emerald' : 'red'} size="sm">
                {selectedAsset.status}
              </Badge>
            </div>

            {/* Buy / Sell direction toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDirection('BUY')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  direction === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setDirection('SELL')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  direction === 'SELL'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            {/* Available Balance Preview */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Available Balance:</span>
                <span className="font-mono font-bold text-emerald-400">
                  BDT {userWallet.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Ledger (Total):</span>
                <span className="font-mono">BDT {userWallet.ledgerBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Reserved (Locked):</span>
                <span className="font-mono text-amber-400">BDT {userWallet.reservedBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Trade Amount Input */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="font-semibold text-slate-300">Order Margin (BDT)</label>
                <div className="flex gap-1">
                  {[200, 500, 1000, 2500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTradeAmount(preset.toString())}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">
                  BDT
                </span>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Enter amount..."
                />
              </div>
            </div>

            {/* Order Summary Calculations */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Synthetic Asset:</span>
                <span className="font-bold text-white">{selectedAsset.symbol}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Entry Price:</span>
                <span className="font-mono font-semibold text-slate-200">
                  ${selectedAsset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Units:</span>
                <span className="font-mono text-slate-300">
                  {estimatedUnits.toFixed(6)} {selectedAsset.symbol.split('/')[0]}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span className="font-semibold text-slate-200">Reservation Hold:</span>
                <span className="font-mono font-bold text-amber-400">BDT {parsedAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting || state.systemStatus.feedStatus !== 'LIVE' || selectedAsset.status === 'HALTED'}
              onClick={handleValidationAndPrompt}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                direction === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-red-600 hover:bg-red-500 shadow-red-950/40'
              }`}
            >
              {isSubmitting ? 'Verifying & Executing...' : `Review & Open ${direction} Order`}
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-2">
              Virtual execution only. Funds are held in reservation until trade is settled.
            </p>
          </div>
        </div>
      </div>

      {/* Active Trades & Settlement Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Active Trade Positions</h3>
            <p className="text-xs text-slate-400">
              Positions currently holding reservation balance on your {currentAccountMode.toUpperCase()} account.
            </p>
          </div>
          <Badge variant="emerald" size="sm">
            {activeTrades.length} Active
          </Badge>
        </div>

        {activeTrades.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            No active trades open in this account. Use the order ticket above to place an order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Position ID</th>
                  <th className="pb-3">Direction</th>
                  <th className="pb-3">Asset</th>
                  <th className="pb-3 text-right">Margin Held</th>
                  <th className="pb-3 text-right">Entry Price</th>
                  <th className="pb-3 text-right">Current Price</th>
                  <th className="pb-3 text-right">Unrealized P/L</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
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
                  const isProfit = pnl >= 0;

                  return (
                    <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pl-2 font-mono text-slate-300 font-bold">{trade.id}</td>
                      <td className="py-3.5">
                        <Badge variant={trade.direction === 'BUY' ? 'emerald' : 'red'} size="sm">
                          {trade.direction}
                        </Badge>
                      </td>
                      <td className="py-3.5 font-bold text-white">{trade.assetSymbol}</td>
                      <td className="py-3.5 text-right font-mono text-amber-400 font-semibold">
                        BDT {trade.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-300">
                        ${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-100 font-bold">
                        ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold">
                        <span className={isProfit ? 'text-emerald-400' : 'text-red-400'}>
                          {isProfit ? '+' : ''}BDT {pnl.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          onClick={() => closeTrade(trade.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors border border-slate-700"
                        >
                          Close Position
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleExecuteTrade}
        title={`Confirm ${direction} Order: ${selectedAsset.symbol}`}
        description={`You are about to place a virtual ${direction} position for ${selectedAsset.symbol} with margin BDT ${parsedAmount.toLocaleString()}.`}
        confirmLabel={`Execute ${direction}`}
        confirmVariant={direction === 'BUY' ? 'emerald' : 'red'}
        riskWarning="Upon execution, BDT will be locked in the Reserved Balance. Available Balance will decrease immediately. Ledger balance remains constant until position is settled."
      >
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Account:</span>
            <span className="font-semibold text-white uppercase">{currentAccountMode} Account</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Asset:</span>
            <span className="font-bold text-white">{selectedAsset.symbol}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Entry Reference:</span>
            <span className="font-mono text-slate-200">${selectedAsset.currentPrice}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Reservation Lock:</span>
            <span className="font-mono font-bold text-amber-400">BDT {parsedAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
            <span>New Available Balance:</span>
            <span className="font-mono font-bold text-cyan-400">
              BDT {(userWallet.availableBalance - parsedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
};
