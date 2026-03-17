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
    <main className="flex-1 overflow-auto bg-gradient-to-br from-[#0F1420] via-[#1A1F3A] to-[#0F1420] p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Bulk Repository Import</h1>
          <p className="text-slate-400 text-lg">Add multiple repositories at once. Real-time analysis with intelligent categorization.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Paste URLs Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/8 to-white/5 border border-white/15 rounded-2xl shadow-2xl hover:shadow-3xl hover:border-white/20 transition-all duration-300 overflow-hidden h-full flex flex-col">
              
              {/* Header */}
              <div className="p-8 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Paste URLs</h2>
                    <p className="text-sm text-slate-400 mt-2">One GitHub repository per line</p>
                  </div>
                  <button 
                    onClick={handleInitiate}
                    disabled={isScanning || !urls.trim()}
                    className="ml-4 flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 flex items-center gap-2 whitespace-nowrap border border-cyan-400/30 hover:border-cyan-300/50 disabled:border-slate-600/20"
                  >
                    {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                    SCAN
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col p-8 gap-6">
                <textarea 
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  className="flex-1 min-h-80 bg-gradient-to-b from-white/8 to-white/5 border border-white/12 rounded-xl text-slate-100 font-mono text-sm p-5 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all resize-none leading-relaxed placeholder-slate-500 shadow-inner"
                  placeholder="https://github.com/facebook/react&#10;https://github.com/vercel/next.js&#10;https://github.com/torvalds/linux"
                  spellCheck={false}
                />
                
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-sm font-mono text-slate-400">
                    <span className="text-cyan-400 font-bold text-base">{urls.split('\n').filter(u => u.trim()).length}</span>
                    <span className="ml-2">repositories detected</span>
                  </div>
                  <button 
                    onClick={() => setUrls('')} 
                    title="Clear list" 
                    className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Monitor Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/8 to-white/5 border border-white/15 rounded-2xl shadow-2xl hover:shadow-3xl hover:border-white/20 transition-all duration-300 overflow-hidden h-full flex flex-col">
              
              {/* Header */}
              <div className="p-8 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse shadow-lg shadow-green-500/50"></div>
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">Live Monitor</h2>
                      <p className="text-sm text-slate-400 mt-1">Real-time ingestion status</p>
                    </div>
                  </div>
                  <span className="text-xs bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-4 py-2 rounded-full border border-green-400/30 font-mono font-bold whitespace-nowrap ml-4">
                    {stream.filter(s => s.status !== 'COMPLETE').length} active
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col p-8 gap-4 overflow-y-auto custom-scrollbar">
                {stream.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <p className="text-sm">Scans will appear here</p>
                      <p className="text-xs text-slate-600 mt-2">Start scanning to see real-time progress</p>
                    </div>
                  </div>
                ) : (
                  stream.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`backdrop-blur-lg bg-gradient-to-r border rounded-xl p-5 transition-all duration-300 ${
                        item.status === 'COMPLETE' 
                          ? 'from-white/5 to-white/3 border-white/10 opacity-60' 
                          : 'from-green-500/10 to-emerald-500/5 border-green-400/40 shadow-lg shadow-green-500/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 font-mono truncate mb-1">{item.id}</p>
                          <h4 className="font-bold text-white tracking-tight truncate text-sm">{item.id.split('/')[1]}</h4>
                        </div>
                        {item.status === 'COMPLETE' ? (
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 ml-3" />
                        ) : item.status === 'FAILED' ? (
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 ml-3" />
                        ) : (
                          <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold flex-shrink-0 ml-3">
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-slate-500 font-mono">
                          <span className="truncate">{item.error || 'Processing...'}</span>
                          <span className="flex-shrink-0 ml-2">{item.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                          <div 
                            className={`h-full transition-all duration-300 rounded-full ${item.status === 'FAILED' ? 'bg-gradient-to-r from-red-400 to-red-500 shadow-lg shadow-red-500/30' : 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg shadow-green-500/30'}`}
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
      </div>
    </main>
  );
};
