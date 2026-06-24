import React from 'react';
import { MarketingPage } from '../../components/marketing/MarketingPage';

export function TermsPage() {
  return (
    <MarketingPage
      kicker="Legal"
      title={<>Terms of <span style={{ color: '#0000FF' }}>Service</span></>}
      subtitle="The rules of the hive."
    >
      <div className="prose-blog max-w-3xl mx-auto text-gray-600">
        <h2>Acceptable use</h2>
        <p>RepoHive is for discovering open-source repositories. Do not use it for automated scraping at scale without permission. Do not store or distribute other users' data.</p>
        <h2>Plans and limits</h2>
        <p>Free plans are capped at 100 repos. Solo at 500. Studio at 5000. Monthly addition limits apply to all paid tiers. We reserve the right to adjust limits with notice.</p>
        <h2>API keys</h2>
        <p>API keys are for your own integrations. Do not share them. We may revoke keys used in ways that violate these terms.</p>
        <h2>Changes</h2>
        <p>We may update these terms. We'll notify you via email if the change is material.</p>
      </div>
    </MarketingPage>
  );
}
