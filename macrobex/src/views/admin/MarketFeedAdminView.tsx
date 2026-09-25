import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Radio, 
  AlertOctagon, 
  Activity, 
  RotateCcw, 
  Zap, 
  Sliders, 
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const MarketFeedAdminView: React.FC = () => {
  const {
    state,
    toggleAssetHalt,
    setFeedStatus,
    setFeedLatency,
    triggerPriceSpike,
  } = useSimulation();

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Market Feed & Circuit Breakers</h1>
            <Badge variant={state.systemStatus.feedStatus === 'LIVE' ? 'emerald' : 'red'} size="sm">
              FEED {state.systemStatus.feedStatus}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate market feed volatility, halt specific tickers, test circuit breakers, and adjust stream latency.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Latency: {state.systemStatus.feedLatencyMs}ms</span>
        </div>
      </div>

      {/* Feed Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Feed Reliability State</h3>
        <div className="flex flex-wrap gap-2">
          {(['LIVE', 'DELAYED', 'STALE', 'OFFLINE'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFeedStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                state.systemStatus.feedStatus === status
                  ? status === 'LIVE'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                    : 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Feed: {status}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          Note: If feed is set to <strong className="text-red-400">STALE</strong> or <strong className="text-red-400">OFFLINE</strong>, the trade execution engine will automatically refuse new market orders to protect traders from slippage.
        </p>
      </div>

      {/* Assets & Circuit Breakers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Asset Circuit Breakers</h3>
            <p className="text-xs text-slate-400">Halt individual asset trading independently</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Asset</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 text-right">Price (USD)</th>
                <th className="pb-3 text-right">24h Change</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-2">Circuit Breaker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.assets.map((asset) => (
                <tr key={asset.symbol} className="hover:bg-slate-800/30">
                  <td className="py-3 pl-2 font-bold text-white">
                    {asset.name} <span className="font-mono text-slate-400">({asset.symbol})</span>
                  </td>
                  <td className="py-3 font-mono text-slate-400">{asset.category}</td>
                  <td className="py-3 text-right font-mono font-bold text-slate-200">
                    ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`py-3 text-right font-mono font-semibold ${
                      asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </td>
                  <td className="py-3 text-center">
                    <Badge variant={asset.status === 'OPEN' ? 'emerald' : 'red'} size="sm">
                      {asset.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right pr-2 space-x-2">
                    <button
                      onClick={() => triggerPriceSpike(asset.symbol, 0.05)}
                      className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-400 font-bold"
                    >
                      +5% Spike
                    </button>
                    <button
                      onClick={() =>
                        toggleAssetHalt(
                          asset.symbol,
                          asset.status === 'HALTED'
                            ? 'Trading resumed by market operations'
                            : 'Trading halted by market operations'
                        )
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        asset.status === 'HALTED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                          : 'bg-red-950 text-red-300 border-red-800 hover:bg-red-900'
                      }`}
                    >
                      {asset.status === 'HALTED' ? 'Resume Asset' : 'Halt Trading'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
