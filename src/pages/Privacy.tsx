import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">RealElite</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-8">Last updated: January 28, 2025</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-600 mb-4">
              RealElite ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              real estate investment platform ("Service"). Please read this policy carefully. By using the 
              Service, you consent to the practices described in this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address, phone number, company name, and password when you create an account</li>
              <li><strong>Profile Information:</strong> Professional details, investment preferences, and market areas of interest</li>
              <li><strong>Property Data:</strong> Property addresses, financial details, and analysis data you input</li>
              <li><strong>Communication Data:</strong> Messages, notes, and other content you create within the Service</li>
              <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely by third-party payment processors)</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-800 mb-3">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on pages, and click patterns</li>
              <li><strong>Cookies and Similar Technologies:</strong> Information collected through cookies, pixels, and similar tracking technologies</li>
              <li><strong>Location Data:</strong> General geographic location based on IP address</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-600 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              <li>Personalize and improve your experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-slate-600 mb-4">We may share your information in the following situations:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (hosting, analytics, payment processing)</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition of all or a portion of our business</li>
              <li><strong>Legal Requirements:</strong> To comply with applicable laws, regulations, legal processes, or governmental requests</li>
              <li><strong>Protection of Rights:</strong> To protect the rights, privacy, safety, or property of you, us, or others</li>
              <li><strong>With Your Consent:</strong> With your explicit consent or at your direction</li>
            </ul>
            <p className="text-slate-600 mb-4">
              We do not sell your personal information to third parties for their marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Data Security</h2>
            <p className="text-slate-600 mb-4">
              We implement appropriate technical and organizational security measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction. 
              These measures include:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee training on data protection practices</li>
            </ul>
            <p className="text-slate-600 mb-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Data Retention</h2>
            <p className="text-slate-600 mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes for 
              which it was collected, including to satisfy any legal, accounting, or reporting requirements. 
              When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Your Rights and Choices</h2>
            <p className="text-slate-600 mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing of your information</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="text-slate-600 mb-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-slate-600 mb-4">
              We use cookies and similar tracking technologies to collect and store information about your 
              interactions with our Service. You can control cookies through your browser settings. However, 
              disabling cookies may limit your ability to use certain features of the Service.
            </p>
            <p className="text-slate-600 mb-4">Types of cookies we use:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use the Service</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">9. International Data Transfers</h2>
            <p className="text-slate-600 mb-4">
              Your information may be transferred to and processed in countries other than the country in 
              which you reside. These countries may have data protection laws that are different from the 
              laws of your country. We take appropriate safeguards to ensure that your personal information 
              remains protected in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Children's Privacy</h2>
            <p className="text-slate-600 mb-4">
              The Service is not intended for children under 18 years of age. We do not knowingly collect 
              personal information from children under 18. If you are a parent or guardian and believe your 
              child has provided us with personal information, please contact us so we can delete such 
              information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-slate-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
              advised to review this Privacy Policy periodically for any changes. Changes are effective 
              when they are posted on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Contact Us</h2>
            <p className="text-slate-600 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-slate-600">
              Email: privacy@realelite.io<br />
              Address: [Your Business Address]
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">13. Additional Disclosures</h2>
            
            <h3 className="text-lg font-medium text-slate-800 mb-3">For California Residents (CCPA)</h3>
            <p className="text-slate-600 mb-4">
              California residents have additional rights under the California Consumer Privacy Act (CCPA), 
              including the right to know what personal information is collected, the right to delete 
              personal information, and the right to opt-out of the sale of personal information. We do 
              not sell personal information as defined under CCPA.
            </p>

            <h3 className="text-lg font-medium text-slate-800 mb-3">For European Union Residents (GDPR)</h3>
            <p className="text-slate-600 mb-4">
              If you are a resident of the European Economic Area, you have certain data protection rights 
              under the General Data Protection Regulation (GDPR). We process your data based on legitimate 
              interests, contract performance, legal obligations, or your consent. You may contact your 
              local data protection authority if you have concerns about our data practices.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} RealElite. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-sm text-slate-500 hover:text-brand">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-slate-500 hover:text-brand">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
