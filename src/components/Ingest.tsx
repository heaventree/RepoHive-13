import React, { useState } from 'react';
import { 
  Terminal, 
  Rocket, 
  Trash2, 
  Copy, 
  Check, 
  Loader2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface IngestProps {
  onComplete: () => void;
}

export const Ingest: React.FC<IngestProps> = ({ onComplete }) => {
  const [urls, setUrls] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<any[]>([]);

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

  return (
    <main className="flex flex-1 overflow-hidden relative bg-bg-dark">
      <section className="flex-1 flex flex-col border-r border-border-main h-full min-w-0">
        <div className="flex-none px-6 py-4 flex items-center justify-between bg-bg-dark border-b border-border-main">
          <h2 className="text-lg font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <span className="text-accent-blue">~/</span>Bulk Import
            <span className="text-xs text-slate-500 font-normal ml-2">— Paste GitHub URLs (one per line)</span>
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-mono text-slate-400">
                <span className="text-slate-200 font-bold">{urls.split('\n').filter(u => u.trim()).length}</span> repos
              </div>
            </div>
            <button 
              onClick={handleInitiate}
              disabled={isScanning || !urls.trim()}
              className="bg-accent-green hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold py-2 px-4 rounded-sm transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2"
            >
              {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              SCAN
            </button>
            <button onClick={() => setUrls('')} title="Clear" className="text-slate-400 hover:text-white transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex flex-col bg-[#0D1310]">
          <div className="flex flex-1 overflow-hidden relative">
            <textarea 
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="flex-1 w-full h-full bg-transparent border-0 text-slate-200 font-mono text-sm p-4 focus:ring-0 resize-none leading-relaxed placeholder-slate-700 outline-none"
              placeholder="https://github.com/facebook/react&#10;https://github.com/vercel/next.js&#10;https://github.com/torvalds/linux"
              spellCheck={false}
            />
          </div>
        </div>
      </section>

      <section className="flex-1 flex flex-col h-full bg-bg-panel min-w-[320px]">
        <div className="px-5 py-4 border-b border-border-main flex justify-between items-center bg-[#16201A]">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse"></div>
            Live Ingest Monitor
          </h3>
          <span className="text-xs bg-[#1F2923] text-slate-400 px-2 py-0.5 rounded-full border border-border-main font-mono">
            Queue: {stream.filter(s => s.status !== 'COMPLETE').length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {stream.map((item, idx) => (
            <div key={idx} className={`bg-[#0A0F0D] border rounded-lg p-4 relative overflow-hidden group shadow-lg transition-all ${
              item.status === 'COMPLETE' ? 'border-border-main opacity-70' : 'border-accent-green'
            }`}>
              {item.status !== 'COMPLETE' && <div className="absolute top-0 left-0 w-1 h-full bg-accent-green shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>}
              
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-mono text-slate-500">ID: {item.id}</span>
                  <h4 className="font-bold text-base text-white tracking-tight">{item.id}</h4>
                </div>
                {item.status === 'COMPLETE' ? (
                  <Check className="w-5 h-5 text-accent-green" />
                ) : item.status === 'FAILED' ? (
                  <AlertCircle className="w-5 h-5 text-accent-red" />
                ) : (
                  <div className="flex items-center gap-1 text-accent-green bg-[#14532D]/30 px-2 py-0.5 rounded text-xs font-bold border border-[#14532D]">
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    {item.status}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                  <span>{item.error || 'Processing...'}</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="w-full bg-[#1F2923] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${item.status === 'FAILED' ? 'bg-accent-red' : 'bg-accent-green'}`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
