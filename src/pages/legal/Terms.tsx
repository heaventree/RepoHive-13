import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0B12] to-[#12121A] dark:from-[#0B0B12] dark:to-[#12121A]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="text-primary hover:underline mb-8 flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400 mb-8">Effective Date: 12 June 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-gray-300 leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of RepoHive, including all related websites, applications, APIs, tools, and services operated under the repohive.cloud domain (collectively, the &quot;Services&quot;).
            </p>
            <p className="text-gray-300 leading-relaxed">
              RepoHive is a product and platform owned and operated by Heaventree Ltd. By accessing or using RepoHive, you agree to be bound by these Terms. If you do not agree, you must not use the Services.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Company & Platform Information</h2>
              <ul className="text-gray-300 space-y-2 list-none pl-0">
                <li><strong className="text-white">Platform Name:</strong> RepoHive</li>
                <li><strong className="text-white">Legal Owner & Operator:</strong> Heaventree Ltd.</li>
                <li><strong className="text-white">Jurisdiction of Registration:</strong> Gibraltar</li>
                <li><strong className="text-white">Registered Address:</strong> Suite 4.3.02, Block 4, Eurotowers, Gibraltar, GX111AA</li>
                <li><strong className="text-white">Contact Email:</strong> info@repohive.cloud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Description of the Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive is a software-as-a-service tool for software developers, designers, and development teams. The Services allow you to:
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Build a personal or team library of references to publicly available GitHub repositories</li>
                <li>Receive automated, AI-generated analysis of those repositories (categorisation, summaries, quality scoring, and comparable-product indications)</li>
                <li>Search your library using natural-language (semantic) search</li>
                <li>Organise repositories into project workspaces with your own notes</li>
                <li>Access a curated catalogue of open-source software maintained by RepoHive (availability depends on your subscription plan)</li>
                <li>Connect your library to third-party developer tools via API keys</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                RepoHive indexes metadata about repositories (such as name, description, statistics, license, and README content) retrieved from the GitHub public API. RepoHive does not host, distribute, or sublicense the source code of indexed repositories. Your use of any indexed repository remains subject to that repository&apos;s own license and GitHub&apos;s terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Eligibility and User Accounts</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You must be at least 18 years old or the legal age of majority in your jurisdiction to use RepoHive.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                You must provide accurate registration information and keep your account credentials secure. You are responsible for all activity occurring under your account and your API keys. Notify us immediately of any unauthorised use.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Team (Studio) accounts may invite additional members; the account owner is responsible for the conduct of all members within the team workspace.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Acceptable Use</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree to use RepoHive only for lawful, legitimate purposes. <strong className="text-white">Your use of the Services is governed by our <Link to="/legal/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</Link>, which is incorporated into these Terms by reference.</strong>
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">In particular, you must not:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Attempt to gain unauthorised access to the Services, other users&apos; data, or underlying infrastructure</li>
                <li>Circumvent plan limits, rate limits, or technical restrictions</li>
                <li>Resell, sublicense, or systematically extract the Services or their AI-generated analyses without our written consent</li>
                <li>Use the Services to build a directly competing product by bulk-harvesting our analyses or curated catalogue</li>
                <li>Interfere with or disrupt the integrity or performance of the Services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Subscriptions, Billing, and Trials</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive offers a free plan and paid subscription plans billed monthly or annually in advance. Current pricing and plan features are displayed on our <Link to="/pricing" className="text-primary hover:underline">pricing page</Link>.
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Payments are processed by our payment provider (Stripe). We do not store full card details.</li>
                <li>Subscriptions renew automatically at the end of each billing period unless cancelled.</li>
                <li>Upgrades take effect immediately; downgrades take effect at the end of the current billing period.</li>
                <li>Plan limits (such as the number of repositories or API keys) are enforced automatically. Exceeding a limit does not incur extra charges; it prevents further additions until you upgrade or remove items.</li>
                <li>We may change prices with at least 30 days&apos; notice; changes apply from your next renewal.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Cancellations and Refunds</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You may cancel your subscription at any time. Cancellation stops future renewals; your paid plan remains active until the end of the period already paid for.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Except where required by applicable consumer law, payments already made are non-refundable. Where mandatory withdrawal or cooling-off rights apply (see Section 12), they are honoured in full.
              </p>
              <p className="text-gray-300 leading-relaxed">
                On downgrade or cancellation, data exceeding the limits of your new plan may be retained in read-only form for a reasonable period so you can export or remove it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Your Content</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                &quot;Your Content&quot; means the material you submit to RepoHive: the repository references you add, project names and descriptions, notes, and configuration. You retain ownership of Your Content.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                You grant Heaventree Ltd. a non-exclusive, worldwide licence to host, process, and display Your Content solely as necessary to operate and improve the Services (including generating AI analyses and search indexes from it).
              </p>
              <p className="text-gray-300 leading-relaxed">
                You are responsible for ensuring that Your Content does not infringe third-party rights and complies with the <Link to="/legal/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. AI-Generated Content Disclaimer</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Repository analyses, summaries, scores, category labels, and comparable-product indications shown in RepoHive are generated automatically by artificial-intelligence systems. They are provided for informational purposes only and may contain errors, omissions, or outdated information.
              </p>
              <p className="text-gray-300 leading-relaxed">
                AI-generated output does not constitute professional, legal, security, or procurement advice. You are responsible for independently evaluating any repository before using it, including its license, security posture, and maintenance status.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                All platform software, design, branding, curated catalogue selections, and proprietary systems of RepoHive are the property of Heaventree Ltd. or its licensors and are protected by applicable intellectual property laws.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Indexed repository metadata and README excerpts remain the property of their respective owners and are displayed under the terms of the GitHub API and the repositories&apos; own licenses.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable licence to use the Services for your internal business or personal purposes during your subscription.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Data Protection & Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our collection and use of personal data is described in the <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>. By using the Services you acknowledge that processing will occur as described there.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                The Services depend on third-party providers, including authentication, payment processing, hosting and content delivery, database infrastructure, the GitHub API, and AI model providers. Their availability is outside our direct control.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Links to third-party websites (including GitHub repositories) are provided for convenience. We are not responsible for third-party content, code, or services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. Consumer Withdrawal Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you are a consumer in a jurisdiction providing mandatory withdrawal (cooling-off) rights for digital services, you may withdraw from a paid subscription within the statutory period (typically 14 days of purchase) without giving reasons.
              </p>
              <p className="text-gray-300 leading-relaxed">
                By requesting immediate access to paid features, you acknowledge that if you fully use the service during the withdrawal period, your right of withdrawal may lapse to the extent permitted by law. To exercise withdrawal rights, contact info@repohive.cloud.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">13. Service Availability and Changes</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We aim for high availability but do not guarantee uninterrupted operation. We may modify, suspend, or discontinue features, giving reasonable notice where a change materially reduces the value of a paid plan.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We may suspend or terminate accounts that violate these Terms or the Acceptable Use Policy, with notice where practicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">14. Liability and Indemnity</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To the maximum extent permitted by law, Heaventree Ltd. shall not be liable for indirect, incidental, special, or consequential damages, loss of profits, loss of data, or business interruption arising from your use of the Services.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Our aggregate liability for claims arising out of the Services is limited to the amounts you paid to us in the 12 months preceding the claim, except where liability cannot be limited under applicable law (including liability for intent, gross negligence, or personal injury).
              </p>
              <p className="text-gray-300 leading-relaxed">
                You agree to indemnify Heaventree Ltd. against claims arising from your breach of these Terms or your unlawful use of the Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">15. Changes to These Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update these Terms from time to time. Material changes will be notified via the Services or by email at least 14 days before they take effect. Continued use after the effective date constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">16. Governing Law & Jurisdiction</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms are governed by the laws of Gibraltar. The courts of Gibraltar have exclusive jurisdiction unless mandatory consumer protections of your country of residence apply.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">17. Severability & Assignment</h2>
              <p className="text-gray-300 leading-relaxed">
                If any provision of these Terms is held invalid, the remaining provisions remain in full force. You may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition, or sale of assets.
              </p>
            </section>

            <section className="border-t border-white/10 pt-8 mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
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
