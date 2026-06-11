

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
          <p className="text-gray-400 mb-8">Effective Date: 17 January 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-gray-300 leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of RepoHive, including all related websites, applications, tools, and services operated under the repohive.cloud domain (collectively, the &quot;Services&quot;).
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
              <h2 className="text-xl font-semibold text-white mb-4">2. Scope of These Terms</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                These Terms apply to all users of RepoHive, including creators, subscribers, publishers, and visitors.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">The Services may include, without limitation:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Text-based content publishing and hosting</li>
                <li>Monetization, subscriptions, and creator earnings systems</li>
                <li>Analytics, access controls, and automation tools</li>
                <li>APIs, integrations, and future RepoHive features</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Additional policies (such as the Privacy Policy or Payment Terms) form part of this agreement and apply where relevant.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Eligibility and User Accounts</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You must be at least 18 years old or the legal age of majority in your jurisdiction to use RepoHive.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">You are responsible for:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>All activity conducted through your account</li>
                <li>Keeping your login credentials secure</li>
                <li>Ensuring all information you provide is accurate and lawful</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Heaventree Ltd. reserves the right to suspend, restrict, or terminate accounts that breach these Terms, applicable laws, or platform policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Acceptable Use</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree to use RepoHive only for lawful, legitimate purposes. <strong className="text-white">All user-generated content is governed by our <Link to="/legal/acceptable-use" className="text-primary hover:underline">User Content & Acceptable Use Policy</Link>, which is incorporated into these Terms by reference.</strong>
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">You must not:</p>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Content Violations</h3>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Upload or distribute content prohibited by our User Content & Acceptable Use Policy, including but not limited to:</li>
                <li className="ml-4">Illegal, harmful, deceptive, or infringing content</li>
                <li className="ml-4">Pornographic, sexually explicit, or adult content</li>
                <li className="ml-4">Software cheats, hacks, exploits, cracks, or malicious code</li>
                <li className="ml-4">Shell scripts, Base64-encoded scripts, or obfuscated code</li>
                <li className="ml-4">Hacking tutorials or system exploitation guides</li>
                <li className="ml-4">Copyrighted material without legal rights or permission</li>
                <li className="ml-4">Gambling guides or promotion of gambling services</li>
                <li className="ml-4">Cannabis/marijuana products or controlled substances</li>
                <li className="ml-4">Hate speech, violent content, or extremist propaganda</li>
                <li className="ml-4">Child sexual abuse material (CSAM) - <strong className="text-amber-400">zero tolerance</strong></li>
                <li className="ml-4">Privacy violations, doxxing, or leaked personal data</li>
                <li className="ml-4">Pyramid schemes, MLM recruitment, or deceptive practices</li>
              </ul>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Platform Abuse</h3>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Use bots, scripts, or automated systems to manipulate traffic, engagement, or earnings</li>
                <li>Attempt to disrupt, exploit, or reverse-engineer the Services</li>
                <li>Circumvent or interfere with content moderation, safety systems, or security controls</li>
                <li>Evade enforcement actions through creation of multiple accounts</li>
                <li>Access the Services from embargoed or sanctioned jurisdictions</li>
              </ul>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Monetization Abuse</h3>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Monetize prohibited content</li>
                <li>Use RepoHive for peer-to-peer money transmission unrelated to published content</li>
                <li>Create &quot;tip jar&quot; or donation features without associated content</li>
                <li>Engage in fraudulent transactions or payment manipulation</li>
                <li>Violate creator monetization requirements outlined in the User Content & Acceptable Use Policy</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4 font-medium text-amber-400">
                Violations may result in content removal, account suspension, permanent termination, payout holds, earnings reclamation, and reporting to authorities where legally required.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Zero-Tolerance Policy: Child Sexual Abuse Material</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive enforces a strict zero-tolerance policy regarding child sexual abuse material (&quot;CSAM&quot;).
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Any use, upload, storage, linking, promotion, or attempted access to content involving the sexual exploitation or depiction of minors is strictly prohibited.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">Violations will result in:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Immediate termination of the account</li>
                <li>Permanent removal from the platform</li>
                <li>Reporting to law enforcement and relevant authorities where legally required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Paid Services, Subscriptions, and Trials</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Certain RepoHive features require payment or offer optional premium access.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                By purchasing a paid plan, you authorize Heaventree Ltd. and its payment processors (such as Stripe) to charge your selected payment method.
              </p>
              <h3 className="text-lg font-medium text-white mb-2">Trials and Billing</h3>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Trial access may include a small, non-refundable verification charge</li>
                <li>Subscriptions renew automatically unless cancelled before renewal</li>
                <li>Pricing, billing frequency, and features are disclosed at checkout</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                By starting paid access, you expressly consent to the immediate delivery of digital services and acknowledge that any statutory withdrawal right may be waived once access begins, where permitted by law.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                Repeated failed payment attempts may result in administrative fees, service suspension, or account termination.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Premium Account Upgrades</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Some paid plans operate as account-level operational upgrades, providing benefits such as:
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Priority processing</li>
                <li>Faster internal handling</li>
                <li>Enhanced customer support responsiveness</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                The operational upgrade itself constitutes the paid service.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                Any interface conveniences (e.g. reduced delays, simplified workflows, fewer interruptions) are provided as complimentary courtesy features, are not guaranteed, and do not form part of the contractual consideration.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Cancellations and Refunds</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Subscriptions may be cancelled at any time via your account settings.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">Unless required by law:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Payments are non-refundable once digital access begins</li>
                <li>Paid access remains active until the end of the billing cycle</li>
                <li>Outstanding balances remain payable after cancellation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Creator, Publisher & Monetization Programs</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Creators participating in RepoHive monetization programs must comply with all platform, advertiser, and regional rules.
              </p>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Revenue Sharing Model</h3>
              <p className="text-gray-300 leading-relaxed mb-2">RepoHive operates the following revenue sharing structure:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li><strong>Direct Sales (Marketplace):</strong> Creators receive 60% of each sale, platform retains 40%</li>
                <li><strong>Premium Subscription Attribution:</strong> Attributed creators receive 25% of the subscription amount when a user subscribes after viewing their content within 30 days (last-touch attribution)</li>
                <li><strong>Day Pass Pool:</strong> 40% of Day Pass revenue is distributed monthly to creators based on content unlocked during Day Pass sessions</li>
                <li><strong>Referral Commissions:</strong> Creators earn 10% of subscription amounts from users who sign up via their referral links</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Revenue share percentages may be adjusted with 30 days notice. Current rates are displayed at <Link to="/creators/earnings" className="text-primary hover:underline">repohive.cloud/creators/earnings</Link>.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2 mt-4">Prohibited conduct includes:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Artificial or automated traffic</li>
                <li>Incentivized or misleading engagement</li>
                <li>Metric inflation or earnings manipulation</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Heaventree Ltd. may withhold, reverse, or reclaim earnings obtained through non-compliant or fraudulent activity.
              </p>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Artificial Traffic & Enforcement</h3>
              <p className="text-gray-300 leading-relaxed">
                Any attempt to manipulate impressions, subscriptions, clicks, or payouts through bots, automation, or deceptive practices may result in account termination and legal action where financial harm or fraud occurs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                All RepoHive software, branding, design, and systems are owned by Heaventree Ltd. or its licensors.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                You may not copy, distribute, or exploit any part of the Services without prior written permission.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                By submitting content, you grant Heaventree Ltd. a non-exclusive, worldwide license to host, display, and distribute your content solely for operating RepoHive.
              </p>
              
              <h3 className="text-lg font-medium text-white mt-6 mb-3">User Content Warranties</h3>
              <p className="text-gray-300 leading-relaxed mb-2">By submitting content to RepoHive, you represent and warrant that:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>You own all rights to the content or have obtained all necessary licenses and permissions</li>
                <li>The content does not infringe any third-party intellectual property rights, including copyrights, trademarks, patents, or trade secrets</li>
                <li>You have the legal right to publish and, if applicable, monetize the content</li>
                <li>The content complies with all applicable laws and RepoHive&apos;s policies</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                You agree to indemnify and hold harmless Heaventree Ltd. from any claims, damages, or expenses arising from your breach of these warranties.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">Copyright Infringement Reporting</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive respects intellectual property rights and responds to valid copyright infringement notices in accordance with applicable law, including the Digital Millennium Copyright Act (DMCA) where applicable.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">To report copyright infringement, submit a notice to <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a> with:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Identification of the copyrighted work</li>
                <li>URL or identifier of the allegedly infringing content</li>
                <li>Your contact information</li>
                <li>Statement of good faith belief that use is unauthorized</li>
                <li>Statement that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
                <li>Physical or electronic signature</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                We will investigate valid notices and take appropriate action, which may include content removal and account termination for repeat infringers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. Data Protection & Privacy</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Personal data is processed in accordance with applicable data protection laws, including GDPR where relevant.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Details are provided in the <Link to="/legal/privacy" className="text-primary hover:underline">RepoHive Privacy Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. Third-Party Services</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive may integrate with third-party platforms or APIs.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Heaventree Ltd. is not responsible for third-party content, availability, security, or policies. Your use of third-party services is governed by their own terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">13. Liability and Indemnity</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive is provided &quot;as is&quot; and &quot;as available.&quot;
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">To the maximum extent permitted by law:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>All warranties are disclaimed</li>
                <li>Liability is limited to the fees paid by you in the preceding 12 months</li>
                <li>No liability is accepted for indirect or consequential losses</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                You agree to indemnify Heaventree Ltd. against claims arising from your use of RepoHive or breach of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">14. Consumer Withdrawal Rights</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Where applicable, consumers may have a statutory right of withdrawal unless waived due to immediate digital service delivery.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Withdrawal requests should be sent to: <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">15. Changes to These Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms may be updated for legal, technical, or operational reasons. Continued use of RepoHive constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">16. Governing Law & Jurisdiction</h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms are governed by the laws of Gibraltar. The courts of Gibraltar have exclusive jurisdiction unless mandatory consumer protections apply.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">17. Severability & Assignment</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If any provision is found unenforceable, the remaining provisions remain in effect.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Heaventree Ltd. may assign its rights and obligations to affiliates or successors.
              </p>
            </section>

            <section className="border-t border-white/10 pt-8 mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
              <p className="text-gray-300 leading-relaxed">
                RepoHive (operated by Heaventree Ltd.)<br />
                Suite 4.3.02, Block 4, Eurotowers,<br />
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
