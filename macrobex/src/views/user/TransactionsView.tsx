import React, { useState, useMemo } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Receipt, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Check, 
  FileText,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LedgerEntry } from '../../types';

export const TransactionsView: React.FC = () => {
  const { state, currentUser, currentAccountMode } = useSimulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const userEntries = useMemo(() => {
    return state.ledgerEntries.filter(
      (entry) => entry.userId === currentUser.id && entry.accountType === currentAccountMode
    );
  }, [state.ledgerEntries, currentUser.id, currentAccountMode]);

  const filteredEntries = useMemo(() => {
    return userEntries.filter((entry) => {
      const matchesSearch =
        entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'ALL' || entry.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [userEntries, searchQuery, selectedType]);

  const types = [
    'ALL',
    'DEPOSIT',
    'WITHDRAWAL',
    'TRADE_PROFIT',
    'TRADE_LOSS',
    'RESERVATION_HOLD',
    'RESERVATION_RELEASE',
    'REFUND',
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Ledger & Transactions</h1>
            <Badge variant="emerald" size="sm">{currentAccountMode.toUpperCase()} ACCOUNT</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable historical record of every credit, debit, and reservation event.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          Total Entries: <span className="text-white font-bold">{userEntries.length}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Reference (e.g. DEP, WD), or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Type Filter dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Filter Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 text-xs focus:outline-none"
          >
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 pl-4">Transaction ID</th>
                <th className="py-3.5">Type</th>
                <th className="py-3.5">Reference & Description</th>
                <th className="py-3.5 text-right">Amount</th>
                <th className="py-3.5 text-right">Balance Before</th>
                <th className="py-3.5 text-right">Balance After</th>
                <th className="py-3.5 text-right pr-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isPositive =
                    entry.type === 'DEPOSIT' ||
                    entry.type === 'TRADE_PROFIT' ||
                    (entry.type === 'ADJUSTMENT' && entry.amount > 0);

                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 pl-4 font-mono text-slate-300 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span>{entry.id}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(entry.id, entry.id);
                            }}
                            className="text-slate-500 hover:text-slate-300 p-0.5"
                          >
                            {copiedId === entry.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <Badge
                          variant={
                            isPositive
                              ? 'emerald'
                              : entry.type === 'WITHDRAWAL' || entry.type === 'TRADE_LOSS'
                              ? 'red'
                              : 'amber'
                          }
                          size="sm"
                        >
                          {entry.type}
                        </Badge>
                      </td>
                      <td className="py-3.5">
                        <div className="text-slate-200 font-medium">{entry.description}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Ref: {entry.referenceId}
                        </div>
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-sm">
                        <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                          {isPositive ? '+' : '-'}BDT {entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono text-slate-400">
                        BDT {entry.balanceBefore.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-slate-200">
                        BDT {entry.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-right pr-4 font-mono text-slate-400 text-[11px]">
                        {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Ledger Transaction Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Immutable Entry ID: {selectedEntry.id}
            </p>

            <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Type:</span>
                <Badge variant="blue" size="sm">{selectedEntry.type}</Badge>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Account Type:</span>
                <span className="font-semibold text-white uppercase">{selectedEntry.accountType}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Reference Entity:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedEntry.referenceId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount:</span>
                <span className="font-mono font-bold text-white text-sm">BDT {selectedEntry.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Balance Before:</span>
                <span className="font-mono text-slate-300">BDT {selectedEntry.balanceBefore.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Balance After:</span>
                <span className="font-mono font-bold text-cyan-400">BDT {selectedEntry.balanceAfter.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Timestamp:</span>
                <span className="font-mono text-slate-400">{new Date(selectedEntry.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
