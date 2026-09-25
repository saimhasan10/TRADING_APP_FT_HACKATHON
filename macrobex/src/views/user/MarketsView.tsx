import React, { useState, useMemo } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Search, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ArrowUpDown, 
  SlidersHorizontal,
  LineChart,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { MiniSparkline } from '../../components/charts/MiniSparkline';
import { Badge } from '../../components/common/Badge';
import { Asset, AssetCategory } from '../../types';

export const MarketsView: React.FC<{ onSelectTradeAsset?: (symbol: string) => void }> = ({ onSelectTradeAsset }) => {
  const { state, setActiveTab } = useSimulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortField, setSortField] = useState<'symbol' | 'price' | 'change'>('symbol');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'BTC/USDT': true,
    'ETH/USDT': true,
    'USD/BDT': true,
  });

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) => ({ ...prev, [symbol]: !prev[symbol] }));
  };

  const categories = ['ALL', 'CRYPTO', 'COMMODITY', 'FOREX'];

  const filteredAssets = useMemo(() => {
    return state.assets
      .filter((asset) => {
        const matchesSearch =
          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
        const matchesFavorites = !showFavoritesOnly || favorites[asset.symbol];
        return matchesSearch && matchesCategory && matchesFavorites;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'symbol') diff = a.symbol.localeCompare(b.symbol);
        if (sortField === 'price') diff = a.currentPrice - b.currentPrice;
        if (sortField === 'change') diff = a.change24hPct - b.change24hPct;
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [state.assets, searchQuery, selectedCategory, showFavoritesOnly, sortField, sortOrder, favorites]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Market Prices</h1>
            <Badge variant={state.systemStatus.feedStatus === 'LIVE' ? 'emerald' : 'red'} size="sm">
              {state.systemStatus.feedStatus}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time market feeds streaming tick-level updates and order book depth.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <Radio className={`w-3.5 h-3.5 ${state.systemStatus.feedStatus === 'LIVE' ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
          <span>Heartbeat Latency: {state.systemStatus.feedLatencyMs}ms</span>
        </div>
      </div>

      {/* Feed Warning if Stale */}
      {state.systemStatus.feedStatus !== 'LIVE' && (
        <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-4 flex items-start gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <strong className="font-bold text-red-100 block">
              Market Reliability Notice: Feed Status is {state.systemStatus.feedStatus}
            </strong>
            Last recorded update: {new Date(state.systemStatus.lastFeedUpdate).toLocaleTimeString()}.
            New orders are strictly blocked until market feed heartbeat is restored to LIVE.
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search symbol or name (e.g. BTC, Gold, EUR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              showFavoritesOnly
                ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorites</span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Sort:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 text-xs focus:outline-none"
          >
            <option value="symbol">Symbol</option>
            <option value="price">Price</option>
            <option value="change">24h Change</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400"
            title="Toggle Sort Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Assets Grid / Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 pl-4 w-10">Fav</th>
                <th className="py-3.5 pl-2">Asset</th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5 text-right">Price</th>
                <th className="py-3.5 text-right">24h Change</th>
                <th className="py-3.5 text-right hidden sm:table-cell">24h High / Low</th>
                <th className="py-3.5 text-center hidden md:table-cell">Market Trend</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No matching assets found. Try adjusting your search or filters.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isPos = asset.change24h >= 0;
                  const isFav = !!favorites[asset.symbol];
                  const isHalted = asset.status === 'HALTED';

                  return (
                    <tr key={asset.symbol} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pl-4">
                        <button
                          onClick={() => toggleFavorite(asset.symbol)}
                          className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3.5 pl-2">
                        <div className="font-bold text-white text-sm">{asset.symbol}</div>
                        <div className="text-[11px] text-slate-400">{asset.name}</div>
                      </td>
                      <td className="py-3.5">
                        <Badge variant="slate" size="sm">{asset.category}</Badge>
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-slate-100 text-sm">
                        ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </td>
                      <td className="py-3.5 text-right font-mono">
                        <div className={`font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPos ? '+' : ''}{asset.change24hPct}%
                        </div>
                        <div className={`text-[10px] ${isPos ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                          {isPos ? '+' : ''}${asset.change24h.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3.5 text-right font-mono text-[11px] text-slate-400 hidden sm:table-cell">
                        <div>H: ${asset.high24h.toFixed(2)}</div>
                        <div className="text-slate-500">L: ${asset.low24h.toFixed(2)}</div>
                      </td>
                      <td className="py-3.5 text-center hidden md:table-cell">
                        <div className="inline-block">
                          <MiniSparkline data={asset.history} isPositive={isPos} width={110} height={32} />
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <Badge variant={isHalted ? 'red' : 'emerald'} size="sm">
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <button
                          onClick={() => {
                            if (onSelectTradeAsset) onSelectTradeAsset(asset.symbol);
                            setActiveTab('trading');
                          }}
                          disabled={isHalted || state.systemStatus.feedStatus !== 'LIVE'}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Simulation pricing engine updates automatically every 2–3 seconds.</span>
          <span className="text-slate-400 font-mono">Last update: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};
