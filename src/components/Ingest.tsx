import React, { useState } from 'react';
import { 
  Rocket, 
  Trash2, 
  Check, 
  Loader2,
  AlertCircle,
  RotateCcw,
  Zap
} from 'lucide-react';

interface IngestProps {
  onComplete: () => void;
}

export const Ingest: React.FC<IngestProps> = ({ onComplete }) => {
  const [urls, setUrls] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<any[]>([]);

  const repoCount = urls.split('\n').filter(u => u.trim().startsWith('http')).length;

  const handleInitiate = async () => {
    const urlList = urls.split('\n').filter(u => u.trim().startsWith('http'));
    if (urlList.length === 0) return;

    setIsScanning(true);
    setStream([]);

    for (const url of urlList) {
      const id = url.split('/').slice(-2).join('/');
      setStream(prev => [{ id, status: 'FETCHING', progress: 10 }, ...prev]);

      try {
        setStream(prev => prev.map(item => item.id === id ? { ...item, status: 'ANALYZING', progress: 40 } : item));

        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || res.statusText);
        }

        setStream(prev => prev.map(item => item.id === id ? { ...item, status: 'SCORING', progress: 80 } : item));
        await new Promise(r => setTimeout(r, 300));
        setStream(prev => prev.map(item => item.id === id ? { ...item, status: 'COMPLETE', progress: 100 } : item));
      } catch (error: any) {
        setStream(prev => prev.map(item => item.id === id ? { ...item, status: 'FAILED', error: error.message, progress: 0 } : item));
      }
    }

    setIsScanning(false);
  };

  const getStatusLabel = (status: string) => {
    if (status === 'FETCHING') return 'Fetching metadata...';
    if (status === 'ANALYZING') return 'AI analysis...';
    if (status === 'SCORING') return 'Computing score...';
    if (status === 'COMPLETE') return 'Added to library';
    return 'Failed';
  };

  return (
    <main className="flex-1 overflow-auto custom-scrollbar relative">

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-6 flex flex-col h-full">
        {/* Page Header — compact single line */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Bulk Import</h1>
          </div>
          <span className="text-slate-500 text-sm">— Paste GitHub URLs and AI will analyse, score and categorise every repo in seconds.</span>
        </div>

        {/* Two-column layout — Live Monitor LEFT, URL Input RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">

          {/* Live Monitor Card */}
          <div className="flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60"></div>
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Live Monitor</p>
                  <p className="text-slate-500 text-xs mt-0.5">Real-time ingestion status</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-full text-xs font-bold font-mono border" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}>
                {stream.filter(s => s.status !== 'COMPLETE' && s.status !== 'FAILED').length} active
              </div>
            </div>

            {/* Stream list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {stream.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Rocket className="w-7 h-7 text-slate-600" />
                  </div>
                  <p className="text-slate-500 font-medium">No scans running</p>
                  <p className="text-slate-700 text-sm mt-1">Results will stream here in real time</p>
                </div>
              ) : stream.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border p-4 transition-all duration-300"
                  style={{
                    background: item.status === 'COMPLETE'
                      ? 'rgba(255,255,255,0.03)'
                      : item.status === 'FAILED'
                      ? 'rgba(239,68,68,0.05)'
                      : 'rgba(16,185,129,0.06)',
                    borderColor: item.status === 'COMPLETE'
                      ? 'rgba(255,255,255,0.07)'
                      : item.status === 'FAILED'
                      ? 'rgba(239,68,68,0.3)'
                      : 'rgba(16,185,129,0.3)',
                    opacity: item.status === 'COMPLETE' ? 0.65 : 1
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{item.id.split('/')[1]}</p>
                      <p className="text-slate-500 font-mono text-xs truncate mt-0.5">{item.id}</p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                      {item.status === 'COMPLETE' ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      ) : item.status === 'FAILED' ? (
                        <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500">{item.error || getStatusLabel(item.status)}</span>
                      <span className="text-slate-400">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.progress}%`,
                          background: item.status === 'FAILED'
                            ? 'linear-gradient(90deg, #ef4444, #f87171)'
                            : 'linear-gradient(90deg, #10b981, #34d399)',
                          boxShadow: item.status === 'FAILED'
                            ? '0 0 8px rgba(239,68,68,0.5)'
                            : '0 0 8px rgba(16,185,129,0.6)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* URL Input Card */}
          <div className="flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
            {/* Card header — scan + count + clear all together */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <p className="text-white font-semibold text-lg">Paste URLs</p>
                <p className="text-slate-500 text-xs mt-0.5">One GitHub repository per line</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  <span className="text-indigo-300 font-bold text-sm">{repoCount}</span> repos
                </span>
                <button
                  onClick={() => setUrls('')}
                  title="Clear list"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleInitiate}
                  disabled={isScanning || repoCount === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: isScanning || repoCount === 0
                      ? 'rgba(99,102,241,0.2)'
                      : 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
                    boxShadow: repoCount > 0 && !isScanning ? '0 0 20px rgba(79,70,229,0.4)' : 'none'
                  }}
                >
                  {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                  SCAN
                </button>
              </div>
            </div>

            {/* Textarea — flush fill, no rounding, styled scrollbar */}
            <div className="flex-1">
              <textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="custom-scrollbar w-full h-full min-h-64 text-slate-200 font-mono text-sm px-6 py-5 resize-none leading-7 placeholder-slate-600 outline-none"
                style={{ background: 'transparent' }}
                placeholder="https://github.com/facebook/react&#10;https://github.com/vercel/next.js&#10;https://github.com/torvalds/linux"
                spellCheck={false}
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};
