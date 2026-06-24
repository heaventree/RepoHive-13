import React from 'react';
import { MarketingPage } from '../../components/marketing/MarketingPage';

export function ImprintPage() {
  return (
    <MarketingPage
      kicker="Legal"
      title={<>Imprint / <span style={{ color: '#adc6ff' }}>Contact</span></>}
      subtitle="Who runs this thing."
    >
      <div className="prose-blog max-w-3xl mx-auto text-slate-400">
        <h2>RepoHive</h2>
        <p>RepoHive is a product of HeavenTree LLC.</p>
        <p>Email: hello@repohive.cloud</p>
        <p>Website: <a href="https://repohive.cloud">repohive.cloud</a></p>
        <h2>Hosting</h2>
        <p>Frontend: Netlify</p>
        <p>Database: Turso (libSQL)</p>
        <p>AI: DeepSeek + Gemini (Google)</p>
      </div>
    </MarketingPage>
  );
}
