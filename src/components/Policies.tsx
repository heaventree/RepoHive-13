import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  Info,
  Plus,
  X,
  Settings,
  Activity,
  ChevronRight,
  Search,
  MoreVertical,
  Trash2,
  Edit3
} from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Inactive';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

export const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([
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
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [selectedPolicyForLogs, setSelectedPolicyForLogs] = useState<Policy | null>(null);
  const [rbacEnabled, setRbacEnabled] = useState(true);
  const [auditEnabled, setAuditEnabled] = useState(true);

  const handleSavePolicy = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPolicy: Policy = {
      id: editingPolicy?.id || `POL-00${policies.length + 1}`,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as any,
      severity: formData.get('severity') as any,
    };

    if (editingPolicy) {
      setPolicies(policies.map(p => p.id === editingPolicy.id ? newPolicy : p));
    } else {
      setPolicies([...policies, newPolicy]);
    }
    setIsModalOpen(false);
    setEditingPolicy(null);
  };

  const openEditModal = (policy: Policy) => {
    setEditingPolicy(policy);
    setIsModalOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-accent-red bg-accent-red/10 border-accent-red/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
      case 'High': return 'text-orange-400 bg-orange-400/10 border-orange-400/20 shadow-[0_0_10px_rgba(251,146,60,0.1)]';
      case 'Medium': return 'text-accent-amber bg-accent-amber/10 border-accent-amber/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
      default: return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-[#00FF00] bg-[#00FF00]/10 border-[#00FF00]/30 shadow-[0_0_10px_rgba(0,255,0,0.1)]';
      case 'Draft': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default: return 'text-accent-red bg-accent-red/10 border-accent-red/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
      <div className="glass-header p-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1 font-mono uppercase tracking-widest">
            <Shield className="w-4 h-4" /> Governance & Rules
          </div>
          <h2 className="text-3xl font-bold text-white font-mono tracking-tight">System Policies</h2>
        </div>
        <button 
          onClick={() => { setEditingPolicy(null); setIsModalOpen(true); }}
          className="px-4 py-2 bg-accent-blue hover:bg-blue-600 text-white font-bold rounded-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Create Policy
        </button>
      </div>

      <div className="p-6 space-y-8">
        <div className="bg-accent-blue/5 border border-accent-blue/20 p-4 rounded-sm flex gap-4 items-start backdrop-blur-sm">
          <Info className="w-5 h-5 text-accent-blue mt-0.5" />
          <div>
            <h4 className="text-base font-bold text-white mb-1">Policy Enforcement Active</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Policies are evaluated during every ingestion cycle. Violations will trigger system alerts and affect the Health Score of the repository node.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div key={policy.id} className="glass-card rounded-2xl p-5 hover:border-white/20 transition-all group flex flex-col h-full shadow-xl">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-slate-500 bg-bg-dark px-1.5 py-0.5 rounded border border-border-main">{policy.id}</span>
                  <h3 className="text-lg font-bold text-white group-hover:text-accent-blue transition-colors">{policy.name}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-mono line-clamp-2">
                  {policy.description}
                </p>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-main/50">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setSelectedPolicyForLogs(policy); setIsLogsModalOpen(true); }}
                    className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 font-mono"
                  >
                    <Activity className="w-3 h-3" /> Logs
                  </button>
                  <button 
                    onClick={() => openEditModal(policy)}
                    className="text-[10px] font-bold text-accent-blue hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-1 font-mono"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-tighter font-mono ${getStatusColor(policy.status)}`}>
                    {policy.status}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-tighter font-mono ${getSeverityColor(policy.severity)}`}>
                    {policy.severity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Lock className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3 font-mono">
              <Lock className="w-6 h-6 text-accent-blue" /> Access Control
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-bg-dark/50 rounded-lg border border-border-main/50 group hover:border-accent-blue/30 transition-colors">
                <div>
                  <span className="text-base font-bold text-slate-200 block">RBAC Enforcement</span>
                  <span className="text-xs text-slate-500 font-mono">Role-based access control for all system resources.</span>
                </div>
                <button 
                  onClick={() => setRbacEnabled(!rbacEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${rbacEnabled ? 'bg-accent-green' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rbacEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex justify-between items-center p-4 bg-bg-dark/50 rounded-lg border border-border-main/50 group hover:border-accent-blue/30 transition-colors">
                <div>
                  <span className="text-base font-bold text-slate-200 block">Audit Logging</span>
                  <span className="text-xs text-slate-500 font-mono">Track all administrative actions and policy changes.</span>
                </div>
                <button 
                  onClick={() => setAuditEnabled(!auditEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${auditEnabled ? 'bg-accent-green' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${auditEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <CheckCircle2 className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3 font-mono">
              <Eye className="w-6 h-6 text-accent-blue" /> Compliance Overview
            </h3>
            <div className="flex items-center gap-8">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={(1 - 0.94) * 2 * Math.PI * 40}
                    strokeLinecap="round"
                    className="text-accent-green drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  />
                </svg>
                <span className="absolute text-xl font-bold text-white font-mono">94%</span>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-white font-mono">System Compliance</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  <span className="text-accent-red font-bold">2 nodes</span> currently in violation of <span className="text-accent-blue underline cursor-pointer">POL-001</span>.
                </p>
                <div className="flex gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white font-mono">38</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-accent-red font-mono">2</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Violations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLogsModalOpen && selectedPolicyForLogs && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-bg-panel border border-border-main rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-bg-dark">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-blue" /> Policy Execution Logs: {selectedPolicyForLogs.name}
              </h3>
              <button onClick={() => setIsLogsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-bg-dark font-mono text-xs space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-4 p-2 border-b border-border-main/30 last:border-0">
                  <span className="text-slate-500 whitespace-nowrap">2026-03-01 14:32:{10 + i}</span>
                  <span className="text-accent-green">[SUCCESS]</span>
                  <span className="text-slate-300">Policy {selectedPolicyForLogs.id} evaluated against node-{(Math.random() * 1000).toFixed(0)}. No violations found.</span>
                </div>
              ))}
              <div className="flex gap-4 p-2">
                <span className="text-slate-500 whitespace-nowrap">2026-03-01 14:32:05</span>
                <span className="text-accent-amber">[WARNING]</span>
                <span className="text-slate-300">Threshold check initiated for {selectedPolicyForLogs.name}. Scanning 42 nodes...</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-bg-dark border-t border-border-main flex justify-end">
              <button 
                onClick={() => setIsLogsModalOpen(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-md transition-all font-mono"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-panel border border-border-main rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-bg-dark">
              <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                {editingPolicy ? <Edit3 className="w-5 h-5 text-accent-blue" /> : <Plus className="w-5 h-5 text-accent-blue" />}
                {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePolicy} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 font-mono tracking-widest">Policy Name</label>
                <input 
                  name="name"
                  defaultValue={editingPolicy?.name}
                  required
                  className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-white focus:outline-none focus:border-accent-blue font-mono"
                  placeholder="e.g. License Compliance"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 font-mono tracking-widest">Description</label>
                <textarea 
                  name="description"
                  defaultValue={editingPolicy?.description}
                  required
                  rows={3}
                  className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-white focus:outline-none focus:border-accent-blue font-mono resize-none"
                  placeholder="Describe the policy rules..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 font-mono tracking-widest">Status</label>
                  <select 
                    name="status"
                    defaultValue={editingPolicy?.status || 'Draft'}
                    className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-white focus:outline-none focus:border-accent-blue font-mono"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 font-mono tracking-widest">Severity</label>
                  <select 
                    name="severity"
                    defaultValue={editingPolicy?.severity || 'Medium'}
                    className="w-full bg-bg-dark border border-border-main rounded px-3 py-2 text-white focus:outline-none focus:border-accent-blue font-mono"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold font-mono transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-accent-blue hover:bg-blue-600 text-white font-bold rounded-sm font-mono transition-all shadow-lg shadow-blue-500/10"
                >
                  {editingPolicy ? 'Update Policy' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
