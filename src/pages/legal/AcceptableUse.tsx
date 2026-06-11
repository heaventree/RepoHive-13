

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

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">User Content & Acceptable Use Policy</h1>
          <p className="text-gray-400 mb-8">Effective Date: 17 January 2026</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-gray-300 leading-relaxed">
              This User Content & Acceptable Use Policy (&quot;Policy&quot;) governs all content submitted, uploaded, generated, or stored on RepoHive (&quot;the Platform&quot;). This Policy applies in addition to our <Link to="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>, <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and <Link to="/legal/imprint" className="text-primary hover:underline">Imprint</Link>.
            </p>
            <p className="text-gray-300 leading-relaxed">
              By using RepoHive, you agree to comply with this Policy at all times.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Permitted Content Formats</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive is a <strong className="text-white">text-only publishing platform</strong>.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">The following content formats are permitted:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Plain text</li>
                <li>Markdown (.md)</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                All submitted content is automatically processed and sanitised. Any embedded HTML contained within Markdown is sanitised or removed if it does not meet our safety and integrity standards.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4 font-medium text-white">
                No other file types, executable formats, or embedded scripts are permitted.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Prohibited Content (Zero Tolerance)</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Users must not upload, submit, store, or publish any content that falls into the following categories.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.1 Illegal or Unlawful Content</h3>
              <p className="text-gray-300 leading-relaxed mb-2">Including but not limited to:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Content that violates any applicable local, national, or international law</li>
                <li>Instructions or facilitation of criminal activity</li>
                <li>Fraud, scams, or deceptive practices</li>
                <li>Content promoting unlawful violence or physical harm</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.2 Intellectual Property Infringement</h3>
              <p className="text-gray-300 leading-relaxed mb-2">You may not upload or publish:</p>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Copyright Violations:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Copyrighted text, books, articles, manuals, software documentation, or creative works without legal rights or permission</li>
                <li>Pirated, leaked, or illegally distributed materials</li>
                <li>Circumvention of copyright protections (DRM, access controls)</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Counterfeit Goods:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Descriptions, guides, or promotion of counterfeit products</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Trademark Infringement:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Unauthorized use of brand names, logos, or trademarks</li>
                <li>Brand impersonation or misleading brand associations</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Trade Secret Violations:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Disclosure of proprietary business information without authorization</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4 italic">
                Users are solely responsible for ensuring they have all necessary rights, licenses, and permissions to publish submitted content.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.3 Malware, Exploits & Harmful Code</h3>
              <p className="text-gray-300 leading-relaxed mb-2">The following are strictly prohibited, even when presented as &quot;educational&quot; or &quot;examples&quot;:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Malware, spyware, trojans, ransomware</li>
                <li>Exploit code or vulnerability weaponization</li>
                <li>Software cracks, license bypasses, or cheats</li>
                <li>Reverse-engineering instructions</li>
                <li>Payload delivery instructions</li>
                <li>Keyloggers, rootkits, or backdoor tools</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.4 Scripts, Obfuscation & Execution-Capable Content</h3>
              <p className="text-gray-300 leading-relaxed mb-2">RepoHive does not permit executable or automation-oriented content, including but not limited to:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Shell scripts (bash, sh, zsh, PowerShell, etc.)</li>
                <li>Batch files or command-line automation</li>
                <li>Base64-encoded scripts or payloads</li>
                <li>Obfuscated code intended to conceal behavior</li>
                <li>Instructions to bypass safeguards, filters, or security systems</li>
                <li>Automated bot scripts or web scraping tools</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4 italic">
                This includes content whose primary purpose is to enable technical abuse, exploitation, or circumvention.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.5 Hacking & System Abuse Guidance</h3>
              <p className="text-gray-300 leading-relaxed mb-2">You may not publish:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Hacking tutorials or walkthroughs</li>
                <li>Penetration testing instructions (beyond defensive theory)</li>
                <li>Guides to exploit software, networks, APIs, or services</li>
                <li>Content enabling account takeover, credential stuffing, or brute-force attacks</li>
                <li>Scraping, denial-of-service, or network disruption techniques</li>
                <li>Social engineering or phishing guides</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.6 Harmful, Abusive, or Exploitative Content</h3>
              <p className="text-gray-300 leading-relaxed mb-2"><strong className="text-white">Hate Speech:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Content promoting hatred, discrimination, or violence against individuals or groups based on race, ethnicity, religion, gender, sexual orientation, disability, or other protected characteristics</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Violent Content:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Graphic violence, gore, or content glorifying violence</li>
                <li>Instructions for creating weapons or explosives</li>
                <li>Content promoting dangerous or life-threatening activities</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Threats and Harassment:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Direct threats, intimidation, or incitement to violence</li>
                <li>Doxxing, stalking, or targeted harassment</li>
                <li>Coordinated harassment campaigns</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Extremist Content:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Terrorist propaganda or recruitment materials</li>
                <li>Content promoting violent extremism or radicalization</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Self-Harm:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Content encouraging suicide, self-injury, or eating disorders</li>
                <li>Dangerous challenges or life-threatening activities</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Exploitation:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Non-consensual intimate content or revenge porn</li>
                <li>Exploitative materials or content facilitating exploitation</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.7 Child Safety (Absolute Prohibition)</h3>
              <p className="text-gray-300 leading-relaxed mb-2">RepoHive has <strong className="text-white">zero tolerance</strong> for:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Child sexual abuse material (CSAM)</li>
                <li>Sexual content involving minors</li>
                <li>Grooming or exploitation content</li>
                <li>Content sexualizing children</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4 font-medium text-amber-400">
                Any such material will be immediately removed and reported to appropriate authorities, including law enforcement and the National Center for Missing & Exploited Children (NCMEC).
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.8 Privacy Violations & Personal Data Abuse</h3>
              <p className="text-gray-300 leading-relaxed mb-2">Users must not upload:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Personal data belonging to others without consent</li>
                <li>Doxxing content (addresses, phone numbers, private information)</li>
                <li>Leaked databases or credentials</li>
                <li>Private communications without authorization</li>
                <li>Medical records or financial information without consent</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.9 Adult Content and Services</h3>
              <p className="text-gray-300 leading-relaxed mb-2">RepoHive strictly prohibits all adult content and services, including:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li><strong className="text-white">Pornography and sexually explicit materials:</strong> Literature, imagery, or media depicting nudity or explicit sexual acts intended for sexual gratification</li>
                <li><strong className="text-white">AI-generated adult content:</strong> Any artificial intelligence-generated content meeting the above criteria</li>
                <li><strong className="text-white">Adult services:</strong> Prostitution, escort services, sexual massages, pay-per-view sexual content, fetish services, mail-order bride services, adult live-chat features</li>
                <li><strong className="text-white">Content promoting adult services:</strong> Guides, directories, or promotional materials for adult services</li>
                <li><strong className="text-white">Dating or matchmaking services with sexual intent</strong></li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4 italic">
                This prohibition applies regardless of the legal status of such content in any jurisdiction.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.10 Gambling and Games of Chance</h3>
              <p className="text-gray-300 leading-relaxed mb-2">The following gambling-related content is prohibited:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Gambling guides, betting systems, or &quot;guaranteed win&quot; strategies</li>
                <li>Promotion of online casinos, sports betting, or gambling services</li>
                <li>Sweepstakes, contests, or lotteries with monetary prizes</li>
                <li>Fantasy sports league guides with cash prizes</li>
                <li>Poker, blackjack, or other casino game strategies intended for real-money gambling</li>
                <li>Affiliate links or referrals to gambling services</li>
                <li>Sports forecasting or odds-making services</li>
                <li>Bidding fee auctions or penny auctions</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.11 Controlled Substances and Regulated Products</h3>
              <p className="text-gray-300 leading-relaxed mb-2"><strong className="text-white">Cannabis/Marijuana:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Cannabis or marijuana products, cultivation guides, or dispensary promotion</li>
                <li>CBD products with THC levels exceeding local legal limits</li>
                <li>Hydroponic equipment marketed for growing marijuana</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Illegal Drugs:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Illegal drugs or substances designed to mimic illegal drugs</li>
                <li>Instructions for synthesizing, manufacturing, or distributing controlled substances</li>
                <li>Drug paraphernalia or equipment for drug use</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Regulated Products:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Tobacco products, e-cigarettes, or vaping guides (where restricted)</li>
                <li>Pharmaceuticals without valid prescription or licensing</li>
                <li>Unregulated supplements making harmful health claims</li>
                <li>Anabolic steroids or performance-enhancing drugs without prescription</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-3">2.12 Unfair, Deceptive, or Predatory Practices</h3>
              <p className="text-gray-300 leading-relaxed mb-2"><strong className="text-white">Pyramid Schemes and MLM:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Pyramid schemes or multi-level marketing (MLM) recruitment scripts</li>
                <li>Business models primarily based on recruitment rather than product sales</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Deceptive Practices:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>&quot;Get rich quick&quot; schemes with unrealistic income claims</li>
                <li>Deceptive testimonials or fabricated success stories</li>
                <li>Fake product reviews or paid endorsements without disclosure</li>
                <li>Misleading claims about products, services, or business opportunities</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Predatory Financial Practices:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Predatory mortgage consulting or loan modification scams</li>
                <li>Predatory investment opportunities or Ponzi schemes</li>
                <li>Credit repair scams or debt relief schemes</li>
                <li>Payday loan promotion or predatory lending</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Other Deceptive Practices:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Phishing guides or social engineering tutorials</li>
                <li>Content designed to manipulate, deceive, or defraud users</li>
                <li>Document falsification services or fake credential creation</li>
                <li>Identity theft services or guides</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Content Moderation & Enforcement</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive employs <strong className="text-white">automated and manual review processes</strong> to detect and prevent prohibited content.
              </p>

              <h3 className="text-lg font-medium text-white mt-4 mb-3">Moderation Systems</h3>
              <p className="text-gray-300 leading-relaxed mb-2"><strong className="text-white">Pre-Publication Scanning:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Automated content analysis using keyword detection, pattern matching, and content classification</li>
                <li>Flagging of potentially prohibited content for review</li>
                <li>Blocking of high-confidence violations before publication</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-3 mb-2"><strong className="text-white">Post-Publication Monitoring:</strong></p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>User reporting system for community flagging</li>
                <li>Periodic audits of published content</li>
                <li>Proactive scanning of high-traffic or monetized content</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-3">User Obligations</h3>
              <p className="text-gray-300 leading-relaxed mb-2">Users agree that they will <strong className="text-white">not</strong> attempt to:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Evade, bypass, probe, or reverse-engineer any content moderation, safety, or detection mechanisms used by the Platform</li>
                <li>Circumvent automated filters or detection systems</li>
                <li>Use obfuscation techniques to conceal prohibited content</li>
                <li>Repeatedly upload prohibited content after removal</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-3">Enforcement Actions</h3>
              <p className="text-gray-300 leading-relaxed mb-2">Enforcement actions may include:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li><strong className="text-white">Content removal</strong> - immediate takedown of prohibited content</li>
                <li><strong className="text-white">Account warnings</strong> - notification of policy violations</li>
                <li><strong className="text-white">Temporary account restrictions</strong> - suspension of publishing or monetization privileges</li>
                <li><strong className="text-white">Permanent account termination</strong> - account closure for severe or repeat violations</li>
                <li><strong className="text-white">Payout holds</strong> - freezing of creator earnings pending investigation</li>
                <li><strong className="text-white">Earnings reclamation</strong> - recovery of payments associated with prohibited content</li>
                <li><strong className="text-white">Reporting to authorities</strong> - escalation of illegal content to law enforcement or regulatory bodies where legally required</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4 italic">
                Enforcement decisions are made at RepoHive&apos;s sole discretion to protect users, the Platform, and legal compliance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Reporting & Notice Procedure</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you believe content on RepoHive violates this Policy, you may report it using the contact details listed in our <Link to="/legal/imprint" className="text-primary hover:underline">Imprint</Link>.
              </p>

              <h3 className="text-lg font-medium text-white mt-4 mb-3">Report Requirements</h3>
              <p className="text-gray-300 leading-relaxed mb-2">Reports should include:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>The URL or identifier of the content</li>
                <li>A brief explanation of the concern</li>
                <li>Your contact information (for follow-up if needed)</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-3">Response Process</h3>
              <p className="text-gray-300 leading-relaxed mb-2">RepoHive will:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Review reports promptly</li>
                <li>Investigate flagged content</li>
                <li>Take appropriate action in accordance with this Policy</li>
                <li>Notify reporters of outcomes where appropriate</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Appeals</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Users whose content or accounts are affected by enforcement actions may submit an appeal.
              </p>

              <h3 className="text-lg font-medium text-white mt-4 mb-3">Appeal Requirements</h3>
              <p className="text-gray-300 leading-relaxed mb-2">Appeals must:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Clearly identify the affected content or account</li>
                <li>Explain why the decision should be reconsidered</li>
                <li>Provide any relevant evidence or context</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-3">Appeal Process</h3>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Submit appeals to <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a></li>
                <li>Appeals will be reviewed by a different moderator than the original decision-maker</li>
                <li>Decisions will be communicated within a reasonable timeframe</li>
                <li><strong className="text-white">RepoHive reserves the right to uphold enforcement actions where violations are confirmed</strong></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Creator Monetization Requirements</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                For creators who monetize content on RepoHive, additional requirements apply:
              </p>

              <h3 className="text-lg font-medium text-white mt-4 mb-3">Creator Warranties</h3>
              <p className="text-gray-300 leading-relaxed mb-2">By monetizing content, you warrant that:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>You have all necessary rights, licenses, and permissions to publish and monetize the content</li>
                <li>The content does not violate any third-party intellectual property rights</li>
                <li>The content complies with all applicable laws and this Policy</li>
                <li>You will indemnify RepoHive for any claims arising from your content</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-3">Monetization Controls</h3>
              <p className="text-gray-300 leading-relaxed mb-2">RepoHive reserves the right to:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Verify creator identity before processing payouts</li>
                <li>Hold payouts for accounts under investigation</li>
                <li>Reclaim earnings associated with prohibited content</li>
                <li>Terminate monetization privileges for policy violations</li>
                <li>Require additional documentation for high-earning creators</li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-4 mb-3">Prevention of Peer-to-Peer Money Transmission</h3>
              <p className="text-gray-300 leading-relaxed mb-2">All monetized transactions must be tied to specific published content. The following are prohibited:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>&quot;Tip jar&quot; or profile-level donations without associated content</li>
                <li>Direct creator-to-creator transfers</li>
                <li>Using RepoHive as a personal payment service</li>
                <li>Transactions not related to published content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Copyright Complaint Procedure</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If you believe content on RepoHive infringes your copyright, submit a notice to <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a> with:
              </p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Identification of the copyrighted work</li>
                <li>URL of the infringing content</li>
                <li>Your contact information and signature</li>
                <li>Statement of good faith belief that use is unauthorized</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                We will investigate and take appropriate action in accordance with applicable law, including the Digital Millennium Copyright Act (DMCA) where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Policy Updates</h2>
              <p className="text-gray-300 leading-relaxed mb-2">This Policy may be updated periodically to reflect:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Changes in legal or regulatory requirements</li>
                <li>Evolution of platform features</li>
                <li>Emerging content risks or abuse patterns</li>
                <li>Feedback from users and stakeholders</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4 font-medium text-white">
                Continued use of RepoHive constitutes acceptance of the updated Policy.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4 mb-2">We will notify users of material changes through:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Email notification to registered users</li>
                <li>Prominent notice on the Platform</li>
                <li>Updated &quot;Effective Date&quot; at the top of this Policy</li>
              </ul>
            </section>

            <section className="border-t border-white/10 pt-8 mt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                For questions about this Policy, content reports, or appeals:
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">RepoHive</strong><br />
                Operated by Heaventree Ltd.<br />
                Suite 4.3.02, Block 4, Eurotowers,<br />
                Gibraltar, GX111AA<br />
                Email: <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a>
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                <strong className="text-white">By using RepoHive, you acknowledge that you have read, understood, and agree to be bound by this User Content & Acceptable Use Policy.</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
