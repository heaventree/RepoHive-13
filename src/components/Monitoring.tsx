import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Clock, 
  ShieldCheck,
  Cpu,
  Globe
} from 'lucide-react';

export const Monitoring: React.FC = () => {
  const stats = [
    { label: 'Total Scans', value: '1,284', change: '+12%', icon: Zap, color: 'text-accent-blue' },
    { label: 'Avg Health Score', value: '78.4', change: '+2.1', icon: TrendingUp, color: 'text-accent-green' },
    { label: 'Active Nodes', value: '42', change: '0', icon: Cpu, color: 'text-purple-400' },
    { label: 'Ingest Rate', value: '4.2/hr', change: '-5%', icon: Clock, color: 'text-accent-amber' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="glass-header p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 font-mono uppercase tracking-widest">
          <Activity className="w-4 h-4" /> System Telemetry
        </div>
        <h2 className="text-3xl font-bold text-white font-mono tracking-tight">Live Monitoring</h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-md bg-slate-800 border border-border-main ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                  stat.change.startsWith('+') ? 'bg-green-500/10 text-green-400' : 
                  stat.change === '0' ? 'bg-slate-500/10 text-slate-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white font-mono">{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent-blue" /> Ingestion Velocity
              </h3>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-bg-dark border border-border-main text-xs text-slate-400 rounded-sm font-mono">24H</span>
                <span className="px-2 py-1 bg-accent-blue/10 border border-accent-blue/30 text-xs text-accent-blue rounded-sm font-mono">7D</span>
              </div>
            </div>
            <div className="h-64 w-full bg-bg-dark/50 rounded border border-border-main/50 flex items-center justify-center relative overflow-hidden">
              {/* Mock chart lines */}
              <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full bg-[linear-gradient(90deg,transparent_0%,transparent_49%,rgba(56,189,248,0.2)_50%,transparent_51%)] bg-[length:40px_100%]"></div>
              </div>
              <div className="text-slate-600 font-mono text-xs">TELEMETRY_STREAM_ACTIVE</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent-green" /> Node Health Distribution
            </h3>
            <div className="space-y-4">
              {[
                { label: 'High Confidence', count: 28, color: 'bg-accent-green' },
                { label: 'Moderate', count: 12, color: 'bg-accent-amber' },
                { label: 'Requires Review', count: 2, color: 'bg-accent-red' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-mono">{item.count}</span>
                  </div>
                  <div className="w-full bg-bg-dark h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${(item.count / 42) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-bg-dark/50 rounded border border-border-main/50">
              <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold mb-2">
                <Globe className="w-4 h-4" /> Global Status
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                All ingestion nodes are operational. Latency within nominal parameters (98ms).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
