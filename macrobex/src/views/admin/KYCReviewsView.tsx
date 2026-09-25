import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  FileCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  User, 
  Eye, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const KYCReviewsView: React.FC = () => {
  const { state, currentUser, reviewKYC } = useSimulation();

  const [selectedVerifId, setSelectedVerifId] = useState<string>(
    state.verifications[0]?.id || ''
  );
  const [rejectionReason, setRejectionReason] = useState('Document image blurry or cropped. Please resubmit clear copy.');

  const selectedVerif = state.verifications.find((v) => v.id === selectedVerifId) || state.verifications[0];
  const targetUser = state.users.find((u) => u.id === selectedVerif?.userId);

  const handleAction = (status: 'VERIFIED' | 'REJECTED' | 'RESUBMISSION_REQUIRED') => {
    if (!selectedVerif) return;
    reviewKYC(
      selectedVerif.id,
      status,
      status !== 'VERIFIED' ? rejectionReason : `Verified by ${currentUser.name}`
    );
  };

  const statusColors: Record<string, 'emerald' | 'amber' | 'red' | 'slate'> = {
    VERIFIED: 'emerald',
    PENDING: 'amber',
    RESUBMISSION_REQUIRED: 'amber',
    REJECTED: 'red',
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Identity Compliance Reviews (KYC)</h1>
            <Badge variant="purple" size="sm">KYC WORKSPACE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Examine submitted identity credentials, verify document numbers, and manage compliance tiers.
          </p>
        </div>

        <div className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
          Pending Reviews: <strong className="text-amber-400 font-bold">{state.verifications.filter((v) => v.status === 'PENDING').length}</strong>
        </div>
      </div>

      {/* 2-Column Desktop View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Submissions */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identity Applications</h3>
            <span className="text-xs text-slate-500 font-mono">{state.verifications.length} records</span>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {state.verifications.map((v) => {
              const isSelected = selectedVerif?.id === v.id;
              const u = state.users.find((user) => user.id === v.userId);

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVerifId(v.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-purple-500/70 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">{v.id}</span>
                      <Badge variant="purple" size="sm">{v.documentType}</Badge>
                    </div>
                    <Badge variant={statusColors[v.status]} size="sm">{v.status}</Badge>
                  </div>

                  <div className="text-xs text-slate-300">
                    User: <strong className="text-white">{u?.name || v.userId}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/60">
                    <span>Doc: {v.documentNumber}</span>
                    <span>{new Date(v.submissionDate || v.submittedAt || '').toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 Cols): Inspection */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[600px]">
          {selectedVerif ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white font-mono">{selectedVerif.id}</h2>
                    <Badge variant={statusColors[selectedVerif.status]} size="sm">
                      {selectedVerif.status}
                    </Badge>
                    <Badge variant="slate" size="sm">{selectedVerif.documentType}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    User: <strong className="text-slate-200 font-mono">{selectedVerif.userId}</strong> ({targetUser?.name}) | Submitted:{' '}
                    {new Date(selectedVerif.submissionDate || selectedVerif.submittedAt || '').toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-200">
                    {selectedVerif.documentNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Government ID Serial</div>
                </div>
              </div>

              {/* Document Previews */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Document Verification Artifacts
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-purple-400">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-xs text-white">Front Document Proof</div>
                    <div className="text-[11px] text-slate-400 font-mono">{selectedVerif.frontDocUrl}</div>
                    <Badge variant="emerald" size="sm">OCR CHECK: MATCH</Badge>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-purple-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-xs text-white">Back / Supplementary Proof</div>
                    <div className="text-[11px] text-slate-400 font-mono">{selectedVerif.backDocUrl || 'back_doc_sim.png'}</div>
                    <Badge variant="emerald" size="sm">FACIAL MATCH: 98.4%</Badge>
                  </div>
                </div>
              </div>

              {/* Review notes and rejection reason */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Compliance Decision Note / Resubmission Requirement:
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleAction('RESUBMISSION_REQUIRED')}
                  className="px-4 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Resubmission</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('REJECTED')}
                  className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject KYC</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('VERIFIED')}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Verify Account</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select an application from the list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
