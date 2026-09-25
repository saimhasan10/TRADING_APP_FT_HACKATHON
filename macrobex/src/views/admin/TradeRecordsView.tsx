import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Lock, 
  DollarSign
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const TradeRecordsView: React.FC = () => {
  const { state } = useSimulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');

  const filteredTrades = state.trades.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assetSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Platform Trade Audit & Positions</h1>
            <Badge variant="blue" size="sm">GLOBAL ORDER ENGINE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Realtime audit log of all margin reservations, open positions, and settled trades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search trade ID, symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {(['ALL', 'ACTIVE', 'CLOSED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === st
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {st} Positions
          </button>
        ))}
      </div>

      {/* Trades Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3 pl-2">Trade ID</th>
              <th className="pb-3">User</th>
              <th className="pb-3">Symbol</th>
              <th className="pb-3">Side</th>
              <th className="pb-3 text-right">Entry Price</th>
              <th className="pb-3 text-right">Amount (BDT)</th>
              <th className="pb-3 text-right">Reserved Balance</th>
              <th className="pb-3 text-right">PnL (BDT)</th>
              <th className="pb-3 text-right pr-2">Opened At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTrades.map((t) => (
              <tr key={t.id} className="hover:bg-slate-800/30">
                <td className="py-3 pl-2 font-mono font-bold text-slate-300">{t.id}</td>
                <td className="py-3 font-mono text-slate-400">{t.userId}</td>
                <td className="py-3 font-bold text-white">{t.assetSymbol}</td>
                <td className="py-3">
                  <Badge variant={t.direction === 'BUY' ? 'emerald' : 'red'} size="sm">
                    {t.direction}
                  </Badge>
                </td>
                <td className="py-3 text-right font-mono text-slate-200">
                  ${t.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 text-right font-mono text-slate-300">BDT {t.amount.toLocaleString()}</td>
                <td className="py-3 text-right font-mono font-semibold text-amber-400">
                  BDT {t.reservedAmount.toLocaleString()}
                </td>
                <td
                  className={`py-3 text-right font-mono font-bold ${
                    (t.realizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {(t.realizedPnL || 0) >= 0 ? '+' : ''}BDT {(t.realizedPnL || 0).toLocaleString()}
                </td>
                <td className="py-3 text-right pr-2 font-mono text-slate-500 text-[11px]">
                  {new Date(t.entryTime).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
