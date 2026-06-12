

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ImprintPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0B12] to-[#12121A] dark:from-[#0B0B12] dark:to-[#12121A]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="text-primary hover:underline mb-8 flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Legal Disclosure (Imprint)</h1>
          <p className="text-gray-400 mb-8">Information provided in accordance with applicable commercial, digital services, and consumer protection regulations</p>
          
          <div className="prose prose-invert max-w-none space-y-8">
            
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Platform Information</h2>
              <ul className="text-gray-300 space-y-2 list-none pl-0">
                <li><strong className="text-white">Platform Name:</strong> RepoHive</li>
                <li><strong className="text-white">Website:</strong> <a href="https://repohive.cloud" className="text-primary hover:underline">https://repohive.cloud</a></li>
                <li><strong className="text-white">Ownership & Operation:</strong> RepoHive is owned and operated by Heaventree Ltd.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Company Details</h2>
              <ul className="text-gray-300 space-y-2 list-none pl-0">
                <li><strong className="text-white">Legal Entity:</strong> Heaventree Ltd.</li>
                <li><strong className="text-white">Jurisdiction of Registration:</strong> Gibraltar</li>
                <li><strong className="text-white">Registered Address:</strong> Suite 4.3.02, Block 4, Eurotowers, Gibraltar, GX111AA</li>
                <li><strong className="text-white">Contact Email:</strong> <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Company Registration</h2>
              <p className="text-gray-300 leading-relaxed">
                Heaventree Ltd. is a company duly incorporated and registered under the laws of Gibraltar. Official company registration records are maintained by the Gibraltar Companies Registry and may be accessed in accordance with applicable legal requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Responsible Party for Content</h2>
              <p className="text-gray-300 leading-relaxed">
                Heaventree Ltd. acts as the service provider and technical operator of the RepoHive platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Hosting & Technical Infrastructure Disclaimer</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive operates as a software-based digital platform. Hosting, content delivery, storage, and infrastructure services may be provided in whole or in part by third-party hosting, cloud, or infrastructure providers.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Heaventree Ltd. does not operate its own physical servers and does not directly control the underlying hosting infrastructure. Responsibility for the technical operation, availability, and security of hosting services rests with the respective infrastructure providers, subject to their contractual obligations.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Heaventree Ltd. shall not be liable for temporary unavailability, service interruptions, data transmission failures, or performance issues caused by third-party infrastructure providers, network operators, or force majeure events, except where liability is mandatory under applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Platform Operator vs. Content Publisher Distinction</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive is a neutral technical tool that enables users to organise, annotate, and analyse references to publicly available open-source repositories within their own private workspaces.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">Heaventree Ltd.:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>Does not act as the publisher, editor, or author of user-submitted content (such as notes and project descriptions)</li>
                <li>Does not author or control the third-party repositories referenced on the Platform, whose metadata is retrieved from the GitHub public API</li>
                <li>Does not pre-screen user-submitted content prior to storage</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                Content submitted by users remains the sole responsibility of the respective user. AI-generated analyses are produced automatically and are provided for informational purposes only.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                Heaventree Ltd. shall not be regarded as the publisher or content provider within the meaning of applicable media, press, or publishing laws, unless expressly stated otherwise in writing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Liability for Content</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                All platform-owned content is created with due care and professional diligence. However, Heaventree Ltd. does not guarantee the accuracy, completeness, or timeliness of information provided on RepoHive.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Heaventree Ltd. is not obligated to actively monitor user-generated or transmitted content, nor to investigate circumstances indicating unlawful activity, unless required by applicable law.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Obligations to remove or disable access to unlawful content remain unaffected once Heaventree Ltd. becomes aware of a specific legal violation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Liability for External Links</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                RepoHive may contain links to third-party websites or services. Heaventree Ltd. has no control over the content or operation of external sites and assumes no responsibility for their content, accuracy, legality, or security.
              </p>
              <p className="text-gray-300 leading-relaxed">
                At the time of linking, no unlawful content was identifiable. Continuous monitoring of linked pages is not reasonable without concrete evidence of a legal infringement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Notice-and-Action / Safe Harbour Framework</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Heaventree Ltd. operates RepoHive in reliance on applicable intermediary and hosting safe-harbour provisions.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                User content is not actively monitored. Upon obtaining actual knowledge of unlawful content through a valid notice, complaint, or legal order, Heaventree Ltd. will act expeditiously to remove or disable access to such content in accordance with applicable law.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Reports of illegal or infringing content may be submitted to: <a href="mailto:info@repohive.cloud" className="text-primary hover:underline">info@repohive.cloud</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">EU Digital Services Act (DSA) Compliance</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                For users located in the European Union, RepoHive operates in accordance with the EU Digital Services Act (Regulation (EU) 2022/2065) where applicable.
              </p>
              <p className="text-gray-300 leading-relaxed mb-2">In particular:</p>
              <ul className="text-gray-300 space-y-1 list-disc pl-6">
                <li>RepoHive qualifies as an intermediary service provider within the meaning of the DSA</li>
                <li>Heaventree Ltd. benefits from the DSA&apos;s liability exemptions for hosting services, provided the statutory conditions are met</li>
                <li>A notice-and-action mechanism is available for reporting illegal content</li>
                <li>Content moderation actions are carried out in a proportionate, transparent, and non-arbitrary manner</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4">
                RepoHive does not operate algorithmic recommendation or ranking systems that materially shape public discourse within the meaning of a Very Large Online Platform (VLOP), unless explicitly stated otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Copyright and Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                All platform software, design elements, branding, layout, and proprietary systems published on RepoHive are protected by applicable copyright and intellectual property laws.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Any reproduction, modification, distribution, or commercial use beyond what is legally permitted requires the prior written consent of Heaventree Ltd. or the respective rights holder.
              </p>
              <p className="text-gray-300 leading-relaxed">
                User-generated content remains the property of its respective authors, subject to the licenses granted under the RepoHive Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Applicable Law</h2>
              <p className="text-gray-300 leading-relaxed">
                This Legal Disclosure is governed by the laws of Gibraltar, without prejudice to mandatory consumer protection or digital services regulations applicable in other jurisdictions.
              </p>
            </section>

            <section className="border-t border-white/10 pt-8 mt-8">
              <p className="text-gray-400">
                © Heaventree Ltd. — Gibraltar<br />
                Operator of RepoHive
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
