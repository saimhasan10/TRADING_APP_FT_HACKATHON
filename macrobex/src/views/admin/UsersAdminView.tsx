import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Edit3, 
  Wallet,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const UsersAdminView: React.FC = () => {
  const { state, currentUser, toggleUserRestriction, updateUserRole } = useSimulation();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = state.users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">User Accounts & Access Control</h1>
            <Badge variant="purple" size="sm">RBAC GOVERNANCE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage user roles, identity verification tiers, trading restrictions, and account balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3 pl-2">User</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">KYC Status</th>
              <th className="pb-3 text-right">Ledger Balance</th>
              <th className="pb-3 text-right">Available Balance</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredUsers.map((u) => {
              const wallet = state.wallets[u.id]?.['main'];
              const isSelf = u.id === currentUser.id;

              return (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-3 pl-2">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email} ({u.id})</div>
                  </td>

                  <td className="py-3">
                    <select
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => updateUserRole(u.id, e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="USER">USER</option>
                      <option value="KYC_REVIEWER">KYC_REVIEWER</option>
                      <option value="FINANCIAL_REVIEWER">FINANCIAL_REVIEWER</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  </td>

                  <td className="py-3">
                    <Badge
                      variant={u.verificationStatus === 'VERIFIED' ? 'emerald' : 'amber'}
                      size="sm"
                    >
                      {u.verificationStatus}
                    </Badge>
                  </td>

                  <td className="py-3 text-right font-mono font-bold text-white">
                    BDT {wallet?.ledgerBalance?.toLocaleString() || '0'}
                  </td>

                  <td className="py-3 text-right font-mono font-bold text-cyan-400">
                    BDT {wallet?.availableBalance?.toLocaleString() || '0'}
                  </td>

                  <td className="py-3 text-center">
                    {u.isRestricted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800">
                        <Lock className="w-3 h-3" />
                        RESTRICTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800">
                        ACTIVE
                      </span>
                    )}
                  </td>

                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={() =>
                        toggleUserRestriction(
                          u.id,
                          u.isRestricted ? 'Restriction lifted by admin' : 'Trading restricted by compliance desk'
                        )
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        u.isRestricted
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                          : 'bg-red-950/60 text-red-300 border-red-800 hover:bg-red-900/60'
                      }`}
                    >
                      {u.isRestricted ? 'Remove Restriction' : 'Restrict Trading'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
