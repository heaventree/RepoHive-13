import React, { useEffect, useState } from 'react';
import { Flame, Check, Star, GitFork, Activity, Scale } from 'lucide-react';

const ACCENT = '#FF5C00';
const HAIRLINE = '#E5E5E5';

type Verdict = 'killer' | 'saas';

interface Sample {
  name: string;
  synopsis: string;
  stars: string;
  forks: string;
  license: string;
  activity: string;
  score: number;
  verdict: Verdict;
  replaces?: string;
}

const SAMPLE: Sample[] = [
  { name: 'invoiceninja/invoiceninja', synopsis: 'Self-hosted invoicing, quotes & client billing.', stars: '9.2k', forks: '4.1k', license: 'Elastic-2.0', activity: 'Active', score: 92, verdict: 'killer', replaces: 'QuickBooks' },
  { name: 'calcom/cal.com', synopsis: 'Scheduling infrastructure for everyone.', stars: '32k', forks: '8.1k', license: 'AGPL-3.0', activity: 'Active', score: 97, verdict: 'killer', replaces: 'Calendly' },
  { name: 'novuhq/novu', synopsis: 'Notification infrastructure with a single unified API.', stars: '34k', forks: '3.6k', license: 'MIT', activity: 'Active', score: 90, verdict: 'saas' },
  { name: 'twentyhq/twenty', synopsis: 'A modern, open-source CRM built for teams.', stars: '21k', forks: '2.2k', license: 'AGPL-3.0', activity: 'Active', score: 88, verdict: 'killer', replaces: 'Salesforce' },
  { name: 'medusajs/medusa', synopsis: 'Composable commerce engine for digital builders.', stars: '25k', forks: '2.5k', license: 'MIT', activity: 'Active', score: 91, verdict: 'saas' },
];

const STAGES = ['Ingest', 'Analyze', 'Score', 'Classify'];

function VerdictBadge({ s, small = false }: { s: Sample; small?: boolean }) {
  const pad = small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]';
  if (s.verdict === 'killer') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded ${pad}`}
        style={{ color: ACCENT, backgroundColor: 'rgba(255,92,0,0.1)', border: `1px solid ${ACCENT}` }}
      >
        <Flame className="w-3 h-3" /> App Killer
        {s.replaces && <span className="font-medium normal-case tracking-normal text-gray-500">· replaces {s.replaces}</span>}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded border border-black text-black bg-gray-100 ${pad}`}>
      White-label SaaS Ready
    </span>
  );
}

