import React from 'react';
import { X, Star, GitFork, AlertCircle, ExternalLink, Clock, Zap, Tag, Flame, Server } from 'lucide-react';
import { Repo } from '../types';
import { classifyRepo } from '../lib/classification';

interface CompareModalProps {
  repos: Repo[];
  onClose: () => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-3 px-4 align-top border-b border-border-main/20 ${className}`}>{children}</td>;
}

export const CompareModal: React.FC<CompareModalProps> = ({ repos, onClose }) => {
  const aiOf = (r: Repo) => { try { return r.ai_analysis ? JSON.parse(r.ai_analysis) : {}; } catch { return {}; } };

  const rows: Array<{ label: string; render: (r: Repo) => React.ReactNode }> = [
    {
      label: 'Repository',
      render: r => (
        <div>
          <a href={r.url} target="_blank" rel="noopener noreferrer"
            className="text-accent-blue hover:underline font-bold flex items-center gap-1">
            {r.id} <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{r.description}</p>
        </div>
      ),
    },
    {
      label: 'Score',
      render: r => (
        <span className={`text-xl font-black font-mono ${scoreColor(r.score)}`}>{r.score}</span>
      ),
    },
    {
      label: 'Stars / Forks',
      render: r => (
        <div className="flex gap-3 text-sm font-mono">
          <span className="flex items-center gap-1 text-amber-400"><Star className="w-3.5 h-3.5" />{r.stars?.toLocaleString()}</span>
          <span className="flex items-center gap-1 text-slate-400"><GitFork className="w-3.5 h-3.5" />{r.forks?.toLocaleString()}</span>
        </div>
      ),
    },
    {
      label: 'Open issues',
      render: r => (
        <span className={`flex items-center gap-1 text-sm font-mono ${(r.issues ?? 0) > 500 ? 'text-red-400' : 'text-slate-300'}`}>
          <AlertCircle className="w-3.5 h-3.5" />{r.issues?.toLocaleString()}
          {(r.issues ?? 0) > 500 && <span className="text-[10px] text-red-400 ml-1">high</span>}
        </span>
      ),
    },
    {
      label: 'Language',
      render: r => <span className="text-sm text-slate-300 font-mono">{r.language ?? '—'}</span>,
    },
    {
      label: 'License',
      render: r => (
        r.license
          ? <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">{r.license}</span>
          : <span className="text-slate-600 text-xs">—</span>
      ),
    },
    {
      label: 'Last push',
      render: r => {
        const d = r.last_push ? new Date(r.last_push) : null;
        const months = d ? Math.floor((Date.now() - d.getTime()) / (1000*60*60*24*30)) : null;
        const fresh = months !== null && months < 3;
        return (
          <span className={`flex items-center gap-1 text-[11px] font-mono ${fresh ? 'text-emerald-400' : 'text-slate-500'}`}>
            <Clock className="w-3 h-3" />{d ? d.toLocaleDateString() : '—'}
            {months !== null && <span>({months}mo ago)</span>}
          </span>
        );
      },
    },
    {
      label: 'AI Summary',
      render: r => {
        const ai = aiOf(r);
        return ai.summary
          ? <p className="text-[11px] text-slate-400 leading-relaxed">{ai.summary}</p>
          : <span className="text-slate-600 text-xs italic">No analysis</span>;
      },
    },
    {
      label: 'Tags',
      render: r => {
        const ai = aiOf(r);
        const tags: string[] = ai.tags ?? [];
        return tags.length > 0
          ? <div className="flex flex-wrap gap-1">{tags.slice(0, 5).map(t => (
              <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent-blue/10 text-accent-blue border border-accent-blue/20">{t}</span>
            ))}</div>
          : <span className="text-slate-600 text-xs italic">—</span>;
      },
    },
    {
      label: 'Classification',
      render: r => {
        const cls = classifyRepo(aiOf(r));
        if (cls.kind === 'app-killer') {
          return <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300"><Flame className="w-3 h-3" />App Killer</span>;
        }
        if (cls.kind === 'saas-ready') {
          return <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300"><Server className="w-3 h-3" />SaaS Ready</span>;
        }
        return <span className="text-slate-600 text-xs">—</span>;
      },
    },
    {
      label: 'Replaces',
      render: r => {
        const cls = classifyRepo(aiOf(r));
        return cls.comparableApp
          ? <span className="flex items-center gap-1 text-[11px] font-mono text-purple-300"><Zap className="w-3 h-3" />{cls.comparableApp}</span>
          : <span className="text-slate-600 text-xs">—</span>;
      },
    },
  ];

  const colWidth = repos.length === 2 ? 'w-1/2' : repos.length === 3 ? 'w-1/3' : 'w-1/4';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-6xl my-8" style={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-main/30">
          <div>
            <h2 className="text-lg font-bold text-white font-mono">Compare repos</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{repos.length} selected</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <colgroup>
              <col style={{ width: '120px' }} />
              {repos.map(r => <col key={r.id} className={colWidth} />)}
            </colgroup>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 align-top border-b border-border-main/20 text-[10px] font-mono uppercase tracking-widest text-slate-600 whitespace-nowrap">
                    {row.label}
                  </td>
                  {repos.map(r => (
                    <td key={r.id} className="py-3 px-4 align-top border-b border-border-main/20">{row.render(r)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
