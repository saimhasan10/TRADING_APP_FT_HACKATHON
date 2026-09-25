import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  FileCheck, 
  Upload, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  FileText,
  User,
  Info
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const VerificationView: React.FC = () => {
  const { state, currentUser, submitVerification } = useSimulation();

  const userVerif = state.verifications.find((v) => v.userId === currentUser.id);

  const [documentType, setDocumentType] = useState<'NID' | 'PASSPORT' | 'DRIVING_LICENSE'>(
    userVerif?.documentType || 'NID'
  );
  const [documentNumber, setDocumentNumber] = useState(userVerif?.documentNumber || '1992847291039');
  const [fullName, setFullName] = useState(currentUser.name);
  const [dateOfBirth, setDateOfBirth] = useState('1994-08-15');
  const [address, setAddress] = useState('House 42, Road 11, Banani, Dhaka');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    submitVerification({
      userId: currentUser.id,
      documentType,
      documentNumber,
      frontImage: `simulated_front_${documentType.toLowerCase()}.png`,
      backImage: `simulated_back_${documentType.toLowerCase()}.png`,
      selfieImage: 'simulated_selfie.png',
    });

    setIsSubmitting(false);
  };

  const statusVariants: Record<string, 'emerald' | 'amber' | 'red' | 'slate'> = {
    VERIFIED: 'emerald',
    PENDING: 'amber',
    REJECTED: 'red',
    RESUBMISSION_REQUIRED: 'amber',
  };

  const currentStatus = userVerif?.status || currentUser.verificationStatus;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Identity Verification (KYC)</h1>
            <Badge variant={statusVariants[currentStatus]} size="md">
              {currentStatus}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official compliance verification. High-tier trading and fiat withdrawals require approved status.
          </p>
        </div>
      </div>

      {/* Current Status Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              {currentStatus === 'VERIFIED' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : currentStatus === 'REJECTED' ? (
                <XCircle className="w-5 h-5 text-red-400" />
              ) : (
                <Clock className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Verification Status: {currentStatus}</h3>
              <p className="text-xs text-slate-400">
                {currentStatus === 'VERIFIED'
                  ? 'Your account identity has passed compliance checks. Full withdrawal limits unlocked.'
                  : currentStatus === 'PENDING'
                  ? 'Your identity documents are in the compliance review queue.'
                  : 'Action required on your identity application.'}
              </p>
            </div>
          </div>

          <Badge variant={statusVariants[currentStatus]} size="sm">
            {currentStatus}
          </Badge>
        </div>

        {userVerif?.reviewerNotes && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-200">
            <strong className="block font-semibold text-red-100 mb-0.5">Compliance Reviewer Note:</strong>
            {userVerif.reviewerNotes}
          </div>
        )}
      </div>

      {/* Verification Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-2">KYC Document Submission</h3>
        <p className="text-xs text-slate-400 mb-6">
          Provide your identity credentials below to update or submit your verification profile.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="NID">National ID Card (Bangladesh NID)</option>
                <option value="PASSPORT">International Passport</option>
                <option value="DRIVING_LICENSE">Driving License (BRTA)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Document Number</label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Document Preview Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Document Attachments</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center text-xs text-slate-400 hover:border-slate-700 cursor-pointer">
                <Upload className="w-5 h-5 mx-auto text-emerald-400 mb-1.5" />
                <div className="font-semibold text-slate-200">Front Document</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">doc_front.png</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center text-xs text-slate-400 hover:border-slate-700 cursor-pointer">
                <Upload className="w-5 h-5 mx-auto text-emerald-400 mb-1.5" />
                <div className="font-semibold text-slate-200">Back Document</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">doc_back.png</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-center text-xs text-slate-400 hover:border-slate-700 cursor-pointer">
                <User className="w-5 h-5 mx-auto text-purple-400 mb-1.5" />
                <div className="font-semibold text-slate-200">Live Selfie Check</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">selfie_liveness.png</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit / Update KYC Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