export function IngestPipeline() {
  const [view, setView] = useState({ i: 0, stage: 0 });
  const [done, setDone] = useState<{ s: Sample; key: number }[]>([]);

  useEffect(() => {
    let mounted = true;
    let i = 0;
    let stage = 0;
    let key = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (!mounted) return;
      if (stage < STAGES.length) {
        stage += 1;
        setView({ i, stage });
      } else {
        const finished = SAMPLE[i];
        key += 1;
        setDone(d => [{ s: finished, key }, ...d].slice(0, 3));
        i = (i + 1) % SAMPLE.length;
        stage = 0;
        setView({ i, stage });
      }
      timer = setTimeout(step, 1150);
    };
    timer = setTimeout(step, 1150);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const cur = SAMPLE[view.i];
  const st = view.stage; // count of completed stages, 0..4

  return (
    <div className="w-full max-w-5xl border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-md overflow-hidden bg-white">
      {/* terminal chrome */}
      <div className="flex items-center px-4 py-3 bg-gray-50 border-b" style={{ borderColor: HAIRLINE }}>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full border border-black" />
          <div className="w-3 h-3 rounded-full border border-black" />
          <div className="w-3 h-3 rounded-full border border-black" />
        </div>
        <div className="mx-auto text-xs font-mono text-gray-400">repohive / ingest</div>
      </div>

      {/* paste line */}
      <div className="px-4 md:px-6 py-3 border-b flex items-center gap-2 text-xs font-mono text-gray-500" style={{ borderColor: HAIRLINE }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
        <span className="text-black font-bold">1,200</span> GitHub URLs pasted — processing the queue&hellip;
      </div>

      {/* stage tracker */}
      <div className="px-4 md:px-6 pt-5">
        <div className="flex items-center">
          {STAGES.map((label, j) => {
            const isDone = j < st;
            const isActive = j === st && st < STAGES.length;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1.5 flex-none">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center border transition-colors duration-300"
                    style={{
                      borderColor: isDone || isActive ? ACCENT : HAIRLINE,
                      backgroundColor: isDone ? ACCENT : isActive ? 'rgba(255,92,0,0.1)' : '#fff',
                      color: isDone ? '#fff' : isActive ? ACCENT : '#9ca3af',
                    }}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-mono font-bold">{j + 1}</span>}
                  </div>
                  <span
                    className="text-[10px] font-mono uppercase tracking-wider transition-colors duration-300"
                    style={{ color: isDone || isActive ? '#000' : '#9ca3af' }}
                  >
                    {label}
                  </span>
                </div>
                {j < STAGES.length - 1 && (
                  <div className="flex-1 h-px mx-2 mb-5 transition-colors duration-300" style={{ backgroundColor: j < st ? ACCENT : HAIRLINE }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {/* progress bar */}
        <div className="h-1 mt-4 rounded-full overflow-hidden bg-gray-100">
          <div className="h-full transition-all duration-700 ease-out" style={{ width: `${(st / STAGES.length) * 100}%`, backgroundColor: ACCENT }} />
        </div>
      </div>

      {/* body: current card + recent library */}
      <div className="grid md:grid-cols-5 gap-0">
        {/* current repo */}
        <div className="md:col-span-3 p-4 md:p-6">
          <div className="rounded-md border p-4 md:p-5 bg-white min-h-[208px]" style={{ borderColor: HAIRLINE }}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-sm font-bold text-black truncate">{cur.name}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex-none">
                {st < STAGES.length ? STAGES[st] + '…' : 'done'}
              </span>
            </div>

            {/* meta — reveal at Ingest */}
            <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 transition-opacity duration-500 ${st >= 1 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {cur.stars}</span>
              <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {cur.forks}</span>
              <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> {cur.license}</span>
            </div>

            {/* synopsis — reveal at Analyze */}
            <p className={`text-sm text-gray-700 mt-3 transition-opacity duration-500 ${st >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              {cur.synopsis}
            </p>

            {/* score — reveal at Score */}
            <div className={`flex items-center gap-3 mt-4 transition-opacity duration-500 ${st >= 3 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <Activity className="w-3.5 h-3.5" style={{ color: ACCENT }} /> {cur.activity}
              </span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
                <div className="h-full transition-all duration-700" style={{ width: st >= 3 ? `${cur.score}%` : '0%', backgroundColor: ACCENT }} />
              </div>
              <span className="font-mono text-sm font-bold" style={{ color: ACCENT }}>{cur.score}</span>
            </div>

            {/* verdict — reveal at Classify */}
            <div className={`mt-4 transition-all duration-500 ${st >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
              <VerdictBadge s={cur} />
            </div>
          </div>
        </div>

        {/* recent library */}
        <div className="md:col-span-2 p-4 md:p-6 md:border-l border-t md:border-t-0" style={{ borderColor: HAIRLINE }}>
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">Added to your library</div>
          <div className="space-y-2">
            {done.length === 0 && (
              <div className="text-xs text-gray-400 italic py-6 text-center">Classified repos land here…</div>
            )}
            {done.map(({ s, key }, idx) => (
              <div
                key={key}
                className={`rounded border p-2.5 bg-[#FAFAFA] ${idx === 0 ? 'animate-fade-up' : ''}`}
                style={{ borderColor: HAIRLINE }}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-black truncate">{s.name}</span>
                  <span className="font-mono text-[11px] font-bold flex-none" style={{ color: ACCENT }}>{s.score}</span>
                </div>
                <VerdictBadge s={s} small />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
