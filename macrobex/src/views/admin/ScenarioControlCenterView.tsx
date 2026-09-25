import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  Radio, 
  FileCheck, 
  Lock,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const ScenarioControlCenterView: React.FC = () => {
  const {
    state,
    currentUser,
    setCurrentUserById,
    setPortalMode,
    setActiveTab,
    setActiveAdminTab,
    triggerScenario1,
    triggerScenario2,
    triggerScenario3,
    triggerScenario4,
    triggerScenario5,
    triggerScenario6,
    resetDemoData,
  } = useSimulation();

  const [activeScenarioSuccess, setActiveScenarioSuccess] = useState<string | null>(null);

  const handleTrigger = (scenarioName: string, triggerFn: () => void) => {
    triggerFn();
    setActiveScenarioSuccess(`Successfully activated ${scenarioName}`);
    setTimeout(() => setActiveScenarioSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Scenario Control Center & Evaluation Harness
            </h1>
            <Badge variant="purple" size="sm">HACKATHON SUITE</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            One-click interactive triggers for evaluating financial safeguards, balance reservation, duplicate fraud blocks, and AI evidence grounding.
          </p>
        </div>

        <button
          onClick={resetDemoData}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Scenarios</span>
        </button>
      </div>

      {activeScenarioSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{activeScenarioSuccess}</span>
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scenario 1: Where is my BDT 3,000? */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-400">SCENARIO 01</span>
              <Badge variant="amber" size="sm">DOUBLE-ENTRY VAULT</Badge>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              "Where is my BDT 3,000?" (Withdrawal Reservation)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traders frequently panic when their available balance is lower than their ledger balance. This scenario activates pending withdrawal <strong className="text-white font-mono">WD-1007</strong> for BDT 3,000, placing hold <strong className="text-white font-mono">RES-001</strong> on Demo Trader's account and opening inquiry ticket <strong className="text-white font-mono">TKT-101</strong>.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>Ledger Balance: <strong className="text-white">BDT 25,000</strong></div>
              <div>Reserved Hold: <strong className="text-amber-400">BDT 3,000 (WD-1007)</strong></div>
              <div>Available Balance: <strong className="text-cyan-400">BDT 22,000</strong></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => handleTrigger('Scenario 1', triggerScenario1)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Arm Scenario 1</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentUserById('user-1');
                  setPortalMode('USER');
                  setActiveTab('ai-assistant');
                }}
                className="text-xs text-purple-300 hover:underline flex items-center gap-1"
              >
                <span>Ask AI</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setActiveAdminTab('withdrawals');
                }}
                className="text-xs text-amber-300 hover:underline flex items-center gap-1"
              >
                <span>Review Desk</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Scenario 2: Duplicate Deposit Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-red-400">SCENARIO 02</span>
              <Badge variant="red" size="sm">FRAUD & IDEMPOTENCY</Badge>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Duplicate Deposit Submission & Guard
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Creates a second deposit request (<strong className="text-white font-mono">DEP-2002</strong>) referencing the exact same bKash TrxID (<strong className="text-white font-mono">BKASH-TXN-98472</strong>) that was already credited in <strong className="text-white font-mono">DEP-2001</strong>. Demonstrates red flag warning in review queue and idempotency credit block!
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>DEP-2001: <strong className="text-emerald-400">APPROVED (BDT 10,000)</strong></div>
              <div>DEP-2002: <strong className="text-red-400">REVIEW_REQUIRED (Duplicate TrxID)</strong></div>
              <div>Protection: <strong className="text-white">Idempotency Key Verification</strong></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => handleTrigger('Scenario 2', triggerScenario2)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/40 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Arm Scenario 2</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('deposits')}
              className="text-xs text-emerald-300 hover:underline flex items-center gap-1"
            >
              <span>Inspect Deposit Reviews</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Scenario 3: Stale Market Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400">SCENARIO 03</span>
              <Badge variant="amber" size="sm">FEED SAFETY</Badge>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Stale / Interrupted Market Feed
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Simulates a broker network drop or disconnected price websocket by setting market feed to <strong className="text-red-400">STALE</strong>. Trading ticket automatically halts order submissions to protect traders against severe slippage.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>Current Feed: <strong className="text-white">{state.systemStatus.feedStatus}</strong></div>
              <div>Safety Enforcement: <strong className="text-red-400">Orders Refused on Stale Feed</strong></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => handleTrigger('Scenario 3', triggerScenario3)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/40 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Set Feed STALE</span>
            </button>

            <button
              onClick={() => {
                setPortalMode('USER');
                setActiveTab('trading');
              }}
              className="text-xs text-cyan-300 hover:underline flex items-center gap-1"
            >
              <span>Verify in Trading View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Scenario 4: KYC Rejection & Resubmission */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-400">SCENARIO 04</span>
              <Badge variant="purple" size="sm">COMPLIANCE LIFECYCLE</Badge>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              KYC Resubmission Workflow
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Simulates compliance rejecting an applicant's document due to blurry or cropped images. Sets status to <strong className="text-amber-400">RESUBMISSION_REQUIRED</strong>, displaying corrective instructions in the user's Verification portal.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>Target User: <strong className="text-white">user-1 (Demo Trader)</strong></div>
              <div>Required Action: <strong className="text-amber-400">Upload Clear High-Resolution Copy</strong></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => handleTrigger('Scenario 4', triggerScenario4)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Trigger Resubmission</span>
            </button>

            <button
              onClick={() => {
                setCurrentUserById('user-1');
                setPortalMode('USER');
                setActiveTab('verification');
              }}
              className="text-xs text-purple-300 hover:underline flex items-center gap-1"
            >
              <span>View User KYC Portal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Scenario 5: Asset Circuit Breaker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400">SCENARIO 05</span>
              <Badge variant="blue" size="sm">CIRCUIT BREAKER</Badge>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Asset-Specific Market Halt (BTC/USDT)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Halts trading on Bitcoin (BTC/USDT) while leaving other 5 market instruments fully tradable. Order entry form displays an alert explaining that this asset is currently paused by market operations.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>Target Asset: <strong className="text-white">BTC/USDT</strong></div>
              <div>Asset State: <strong className="text-red-400">{state.assets.find(a => a.symbol === 'BTC/USDT')?.status}</strong></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => handleTrigger('Scenario 5', triggerScenario5)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/40 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Toggle BTC Halt</span>
            </button>

            <button
              onClick={() => {
                setPortalMode('USER');
                setActiveTab('trading');
              }}
              className="text-xs text-cyan-300 hover:underline flex items-center gap-1"
            >
              <span>Test BTC Order</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Scenario 6: Compliance Account Restriction */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-400">SCENARIO 06</span>
              <Badge variant="red" size="sm">ACCOUNT FREEZE</Badge>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Compliance Trading Freeze
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Toggles compliance lock on the demo user account. Any attempts to submit new orders or initiate fresh withdrawals are rejected immediately with a clear explanatory notice.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>Demo User Status: <strong className="text-white">{state.users.find(u => u.id === 'user-1')?.isRestricted ? 'RESTRICTED' : 'ACTIVE'}</strong></div>
              <div>Protection: <strong className="text-red-400">No New Capital Risk Permitted</strong></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => handleTrigger('Scenario 6', triggerScenario6)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Toggle Account Restriction</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('users')}
              className="text-xs text-slate-300 hover:underline flex items-center gap-1"
            >
              <span>Users Table</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
