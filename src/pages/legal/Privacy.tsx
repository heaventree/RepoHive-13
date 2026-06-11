

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
          <p className="text-gray-400 mb-8">Effective Date: 15 May 2025</p>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-gray-300 leading-relaxed">
              This Privacy Policy explains how Heaventree Ltd. (&quot;Heaventree&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses, stores, and protects personal data when you access or use RepoHive, available at https://repohive.cloud (the &quot;Platform&quot;).
            </p>
            <p className="text-gray-300 leading-relaxed">
              RepoHive is a creator-focused publishing and monetization platform. This policy applies to all visitors, registered users, creators, and subscribers.
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
              
              <h3 className="text-lg font-medium text-white mb-2">a) Information You Provide Directly</h3>
              <p className="text-gray-300 leading-relaxed mb-2">We may collect:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Name</li>
                <li>Email address</li>
                <li>Account credentials</li>
                <li>Billing and subscription details</li>
                <li>Content you upload or publish</li>
                <li>Communications with support</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                This data is collected when you create an account, publish content, subscribe, contact us, or otherwise interact with RepoHive.
              </p>
              <p className="text-gray-300 leading-relaxed mt-2">
                <strong className="text-white">Legal basis:</strong> Contract, Legitimate Interests, or Consent (depending on context)
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-2">b) Automatically Collected Information</h3>
              <p className="text-gray-300 leading-relaxed mb-2">When you use RepoHive, we may automatically collect:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>IP address</li>
                <li>Device and browser type</li>
                <li>Access times and pages viewed</li>
                <li>Usage and performance metrics</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                This data is used for security, fraud prevention, analytics, and service improvement.
              </p>
              <p className="text-gray-300 leading-relaxed mt-2">
                <strong className="text-white">Legal basis:</strong> Legitimate Interests
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-2">c) Cookies and Similar Technologies</h3>
              <p className="text-gray-300 leading-relaxed mb-2">
                RepoHive uses cookies and similar technologies to operate securely and improve functionality.
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Strictly necessary cookies are always active</li>
                <li>Analytics or marketing cookies are used only where legally permitted and subject to your consent</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                You can manage cookie preferences via our cookie banner or browser settings. Full details are provided in our Cookie Policy.
              </p>
              <p className="text-gray-300 leading-relaxed mt-2">
                <strong className="text-white">Legal basis:</strong> Consent (where required), Legitimate Interests (essential cookies)
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Personal Data</h2>
              <p className="text-gray-300 leading-relaxed mb-2">We use personal data to:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Provide and operate the RepoHive platform</li>
                <li>Manage user accounts and subscriptions</li>
                <li>Process payments and prevent fraud</li>
                <li>Communicate with users and provide support</li>
                <li>Improve platform functionality and performance</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4 font-medium">
                We do not sell personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Payments</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Payments are processed by third-party payment providers (such as Stripe). Heaventree Ltd. does not store full payment card details.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Payment providers act as independent data controllers or processors under their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. User-Generated Content</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Content you publish on RepoHive may contain personal data. You are responsible for ensuring you have the legal right to publish such content.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Heaventree Ltd. acts as a hosting provider, not a publisher, in relation to user-generated content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Legal Bases for Processing</h2>
              <p className="text-gray-300 leading-relaxed mb-2">We process personal data based on:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li><strong className="text-white">Contract</strong> – to provide the services you request</li>
                <li><strong className="text-white">Legitimate Interests</strong> – to operate, secure, and improve RepoHive</li>
                <li><strong className="text-white">Consent</strong> – where required (e.g. marketing, non-essential cookies)</li>
                <li><strong className="text-white">Legal Obligation</strong> – where required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Data Sharing</h2>
              <p className="text-gray-300 leading-relaxed mb-2">We may share personal data with:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Hosting and infrastructure providers</li>
                <li>Payment processors</li>
                <li>Analytics and security providers</li>
                <li>Legal or regulatory authorities where required</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                All service providers are contractually required to protect personal data and process it only on our instructions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. International Data Transfers</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive is operated globally. Personal data may be transferred outside the EEA.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">Where required, transfers are safeguarded using:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Adequacy decisions (where applicable)</li>
                <li>Additional technical and organisational safeguards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Data Retention</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We retain personal data only as long as necessary for the purposes for which it was collected, including legal, accounting, and security requirements.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">Typical retention periods include:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Account data: for the duration of the account</li>
                <li>Billing records: as required by applicable law</li>
                <li>Support communications: limited retention for service quality and dispute resolution</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Data is securely deleted or anonymised when no longer required.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Data Security</h2>
              <p className="text-gray-300 leading-relaxed mb-2">We implement appropriate technical and organisational measures, including:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Encryption (SSL/TLS)</li>
                <li>Access controls</li>
                <li>Secure hosting environments</li>
                <li>Regular security reviews</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                No system is completely secure, but we take reasonable steps to protect personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. Your Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-2">Where applicable under GDPR, you have the right to:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion</li>
                <li>Restrict or object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Requests can be submitted to: <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a>
              </p>
              <p className="text-gray-300 leading-relaxed mt-2">
                You also have the right to lodge a complaint with your local data protection authority.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. Marketing Communications</h2>
              <p className="text-gray-300 leading-relaxed">
                You will only receive marketing communications where legally permitted. You may unsubscribe at any time using the link provided or by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">13. Children&apos;s Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                RepoHive is not intended for children under 16. We do not knowingly collect personal data from children. If such data is identified, it will be deleted promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">14. EU Digital Services Act (DSA)</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                For EU users, RepoHive operates as an intermediary hosting service under Regulation (EU) 2022/2065.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Heaventree Ltd. does not engage in proactive monitoring of user content but will act upon valid notices of illegal content in accordance with applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">15. Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. The latest version will always be available on repohive.cloud.
              </p>
            </section>

            <section className="border-t border-white/10 pt-8 mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">16. Contact</h2>
              <p className="text-gray-300 leading-relaxed">
                RepoHive (operated by Heaventree Ltd.)<br />
                Suite 4.3.02, Block 4, Eurotowers,<br />
                Gibraltar, GX111AA<br />
                <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a>
              </p>
              <p className="text-gray-400 text-sm mt-6">
                © Heaventree Ltd. — 2025
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
