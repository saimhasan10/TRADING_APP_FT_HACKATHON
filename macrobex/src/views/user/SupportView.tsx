import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  LifeBuoy, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Shield, 
  Link2,
  FileText
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { SupportTicket } from '../../types';

export const SupportView: React.FC = () => {
  const { state, currentUser, createTicket, replyToTicket } = useSimulation();

  const userTickets = state.tickets.filter((t) => t.userId === currentUser.id);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    userTickets[0]?.id || 'TKT-101'
  );
  const [replyText, setReplyText] = useState('');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  // New ticket form state
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<'DEPOSIT' | 'WITHDRAWAL' | 'TRADE' | 'KYC' | 'ACCOUNT' | 'OTHER'>('WITHDRAWAL');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [newRelatedId, setNewRelatedId] = useState('WD-1007');
  const [newDescription, setNewDescription] = useState('');

  const selectedTicket = state.tickets.find((t) => t.id === selectedTicketId) || userTickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    replyToTicket({
      ticketId: selectedTicket.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: replyText.trim(),
    });

    setReplyText('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    createTicket({
      subject: newSubject.trim(),
      description: newDescription.trim(),
      category: newCategory as any,
      priority: newPriority as any,
      linkedEntity: newRelatedId.trim() ? { type: 'TRANSACTION', id: newRelatedId.trim() } : undefined,
    });

    setIsNewTicketOpen(false);
    setNewSubject('');
    setNewDescription('');
  };

  const statusColors: Record<string, 'emerald' | 'amber' | 'blue' | 'slate'> = {
    RESOLVED: 'emerald',
    IN_REVIEW: 'amber',
    OPEN: 'blue',
    CLOSED: 'slate',
  };

  const priorityColors: Record<string, 'emerald' | 'amber' | 'red' | 'purple' | 'slate'> = {
    LOW: 'slate',
    MEDIUM: 'purple',
    HIGH: 'amber',
    CRITICAL: 'red',
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Support & Escalations</h1>
            <Badge variant="blue" size="sm">OPS TICKET DESK</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Direct communication channel with MacroBex compliance and operations reviewers.
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Two-pane Ticket Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Pane: Tickets List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Inquiries</h3>
            <span className="text-xs text-slate-500 font-mono">{userTickets.length} Total</span>
          </div>

          {userTickets.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No support tickets found.</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {userTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-300">{t.id}</span>
                      <Badge variant={statusColors[t.status]} size="sm">{t.status}</Badge>
                    </div>

                    <h4 className="text-xs font-semibold text-white truncate">{t.subject}</h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                      <span>{t.category}</span>
                      <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Selected Ticket Thread */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[500px]">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="pb-4 border-b border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{selectedTicket.id}</span>
                    <Badge variant={statusColors[selectedTicket.status]} size="sm">
                      {selectedTicket.status}
                    </Badge>
                    <Badge variant={priorityColors[selectedTicket.priority]} size="sm">
                      {selectedTicket.priority} PRIORITY
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Opened: {new Date(selectedTicket.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white tracking-tight">{selectedTicket.subject}</h2>

                {selectedTicket.linkedEntity && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Linked Entity: {selectedTicket.linkedEntity.type} #{selectedTicket.linkedEntity.id}</span>
                  </div>
                )}
              </div>

              {/* Message Thread */}
              <div className="flex-1 py-4 space-y-4 overflow-y-auto max-h-[360px] pr-2">
                {selectedTicket.messages.map((msg) => {
                  const isStaff = ['SUPER_ADMIN', 'FINANCIAL_REVIEWER', 'KYC_REVIEWER', 'SUPPORT_AGENT'].includes(msg.senderRole);

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 text-xs ${isStaff ? 'bg-slate-950/80' : 'bg-slate-800/40'} p-3.5 rounded-xl border border-slate-800`}
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
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to the support team..."
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select a ticket to view the conversation.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Create New Support Ticket</h3>
            <p className="text-xs text-slate-400 mb-4">
              Escalate a transaction, account, or compliance inquiry to operations reviewers.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Inquiring regarding pending withdrawal WD-1007"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="WITHDRAWAL">Withdrawal Issue</option>
                    <option value="DEPOSIT">Deposit Issue</option>
                    <option value="TRADE">Trading / Margin</option>
                    <option value="KYC">KYC Verification</option>
                    <option value="ACCOUNT">Account Access</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Linked Transaction / Entity ID</label>
                <input
                  type="text"
                  value={newRelatedId}
                  onChange={(e) => setNewRelatedId(e.target.value)}
                  placeholder="e.g. WD-1007, DEP-2001"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Description</label>
                <textarea
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explain what happened and what assistance you need..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/40"
                >
                  Open Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
