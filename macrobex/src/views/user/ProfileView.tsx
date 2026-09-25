import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  Smartphone, 
  Mail, 
  MapPin, 
  KeyRound, 
  Activity,
  LogOut
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    setCurrentUserById,
    state,
    resetDemoData,
    logout,
  } = useSimulation();

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Trader Profile & Security</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Account credentials, tier limits, and session security settings.
          </p>
        </div>

        <Badge variant={currentUser.verificationStatus === 'VERIFIED' ? 'emerald' : 'amber'} size="md">
          TIER 2 {currentUser.verificationStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl font-bold text-emerald-300">
                {currentUser.name.charAt(0)}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="purple" size="sm">{currentUser.role}</Badge>
                <Badge variant="emerald" size="sm">ACTIVE</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                Phone:
              </span>
              <span className="font-mono">{currentUser.phone || '+880 1711-223344'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Jurisdiction:
              </span>
              <span>Dhaka, Bangladesh</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Two-Factor Auth (2FA):
              </span>
              <span className="text-emerald-400 font-semibold">Enabled (TOTP)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Last IP Check:
              </span>
              <span className="font-mono text-slate-400">103.25.12.84</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={resetDemoData}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Seed Data</span>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-950 hover:bg-red-950/40 border border-slate-800 text-red-400 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Columns: Limits & Persona Switching */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Limits */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Tier 2 Trading & Payout Limits</h3>
            <p className="text-xs text-slate-400">
              Limits enforced automatically across double-entry balance reservations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[11px] font-sans">Single Order Max</span>
                <span className="text-base font-bold text-white mt-1 block">BDT 50,000</span>
                <span className="text-[10px] text-emerald-400 font-sans">Available per trade</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[11px] font-sans">Daily Withdrawal Limit</span>
                <span className="text-base font-bold text-white mt-1 block">BDT 100,000</span>
                <span className="text-[10px] text-amber-400 font-sans">BDT 3,000 pending today</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[11px] font-sans">Leverage Setting</span>
                <span className="text-base font-bold text-white mt-1 block">1:1 (Spot Margin)</span>
                <span className="text-[10px] text-slate-400 font-sans">Zero debt simulation</span>
              </div>
            </div>
          </div>

          {/* Quick Persona Switcher for Hackathon Testing */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Hackathon Persona Quick Switcher</h3>
                <p className="text-xs text-slate-400">
                  Switch between demo trader and operations roles instantly to test RBAC and reviews.
                </p>
              </div>
              <Badge variant="purple" size="sm">TEST CONTROLS</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => setCurrentUserById(u.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    currentUser.id === u.id
                      ? 'bg-emerald-950/50 border-emerald-500/60 shadow-md'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white text-xs">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                    <div className="mt-1">
                      <Badge variant="purple" size="sm">{u.role}</Badge>
                    </div>
                  </div>
                  {currentUser.id === u.id && (
                    <span className="text-xs text-emerald-400 font-bold">ACTIVE</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
