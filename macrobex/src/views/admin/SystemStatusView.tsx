import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Server, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  HardDrive, 
  Clock, 
  RefreshCw, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { MetricCard } from '../../components/common/MetricCard';

export const SystemStatusView: React.FC = () => {
  const { state, setFeedLatency } = useSimulation();

  const [pingStatus, setPingStatus] = useState<string | null>(null);

  const handlePing = () => {
    setPingStatus('Testing gateway connectivity...');
    setTimeout(() => {
      setPingStatus(`Gateway reachable. Latency: ${state.systemStatus.feedLatencyMs}ms (HTTP 200 OK)`);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">System Infrastructure & Heartbeat</h1>
            <Badge variant="emerald" size="sm">ALL SYSTEMS HEALTHY</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Engine health telemetry, distributed transaction synchronization, and latency controls.
          </p>
        </div>

        <button
          onClick={handlePing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ping Engine</span>
        </button>
      </div>

      {pingStatus && (
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{pingStatus}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Server Uptime"
          value="99.98%"
          subValue="Container runtime: 18h 42m"
          icon={<Server className="w-4 h-4 text-emerald-400" />}
          badge={<Badge variant="emerald" size="sm">ONLINE</Badge>}
        />

        <MetricCard
          label="Engine Heartbeat"
          value="2.5s"
          subValue="Realtime ticker broadcast"
          icon={<Activity className="w-4 h-4 text-cyan-400" />}
          badge={<Badge variant="blue" size="sm">TICK</Badge>}
        />

        <MetricCard
          label="Network Latency"
          value={`${state.systemStatus.feedLatencyMs} ms`}
          subValue="Gateway response delay"
          icon={<Clock className="w-4 h-4 text-purple-400" />}
          badge={<Badge variant="purple" size="sm">RTT</Badge>}
        />

        <MetricCard
          label="Storage & Audit State"
          value="1,420 KB"
          subValue="LocalStorage client persistence"
          icon={<HardDrive className="w-4 h-4 text-amber-400" />}
          badge={<Badge variant="amber" size="sm">STORE</Badge>}
        />
      </div>

      {/* Latency Tuning */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Network Latency Calibration</h3>
        <p className="text-xs text-slate-400">
          Adjust network latency to test trade execution response times and UI optimistic rendering under high ping.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <input
            type="range"
            min={10}
            max={800}
            step={10}
            value={state.systemStatus.feedLatencyMs}
            onChange={(e) => setFeedLatency(Number(e.target.value))}
            className="flex-1 accent-emerald-500"
          />
          <span className="font-mono font-bold text-white text-xs w-20 text-right">
            {state.systemStatus.feedLatencyMs} ms
          </span>
        </div>
      </div>
    </div>
  );
};
