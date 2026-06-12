import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0B12] to-[#12121A] dark:from-[#0B0B12] dark:to-[#12121A]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="text-primary hover:underline mb-8 flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400 mb-2">RepoHive (operated by Heaventree Ltd.)</p>
          <p className="text-gray-400 mb-8">Effective Date: 12 June 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-gray-300 leading-relaxed">
              This Privacy Policy explains how Heaventree Ltd. (&quot;Heaventree&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses, stores, and protects personal data when you access or use RepoHive, available at https://repohive.cloud (the &quot;Platform&quot;).
            </p>
            <p className="text-gray-300 leading-relaxed">
              RepoHive is a subscription software tool that helps developers and teams organise, analyse, and search collections of open-source GitHub repositories. This policy applies to all visitors, registered users, and subscribers.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Data Controller</h2>
              <ul className="text-gray-300 space-y-2 list-none pl-0">
                <li><strong className="text-white">Legal Entity:</strong> Heaventree Ltd.</li>
                <li><strong className="text-white">Jurisdiction:</strong> Gibraltar</li>
                <li><strong className="text-white">Registered Address:</strong> Suite 4.3.02, Block 4, Eurotowers, Gibraltar, GX111AA</li>
                <li><strong className="text-white">Contact Email (Privacy & Data Requests):</strong> <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a></li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Heaventree Ltd. is the data controller for the purposes of applicable data protection laws, including the EU General Data Protection Regulation (&quot;GDPR&quot;).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Personal Data We Collect</h2>
              <p className="text-gray-300 leading-relaxed mb-2"><strong className="text-white">Account data</strong> — collected when you register or sign in (via our authentication provider):</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6 mb-4">
                <li>Name and email address</li>
                <li>Authentication identifiers and, where you choose social sign-in, your linked provider identity</li>
                <li>Organisation/team membership for team accounts</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mb-2"><strong className="text-white">Content you submit</strong> — the working data of your library:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6 mb-4">
                <li>GitHub repository URLs you add to your library</li>
                <li>Project names, descriptions, and notes you write</li>
                <li>Configuration and preferences</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mb-2"><strong className="text-white">Billing data</strong> — processed by our payment provider (Stripe):</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6 mb-4">
                <li>Subscription plan, billing history, and payment status</li>
                <li>We never receive or store your full card details</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mb-2"><strong className="text-white">Usage and technical data</strong> — collected automatically:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>IP address, browser type, device information</li>
                <li>Log data, error reports, and feature usage (e.g. repositories added per month, for plan-limit enforcement)</li>
                <li>API key usage timestamps</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Personal Data</h2>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Provide and operate the RepoHive platform</li>
                <li>Authenticate you and secure your account</li>
                <li>Process subscriptions and payments</li>
                <li>Generate AI analyses and search indexes from the repositories you add</li>
                <li>Enforce plan limits and prevent abuse</li>
                <li>Respond to support requests</li>
                <li>Improve performance, reliability, and features</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. AI Processing</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                When you add a repository, its publicly available metadata and README content are sent to third-party AI providers to generate analyses (categorisation, summaries, scoring) and search embeddings. This processing concerns public repository data, not your personal data; your notes and project descriptions may also be processed to provide semantic search over your own library.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We do not use your personal data to train AI models.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Legal Bases for Processing</h2>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li><strong className="text-white">Contract</strong> – to provide the Services you signed up for</li>
                <li><strong className="text-white">Legitimate Interests</strong> – to operate, secure, and improve RepoHive</li>
                <li><strong className="text-white">Legal Obligation</strong> – tax, accounting, and compliance requirements</li>
                <li><strong className="text-white">Consent</strong> – for optional communications, where required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Data Sharing</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                We do not sell personal data. We share data only with service providers necessary to operate the Platform, under appropriate data processing agreements:
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Authentication provider (account sign-in and session management)</li>
                <li>Payment processor (Stripe — subscriptions and billing)</li>
                <li>Hosting, content delivery, and database infrastructure providers</li>
                <li>AI model providers (repository analysis and search embeddings, as described in Section 4)</li>
                <li>Authorities, where legally required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. International Data Transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                Our service providers may process data outside your country of residence, including outside the EU/EEA. Where this occurs, transfers are protected by appropriate safeguards such as the EU Standard Contractual Clauses or equivalent mechanisms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Data Retention</h2>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Account and library data: retained while your account is active</li>
                <li>After account deletion: removed or anonymised within a reasonable period, except where retention is legally required</li>
                <li>Billing records: retained as required by tax and accounting law</li>
                <li>Server logs: retained for a limited period for security and diagnostics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We use industry-standard measures to protect data, including encryption in transit (TLS), hashed storage of API keys, tenant-level isolation of user data, and access controls. No system is completely secure; we encourage you to use a strong, unique password and to protect your API keys.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-2">Subject to applicable law (including the GDPR where it applies), you have the right to:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6 mb-4">
                <li>Access the personal data we hold about you</li>
                <li>Rectify inaccurate data</li>
                <li>Erase your data (&quot;right to be forgotten&quot;)</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time, where processing is based on consent</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="text-gray-300 leading-relaxed">
                Requests can be submitted to: <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                RepoHive uses cookies and similar technologies that are strictly necessary to operate the Platform securely — primarily session and authentication cookies. We do not use third-party advertising or cross-site tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. Marketing Communications</h2>
              <p className="text-gray-300 leading-relaxed">
                We may send service-related emails (billing, security, important changes) as part of operating the Platform. Optional product updates are sent only with your consent, and every such email includes an unsubscribe link.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">13. Children&apos;s Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                RepoHive is not directed at children and may not be used by anyone under 18 years of age (or the age of majority in their jurisdiction). We do not knowingly collect data from children; if you believe a child has provided us data, contact us and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">14. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. Material changes will be announced via the Platform or by email before they take effect. The effective date above always reflects the current version.
              </p>
            </section>

            <section className="border-t border-white/10 pt-8 mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">15. Contact</h2>
              <p className="text-gray-300 leading-relaxed">
                Heaventree Ltd.<br />
                Suite 4.3.02, Block 4, Eurotowers<br />
                Gibraltar, GX111AA<br />
                <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
