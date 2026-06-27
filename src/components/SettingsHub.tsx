import React, { useState } from 'react';
import { Activity, ShieldCheck, Globe, Settings as SettingsIcon } from 'lucide-react';
import { Monitoring } from './Monitoring';
import { Policies } from './Policies';
import { ApiConfig } from './ApiConfig';
import { ConfigPortal } from './ConfigPortal';

type SettingsSection = 'monitoring' | 'policies' | 'api' | 'config';

const sections: { id: SettingsSection; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'monitoring', icon: Activity,    label: 'Monitoring' },
  { id: 'policies',   icon: ShieldCheck, label: 'Policies' },
  { id: 'api',        icon: Globe,       label: 'API' },
  { id: 'config',     icon: SettingsIcon, label: 'System Config' },
];

interface SettingsHubProps {
  /** Which sub-section to open first. Defaults to Monitoring. */
  initialSection?: SettingsSection;
  /** Where the System Config "back" action should return to. */
  onExit?: () => void;
}

// Groups the four operational areas (Monitoring, Policies, API, System Config)
// behind a single "Settings" nav entry, using the same secondary-menu pattern
// as the admin dashboard so the top nav stays uncluttered.
export const SettingsHub: React.FC<SettingsHubProps> = ({ initialSection = 'monitoring', onExit }) => {
  const [section, setSection] = useState<SettingsSection>(initialSection);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionTabs active={section} onChange={setSection} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {section === 'monitoring' && <Monitoring />}
        {section === 'policies' && <Policies />}
        {section === 'api' && <ApiConfig />}
        {section === 'config' && <ConfigPortal onBack={onExit ?? (() => setSection('monitoring'))} />}
      </div>
    </div>
  );
};

function SectionTabs({ active, onChange }: {
  active: SettingsSection;
  onChange: (s: SettingsSection) => void;
}) {
  return (
    <div className="flex-none flex items-center gap-1 px-6 pt-4">
      {sections.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
            active === id
              ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/40'
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
