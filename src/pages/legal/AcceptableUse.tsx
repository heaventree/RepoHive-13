import React from 'react';
import { MarketingPage } from '../../components/marketing/MarketingPage';

export function AcceptableUsePage() {
  return (
    <MarketingPage
      kicker="Legal"
      title={<>Acceptable <span style={{ color: '#0000FF' }}>Use</span></>}
      subtitle="Keep the hive healthy."
    >
      <div className="prose-blog max-w-3xl mx-auto text-gray-600">
        <h2>No scraping</h2>
        <p>Do not use RepoHive to bulk-scrape GitHub or other users' libraries. The API rate limits are there for a reason.</p>
        <h2>No reverse engineering</h2>
        <p>Do not attempt to extract other tenants' data or bypass authentication. The multi-tenant architecture enforces isolation, but good faith matters.</p>
        <h2>No abuse</h2>
        <p>Don't create accounts to bypass plan limits. Don't share API keys. Don't use the service for anything illegal.</p>
        <h2>Reporting</h2>
        <p>Report abuse to abuse@repohive.cloud. We will investigate and may suspend accounts.</p>
      </div>
    </MarketingPage>
  );
}
