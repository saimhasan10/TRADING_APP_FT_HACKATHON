import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  LifeBuoy, 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  Shield, 
  Link2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const SupportTicketsAdminView: React.FC = () => {
  const { state, currentUser, replyToTicket, updateTicketStatus, setActiveAdminTab } = useSimulation();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    state.tickets[0]?.id || 'TKT-101'
  );
  const [adminReply, setAdminReply] = useState('');

  const selectedTicket = state.tickets.find((t) => t.id === selectedTicketId) || state.tickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReply.trim() || !selectedTicket) return;

    replyToTicket({
      ticketId: selectedTicket.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: adminReply.trim(),
    });

    setAdminReply('');
  };

  const statusColors: Record<string, 'emerald' | 'amber' | 'blue' | 'slate'> = {
    RESOLVED: 'emerald',
    IN_REVIEW: 'amber',
    OPEN: 'blue',
    CLOSED: 'slate',
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Support & Escalations Desk</h1>
            <Badge variant="blue" size="sm">COMPLIANCE COMM</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Resolve user inquiries, explain reservation holds, and provide grounded regulatory transparency.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          Open Inquiries: <strong className="text-white">{state.tickets.filter((t) => t.status !== 'RESOLVED').length}</strong>
        </div>
      </div>

      {/* 2-Pane Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ticket list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">All User Tickets</h3>
            <span className="text-xs text-slate-500 font-mono">{state.tickets.length} total</span>
          </div>

          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {state.tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-blue-500/70 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-200">{t.id}</span>
                    <Badge variant={statusColors[t.status]} size="sm">{t.status}</Badge>
                  </div>

                  <h4 className="text-xs font-semibold text-white truncate">{t.subject}</h4>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 pt-1 border-t border-slate-800/60">
                    <span>User: {t.userId}</span>
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Ticket Thread */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[540px]">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="pb-4 border-b border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300">{selectedTicket.id}</span>
                    <Badge variant={statusColors[selectedTicket.status]} size="sm">
                      {selectedTicket.status}
                    </Badge>
                    <Badge variant="amber" size="sm">{selectedTicket.priority} PRIORITY</Badge>
                  </div>

                  {/* Status update controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Mark Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_REVIEW">IN_REVIEW</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                <h2 className="text-base font-bold text-white tracking-tight">{selectedTicket.subject}</h2>

                {selectedTicket.linkedEntity && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Linked Transaction Entity: {selectedTicket.linkedEntity.type} #{selectedTicket.linkedEntity.id}</span>
                    <button
                      onClick={() => setActiveAdminTab('withdrawals')}
                      className="underline text-[11px] text-slate-400 hover:text-white"
                    >
                      (Inspect in Desk)
                    </button>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[360px] pr-2">
                {selectedTicket.messages.map((msg) => {
                  const isStaff = ['SUPER_ADMIN', 'FINANCIAL_REVIEWER', 'KYC_REVIEWER', 'SUPPORT_AGENT'].includes(msg.senderRole);

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 text-xs ${isStaff ? 'bg-slate-950' : 'bg-slate-800/40'} p-3.5 rounded-xl border border-slate-800`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isStaff
                            ? 'bg-purple-950 border border-purple-800 text-purple-300'
                            : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                        }`}
                      >
                        {isStaff ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{msg.senderName}</span>
                            <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.2 rounded bg-slate-800">
                              {msg.senderRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    placeholder="Type official compliance response..."
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!adminReply.trim()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select a ticket from the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
