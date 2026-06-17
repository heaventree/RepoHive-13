import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AcceptableUsePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0B12] to-[#12121A] dark:from-[#0B0B12] dark:to-[#12121A]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="text-primary hover:underline mb-8 flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Acceptable Use Policy</h1>
          <p className="text-gray-400 mb-8">Effective Date: 12 June 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-gray-300 leading-relaxed">
              This Acceptable Use Policy (&quot;Policy&quot;) governs your use of RepoHive (&quot;the Platform&quot;) and all content you submit to it. It applies in addition to our <Link to="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>, <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and <Link to="/legal/imprint" className="text-primary hover:underline">Imprint</Link>.
            </p>
            <p className="text-gray-300 leading-relaxed">
              By using RepoHive, you agree to comply with this Policy at all times.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. What You Submit to RepoHive</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive is a <strong className="text-white">developer tool, not a publishing platform</strong>. The content you submit is limited to:
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>URLs of publicly available GitHub repositories you wish to track</li>
                <li>Project names, descriptions, and working notes (plain text)</li>
                <li>Account and configuration settings</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                User content is private to your account (or your team workspace on Studio plans). RepoHive does not provide public publishing, hosting, file uploads, or distribution of user content to other users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Prohibited Uses</h2>
              <p className="text-gray-300 leading-relaxed mb-2">You must not use RepoHive to:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6 mb-4">
                <li>Store or transmit unlawful, defamatory, harassing, or threatening material in notes or project descriptions</li>
                <li>Store credentials, secrets, or personal data of third parties without authorisation</li>
                <li>Catalogue or organise repositories for the purpose of planning or facilitating unlawful activity (including malware distribution or attacks on systems you are not authorised to test)</li>
                <li>Infringe the intellectual property or privacy rights of others</li>
                <li>Misrepresent your identity or affiliation</li>
              </ul>
              <p className="text-gray-300 leading-relaxed">
                Adding a public GitHub repository to your library is a reference, not a redistribution; you remain responsible for complying with each repository&apos;s license in your own projects.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Platform Integrity & Fair Use</h2>
              <p className="text-gray-300 leading-relaxed mb-2">You must not:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Attempt to access other users&apos; libraries, data, or API keys</li>
                <li>Probe, scan, or test the vulnerability of the Platform without written authorisation</li>
                <li>Circumvent plan limits, rate limits, or usage tracking (e.g. by cycling accounts or automated bulk re-adding)</li>
                <li>Use automated means to scrape, bulk-export, or systematically harvest the Platform&apos;s AI analyses or curated catalogue beyond your plan&apos;s intended use</li>
                <li>Share, sell, or expose your API keys in public repositories or to unauthorised parties</li>
                <li>Impose unreasonable load on the Platform&apos;s infrastructure</li>
                <li>Resell or white-label the Services without a written agreement with Heaventree Ltd.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. API Usage</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                API keys allow you to connect your own library to development tools (IDEs, coding agents). API access is provided for your individual or team use according to your plan.
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Keep keys confidential; rotate them immediately if exposure is suspected</li>
                <li>Do not build public-facing services on top of your personal API access</li>
                <li>We may apply rate limits and may revoke keys that show abusive patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Enforcement</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                Violations of this Policy may result in, at our discretion and proportionate to the violation:
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6 mb-4">
                <li>A warning and request for remedy</li>
                <li>Removal of offending content</li>
                <li>Suspension or revocation of API keys</li>
                <li>Suspension or termination of the account</li>
                <li>Reporting to competent authorities where legally required</li>
              </ul>
              <p className="text-gray-300 leading-relaxed">
                Enforcement decisions are made to protect users, the Platform, and legal compliance. Where practicable, we will notify you and give you an opportunity to respond.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Reporting & Notice Procedure</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                If you believe content or activity on RepoHive violates this Policy or the law, report it to <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a> with:
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6 mb-4">
                <li>A description of the issue and where it appears</li>
                <li>Your contact details</li>
                <li>Any supporting evidence</li>
              </ul>
              <p className="text-gray-300 leading-relaxed">
                We review valid notices expeditiously and act in accordance with applicable law, including notice-and-action obligations under the EU Digital Services Act where relevant.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Appeals</h2>
              <p className="text-gray-300 leading-relaxed">
                If your content or account has been actioned and you believe this was in error, you may appeal by writing to <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a> within 30 days of the action. Appeals are reviewed by a person not involved in the original decision where practicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Copyright Complaints</h2>
              <p className="text-gray-300 leading-relaxed mb-2">
                If you believe content on RepoHive infringes your copyright, submit a notice to <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a> with:
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6 mb-4">
                <li>Identification of the copyrighted work</li>
                <li>The location of the allegedly infringing material on the Platform</li>
                <li>Your contact information</li>
                <li>A good-faith statement that the use is unauthorised</li>
                <li>A statement, under penalty of perjury, that the information is accurate and you are authorised to act for the rights holder</li>
              </ul>
              <p className="text-gray-300 leading-relaxed">
                Note that repository metadata and READMEs shown in RepoHive are retrieved from GitHub&apos;s public API; complaints about a repository&apos;s own content may be more effectively directed to GitHub. We will nonetheless review all notices concerning material displayed on our Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Policy Updates</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Policy from time to time. Material changes will be announced via the Platform or by email. Continued use of RepoHive after the effective date constitutes acceptance.
              </p>
            </section>

            <section className="border-t border-white/10 pt-8 mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                Heaventree Ltd.<br />
                Suite 4.3.02, Block 4, Eurotowers<br />
                Gibraltar, GX111AA<br />
                Email: <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
