import React from 'react';
import { MarketingPage } from '../../components/marketing/MarketingPage';

export function PrivacyPage() {
  return (
    <MarketingPage
      kicker="Legal"
      title={<>Privacy <span style={{ color: '#0000FF' }}>Policy</span></>}
      subtitle="How we handle your data, your repos, and your trust."
    >
      <div className="prose-blog max-w-3xl mx-auto text-gray-600">
        <h2>What we collect</h2>
        <p>We store your GitHub repo URLs and AI analysis data in your tenant's Turso database. We do not store your GitHub credentials or private repo contents.</p>
        <h2>Authentication</h2>
        <p>We use Clerk for authentication. Your identity is verified by Clerk, not by us. We only store your Clerk user ID and plan tier.</p>
        <h2>AI providers</h2>
        <p>We use DeepSeek and Gemini for analysis. Only public metadata (name, description, README) is sent to these services. No credentials are shared.</p>
        <h2>Data deletion</h2>
        <p>Delete your account from the Settings panel. All your repos, projects, and API keys are permanently removed.</p>
      </div>
    </MarketingPage>
  );
}
