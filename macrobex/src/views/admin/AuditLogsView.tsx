import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  ChevronRight, 
  Database,
  Lock,
  Calendar
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const AuditLogsView: React.FC = () => {
  const { state } = useSimulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = state.auditLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const actionStr = (log.eventType || log.action || '').toLowerCase();
    const entityStr = (log.entityId || '').toLowerCase();
    const opStr = (log.actorName || log.operatorName || '').toLowerCase();
    const idempStr = (log.idempotencyKey || '').toLowerCase();
    const reasonStr = (log.reason || '').toLowerCase();
    return actionStr.includes(q) || entityStr.includes(q) || opStr.includes(q) || idempStr.includes(q) || reasonStr.includes(q);
  });

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `macrobex_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Immutable Compliance Audit Log</h1>
            <Badge variant="purple" size="sm">AUDIT VAULT</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tamper-evident record of all balance changes, administrative decisions, approvals, and system state transitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, entity ID, operator, or idempotency key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing {filteredLogs.length} of {state.auditLogs.length} records
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3 pl-2 w-8"></th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Entity Type & ID</th>
              <th className="pb-3">Operator</th>
              <th className="pb-3">Idempotency Key</th>
              <th className="pb-3 text-right pr-2">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;

              return (
                <React.Fragment key={log.id}>
                  <tr
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 pl-2 text-slate-500">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-200">
                      <Badge variant="blue" size="sm">{log.eventType || log.action || 'EVENT'}</Badge>
                    </td>
                    <td className="py-3 font-mono text-emerald-400 font-semibold">
                      {log.entityType}: {log.entityId}
                    </td>
                    <td className="py-3 text-slate-300">
                      {log.actorName || log.operatorName} ({log.actorRole || log.operatorRole || 'SUPER_ADMIN'})
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-400">
                      {log.idempotencyKey || '—'}
                    </td>
                    <td className="py-3 text-right pr-2 font-mono text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-950/80">
                      <td colSpan={6} className="p-4 border-t border-b border-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                            <span className="text-slate-500 block text-[10px] uppercase font-bold font-sans">
                              Before State Snapshot
                            </span>
                            <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(log.previousState || log.beforeState || { note: log.reason || 'None' }, null, 2)}
                            </pre>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                            <span className="text-emerald-400 block text-[10px] uppercase font-bold font-sans">
                              After State Snapshot
                            </span>
                            <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(log.newState || log.afterState || { result: log.result, reason: log.reason }, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
