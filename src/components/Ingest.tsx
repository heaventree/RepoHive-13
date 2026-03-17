import React, { useState } from 'react';
import { 
  Rocket, 
  Trash2, 
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
    <main className="flex-1 overflow-auto bg-gradient-to-br from-bg-dark via-bg-dark to-[#0A0F0D] p-6 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bulk Import</h1>
          <p className="text-slate-400">Ingest multiple repositories at once for rapid library building</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-max">
          {/* Bulk Import Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Paste URLs</h2>
                <p className="text-xs text-slate-400 mt-1">One GitHub repository per line</p>
              </div>
              <button 
                onClick={handleInitiate}
                disabled={isScanning || !urls.trim()}
                className="bg-accent-green hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold py-2.5 px-5 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap ml-4"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                SCAN
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <textarea 
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="flex-1 min-h-80 bg-white/5 border border-white/10 rounded-lg text-slate-200 font-mono text-sm p-4 focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 outline-none transition-all resize-none leading-relaxed placeholder-slate-600"
                placeholder="https://github.com/facebook/react&#10;https://github.com/vercel/next.js&#10;https://github.com/torvalds/linux"
                spellCheck={false}
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm font-mono text-slate-400">
                  <span className="text-slate-200 font-bold">{urls.split('\n').filter(u => u.trim()).length}</span> repositories
                </div>
                <button 
                  onClick={() => setUrls('')} 
                  title="Clear list" 
                  className="text-slate-500 hover:text-slate-300 transition-colors p-2 hover:bg-white/5 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Live Monitor Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
                  Live Monitor
                </h2>
                <p className="text-xs text-slate-400 mt-1">Real-time ingestion status</p>
              </div>
              <span className="text-xs bg-accent-green/10 text-accent-green px-3 py-1.5 rounded-full border border-accent-green/30 font-mono font-bold">
                {stream.filter(s => s.status !== 'COMPLETE').length} active
              </span>
            </div>

            <div className="p-6 flex flex-col gap-3 max-h-96 overflow-y-auto custom-scrollbar">
              {stream.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-sm">Scans will appear here</p>
                </div>
              ) : (
                stream.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-white/5 border rounded-lg p-4 transition-all ${
                      item.status === 'COMPLETE' 
                        ? 'border-white/10 opacity-60' 
                        : 'border-accent-green/50 shadow-lg shadow-accent-green/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 font-mono truncate">{item.id}</p>
                        <h4 className="font-bold text-white tracking-tight truncate">{item.id.split('/')[1]}</h4>
                      </div>
                      {item.status === 'COMPLETE' ? (
                        <Check className="w-5 h-5 text-accent-green flex-shrink-0 ml-2" />
                      ) : item.status === 'FAILED' ? (
                        <AlertCircle className="w-5 h-5 text-accent-red flex-shrink-0 ml-2" />
                      ) : (
                        <div className="flex items-center gap-1 text-accent-green text-xs font-bold flex-shrink-0 ml-2">
                          <RotateCcw className="w-3 h-3 animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-500 font-mono">
                        <span className="truncate">{item.error || 'Processing...'}</span>
                        <span className="flex-shrink-0 ml-2">{item.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${item.status === 'FAILED' ? 'bg-accent-red' : 'bg-accent-green'}`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
