import React from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';

export const Policies: React.FC = () => {
  const policies = [
    { 
      id: 'POL-001', 
      name: 'License Compliance', 
      description: 'Automatically flag repositories with restrictive licenses (GPL, AGPL).',
      status: 'Active',
      severity: 'High'
    },
    { 
      id: 'POL-002', 
      name: 'Stale Repository Detection', 
      description: 'Identify nodes with no activity for more than 180 days.',
      status: 'Active',
      severity: 'Medium'
    },
    { 
      id: 'POL-003', 
      name: 'Security Vulnerability Scan', 
      description: 'Integration with Snyk/Dependabot to flag known vulnerabilities.',
      status: 'Draft',
      severity: 'Critical'
    },
    { 
      id: 'POL-004', 
      name: 'Documentation Quality', 
      description: 'Require README length > 500 characters for High Health Score.',
      status: 'Active',
      severity: 'Low'
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-bg-dark overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-border-main bg-bg-panel/50">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 font-mono uppercase tracking-widest">
          <Shield className="w-4 h-4" /> Governance & Rules
        </div>
        <h2 className="text-3xl font-bold text-white font-mono tracking-tight">System Policies</h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-accent-blue/5 border border-accent-blue/20 p-4 rounded-sm flex gap-4 items-start">
          <Info className="w-5 h-5 text-accent-blue mt-0.5" />
          <div>
            <h4 className="text-base font-bold text-white mb-1">Policy Enforcement Active</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Policies are evaluated during every ingestion cycle. Violations will trigger system alerts and affect the Health Score of the repository node.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-bg-panel border border-border-main rounded-sm p-5 hover:border-slate-600 transition-colors group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-bg-dark border border-border-main flex items-center justify-center text-slate-500 group-hover:text-accent-blue transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">{policy.id}</span>
                      <h3 className="text-base font-bold text-white">{policy.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{policy.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    policy.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {policy.status}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    policy.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    policy.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {policy.severity}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border-main/50">
                <button className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider">View Logs</button>
                <button className="px-3 py-1.5 text-xs font-bold text-accent-blue hover:text-blue-400 transition-colors uppercase tracking-wider">Edit Policy</button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="bg-bg-panel border border-border-main rounded-sm p-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent-blue" /> Access Control
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-bg-dark/50 rounded border border-border-main/50">
                <span className="text-sm text-slate-300">RBAC Enforcement</span>
                <span className="text-xs font-bold text-green-400">ENABLED</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-bg-dark/50 rounded border border-border-main/50">
                <span className="text-sm text-slate-300">Audit Logging</span>
                <span className="text-xs font-bold text-green-400">ENABLED</span>
              </div>
            </div>
          </div>
          <div className="bg-bg-panel border border-border-main rounded-sm p-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent-blue" /> Compliance Overview
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-accent-green flex items-center justify-center">
                <span className="text-base font-bold text-white">94%</span>
              </div>
              <div>
                <p className="text-sm text-slate-300 font-bold">System Compliance</p>
                <p className="text-xs text-slate-500 mt-1">2 nodes currently in violation of POL-001.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
