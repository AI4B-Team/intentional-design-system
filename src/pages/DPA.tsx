import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DPA() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Processing Agreement</h1>
        <p className="text-slate-500 mb-8">Last updated: April 16, 2026</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Introduction</h2>
            <p className="text-slate-600 mb-4">
              This Data Processing Agreement ("DPA") forms part of the agreement between RealElite ("Processor")
              and the Customer ("Controller") for the provision of RealElite's real estate investment platform and
              telecommunications services (the "Services"). This DPA reflects the parties' agreement regarding the
              processing of Personal Data in connection with the Services, including the power dialer, call recording,
              SMS messaging, AI analysis, and all related communication features.
            </p>
            <p className="text-slate-600 mb-4">
              This DPA is supplemental to the
              <Link to="/terms" className="text-brand hover:underline mx-1">Terms of Service</Link>,
              <Link to="/privacy" className="text-brand hover:underline mx-1">Privacy Policy</Link>, and
              <Link to="/telecom-terms" className="text-brand hover:underline mx-1">Telecommunications Terms</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Definitions</h2>
            <ul className="list-none pl-0 text-slate-600 space-y-3 mb-4">
              <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person, including but not limited to names, phone numbers, email addresses, call recordings, voicemail content, SMS messages, IP addresses, and any other data processed through the Services.</li>
              <li><strong>"Controller"</strong> means the Customer who determines the purposes and means of processing Personal Data through the Services.</li>
              <li><strong>"Processor"</strong> means RealElite, which processes Personal Data on behalf of the Controller in connection with providing the Services.</li>
              <li><strong>"Sub-Processor"</strong> means any third party engaged by RealElite to process Personal Data on behalf of the Controller.</li>
              <li><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, recording, storage, adaptation, retrieval, consultation, use, disclosure, alignment, combination, restriction, erasure, or destruction.</li>
              <li><strong>"Data Subject"</strong> means the identified or identifiable natural person whose Personal Data is processed.</li>
              <li><strong>"Applicable Data Protection Laws"</strong> means all applicable data protection and privacy laws, including but not limited to the California Consumer Privacy Act (CCPA), state privacy laws, the Telephone Consumer Protection Act (TCPA), and where applicable, the General Data Protection Regulation (GDPR).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Roles & Responsibilities</h2>

            <h3 className="text-lg font-medium text-slate-900 mb-3">2.1 Controller Obligations</h3>
            <p className="text-slate-600 mb-4">The Controller undertakes to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Process Personal Data in compliance with all Applicable Data Protection Laws</li>
              <li>Ensure a lawful basis exists for all Personal Data processed through the Services (e.g., consent, legitimate interest, contractual necessity)</li>
              <li>Be solely responsible for the accuracy, quality, and legality of Personal Data provided to RealElite</li>
              <li>Inform Data Subjects of the processing of their Personal Data through the Services, including the use of call recording, AI analysis, and telecommunications features</li>
              <li>Provide documented instructions regarding the purposes and means of processing</li>
              <li>Obtain all necessary consents before enabling call recording, SMS messaging, or AI-powered analysis features</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-900 mb-3">2.2 Processor Obligations</h3>
            <p className="text-slate-600 mb-4">RealElite, as Processor, undertakes to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Process Personal Data only on behalf of the Controller and in accordance with documented instructions</li>
              <li>Treat all Personal Data as confidential information</li>
              <li>Ensure that all persons authorized to process Personal Data are subject to confidentiality obligations</li>
              <li>Restrict access to Personal Data to personnel who strictly require it for service delivery</li>
              <li>Implement appropriate technical and organizational security measures (see Section 4)</li>
              <li>Assist the Controller in responding to Data Subject requests and demonstrating compliance with data protection obligations</li>
              <li>Notify the Controller promptly if any processing instruction is believed to violate Applicable Data Protection Laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Details of Processing</h2>

            <h3 className="text-lg font-medium text-slate-900 mb-3">3.1 Categories of Data Subjects</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Property owners and motivated sellers contacted through the dialer</li>
              <li>Real estate agents and brokers</li>
              <li>Cash buyers and investors in the buyer network</li>
              <li>Leads and prospects from marketing campaigns</li>
              <li>Customer's employees and authorized users</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-900 mb-3">3.2 Types of Personal Data</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Contact information: names, phone numbers, email addresses, mailing addresses</li>
              <li>Property information: addresses, ownership records, transaction history</li>
              <li>Communication records: call recordings, transcripts, SMS messages, voicemails</li>
              <li>AI-generated data: call analysis, sentiment scores, disposition classifications</li>
              <li>Usage data: call duration, timestamps, user activity logs</li>
              <li>Financial data: offer amounts, deal terms, transaction values</li>
            </ul>

            <h3 className="text-lg font-medium text-slate-900 mb-3">3.3 Purpose of Processing</h3>
            <p className="text-slate-600 mb-4">
              Personal Data is processed for the purpose of providing the RealElite platform services, including:
              facilitating telecommunications, managing customer relationships, generating AI-powered insights,
              conducting marketing campaigns, tracking deal pipelines, and enabling compliance with applicable regulations.
            </p>

            <h3 className="text-lg font-medium text-slate-900 mb-3">3.4 Duration of Processing</h3>
            <p className="text-slate-600 mb-4">
              Processing shall continue for the duration of the Service agreement. Upon termination, RealElite will
              cease processing and, at the Controller's election, return or securely delete all Personal Data within
              sixty (60) days, except as required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Security Measures</h2>
            <p className="text-slate-600 mb-4">
              RealElite implements and maintains appropriate technical and organizational security measures, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Encryption of data in transit (TLS 1.2+) and at rest (AES-256)</li>
              <li>Access controls with role-based permissions and multi-factor authentication</li>
              <li>Regular security assessments and vulnerability testing</li>
              <li>Secure data centers with physical access controls and environmental protections</li>
              <li>Employee security awareness training and background checks</li>
              <li>Logging and monitoring of access to Personal Data</li>
              <li>Secure call recording storage with access audit trails</li>
              <li>Network segmentation and intrusion detection systems</li>
            </ul>
            <p className="text-slate-600 mb-4">
              Security measures may be updated to reflect technical progress, provided that updates do not
              materially reduce the overall security posture.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Sub-Processors</h2>
            <p className="text-slate-600 mb-4">
              The Controller authorizes RealElite to engage Sub-Processors for the provision of the Services.
              RealElite shall:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Enter into written agreements with each Sub-Processor containing data protection obligations equivalent to those in this DPA</li>
              <li>Remain liable for the acts and omissions of its Sub-Processors</li>
              <li>Maintain a list of current Sub-Processors and make it available to the Controller upon request</li>
              <li>Notify the Controller at least ten (10) business days before engaging a new Sub-Processor</li>
            </ul>
            <p className="text-slate-600 mb-4">
              The Controller may object to a new Sub-Processor by providing written notice within ten (10) business
              days of notification. RealElite will use reasonable efforts to offer an alternative solution or recommend
              configuration changes to avoid processing by the objected Sub-Processor.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Data Breach Notification</h2>
            <p className="text-slate-600 mb-4">
              In the event of a breach involving Personal Data, RealElite shall:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Notify the Controller without undue delay, and in any event within seventy-two (72) hours of becoming aware of the breach</li>
              <li>Provide detailed information about the breach, including: the nature and scope of the breach, categories and approximate number of affected Data Subjects, likely consequences, and measures taken or proposed to mitigate the impact</li>
              <li>Promptly investigate and take reasonable steps to contain and remediate the breach</li>
              <li>Cooperate with the Controller in meeting any regulatory notification obligations</li>
            </ul>
            <p className="text-slate-600 mb-4">
              Notification of a breach shall not constitute an acknowledgment of fault or liability by RealElite.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Data Subject Rights</h2>
            <p className="text-slate-600 mb-4">
              RealElite will assist the Controller in fulfilling Data Subject requests, including requests to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Access their Personal Data</li>
              <li>Correct inaccurate data</li>
              <li>Delete their data ("right to be forgotten")</li>
              <li>Restrict or object to processing</li>
              <li>Receive their data in a portable format</li>
              <li>Opt out of automated decision-making</li>
            </ul>
            <p className="text-slate-600 mb-4">
              If RealElite receives a request directly from a Data Subject, it will promptly notify the Controller
              and will not respond to the request without the Controller's prior authorization, unless required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Data Retention & Deletion</h2>
            <p className="text-slate-600 mb-4">
              Upon termination or expiration of the Service agreement:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>RealElite will cease all processing of Personal Data</li>
              <li>At the Controller's election, RealElite will return or irreversibly delete all Personal Data within sixty (60) days</li>
              <li>If the Controller does not provide instructions, RealElite will automatically delete Personal Data after the retention period</li>
              <li>RealElite may retain copies of Personal Data as required by law, subject to continued confidentiality obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Audits</h2>
            <p className="text-slate-600 mb-4">
              Upon reasonable request and subject to confidentiality obligations, RealElite will make available
              information necessary to demonstrate compliance with this DPA. Audits may be conducted no more
              than once per year during normal business hours, with at least sixty (60) days' prior written notice.
              The Controller shall bear the costs of any audit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">10. International Data Transfers</h2>
            <p className="text-slate-600 mb-4">
              If Personal Data is transferred outside the United States or the European Economic Area, RealElite
              will ensure appropriate safeguards are in place, including Standard Contractual Clauses or other
              mechanisms approved by applicable regulatory authorities, to ensure an adequate level of protection
              for Personal Data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Telecommunications-Specific Data Processing</h2>
            <p className="text-slate-600 mb-4">
              In addition to general data processing obligations, the following provisions apply specifically to
              data processed through RealElite's telecommunications features:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Call Recordings:</strong> Stored encrypted with access limited to authorized users. Retained per Controller's configured retention policy. Controller is responsible for obtaining all-party consent where required.</li>
              <li><strong>Call Transcriptions:</strong> Generated by AI and stored alongside recordings. May contain inaccuracies. Not intended as legal transcripts.</li>
              <li><strong>SMS/Text Messages:</strong> Message content and metadata are stored for delivery and compliance purposes. Opt-out records are maintained as required by law.</li>
              <li><strong>Caller ID & Phone Numbers:</strong> CNAM data and number assignments are processed for service delivery. Customer is responsible for the accuracy of caller ID information displayed.</li>
              <li><strong>AI Analysis Data:</strong> Call sentiment scores, coaching suggestions, and disposition classifications are derived from call content and stored as supplementary data.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Contact</h2>
            <p className="text-slate-600 mb-4">
              For questions or requests related to this Data Processing Agreement, contact:
            </p>
            <p className="text-slate-600">
              Data Protection Contact: privacy@realelite.io<br />
              General Support: support@realelite.io
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
            <Link to="/terms" className="text-sm text-slate-500 hover:text-brand">Terms of Service</Link>
            <Link to="/privacy" className="text-sm text-slate-500 hover:text-brand">Privacy Policy</Link>
            <Link to="/telecom-terms" className="text-sm text-slate-500 hover:text-brand">Telecom Terms</Link>
            <Link to="/dpa" className="text-sm text-slate-500 hover:text-brand">DPA</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
