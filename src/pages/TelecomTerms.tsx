import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TelecomTerms() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Telecommunications Terms of Service</h1>
        <p className="text-slate-500 mb-8">Last updated: April 16, 2026</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Overview of Telecommunications Services</h2>
            <p className="text-slate-600 mb-4">
              RealElite provides cloud-based telecommunications services ("Telecom Services") as part of its real estate
              investment platform, including but not limited to: a power dialer, AI-assisted calling, call recording and
              transcription, SMS/text messaging, voicemail drops, call queue management, and related communication
              tools. These Telecom Services are delivered via Voice over Internet Protocol (VoIP) technology and are
              designed for use by real estate professionals conducting legitimate business communications.
            </p>
            <p className="text-slate-600 mb-4">
              By accessing or using any Telecom Services, you ("Customer") agree to be bound by these
              Telecommunications Terms of Service ("Telecom Terms") in addition to the general
              <Link to="/terms" className="text-brand hover:underline mx-1">Terms of Service</Link>
              and <Link to="/privacy" className="text-brand hover:underline mx-1">Privacy Policy</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Authorized Use & Restrictions</h2>
            <p className="text-slate-600 mb-4">
              Customer is granted a non-exclusive, non-transferable right to use the Telecom Services during the term
              of their subscription, solely for Customer's internal business purposes related to real estate investment
              and sales activities.
            </p>
            <p className="text-slate-600 mb-4">Customer shall not:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Use the Telecom Services for any unlawful purpose, including robocalling, telemarketing fraud, or harassment</li>
              <li>Use automated dialing systems to contact numbers on any federal or state Do-Not-Call registry without proper consent</li>
              <li>Exceed reasonable usage thresholds designed to prevent spam and abuse (see Section 10)</li>
              <li>Share account credentials or allow unauthorized users to access the Telecom Services</li>
              <li>Use the Services as a call center, telephony switch, or wholesale call termination provider</li>
              <li>Reverse engineer, decompile, or attempt to derive the source code of any Telecom Service technology</li>
              <li>Transmit any malicious code, viruses, or harmful content through the Services</li>
              <li>Use the Services in any manner that disrupts or interferes with RealElite's infrastructure or other customers' use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Customer Responsibilities</h2>
            <p className="text-slate-600 mb-4">Customer is responsible for:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>All uses of the Telecom Services by authorized users under Customer's account, including all acts and omissions</li>
              <li>Ensuring all authorized users are aware of and comply with these Telecom Terms</li>
              <li>Maintaining the security of account credentials, passwords, and access controls</li>
              <li>Providing accurate identity verification and business information as required by applicable law and regulation</li>
              <li>Maintaining a reliable internet connection with sufficient bandwidth for VoIP services</li>
              <li>Cooperating with RealElite as reasonably necessary to enable provision of the Telecom Services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Telephone Number Management</h2>

            <h3 className="text-lg font-medium text-slate-900 mb-3">4.1 Number Assignment</h3>
            <p className="text-slate-600 mb-4">
              RealElite may assign one or more telephone numbers ("RealElite Numbers") to Customer's account.
              The availability and type of numbers depend on Customer's geographic location and selected plan.
              All U.S. numbers must be associated with a valid U.S. physical address.
            </p>

            <h3 className="text-lg font-medium text-slate-900 mb-3">4.2 Number Portability — Inbound</h3>
            <p className="text-slate-600 mb-4">
              Subject to technical feasibility, Customer may port existing telephone numbers to the RealElite platform.
              Customer represents and warrants that it is the legal owner of all numbers submitted for porting, and
              acknowledges that porting entails termination of Customer's previous carrier services associated with
              such numbers. RealElite shall have no liability for discontinuation of previous carrier services.
              Additional fees may apply for portability requests outside normal business hours.
            </p>

            <h3 className="text-lg font-medium text-slate-900 mb-3">4.3 Number Portability — Outbound</h3>
            <p className="text-slate-600 mb-4">
              Upon termination of this agreement, Customer may request that RealElite Numbers be ported to a new
              carrier. Such requests must be submitted at least thirty (30) calendar days prior to the end of the current
              term. If Customer does not request porting within sixty (60) days of termination, RealElite Numbers may
              be reassigned to other customers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Text Messaging & Autodialed Communications</h2>
            <p className="text-slate-600 mb-4">
              Customer expressly agrees to obtain all consents required by law from any person contacted through the
              Telecom Services, including but not limited to consent required under the Telephone Consumer Protection
              Act (TCPA), state telemarketing laws, and FCC regulations. Specifically, Customer agrees to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Obtain prior express written consent before sending autodialed or prerecorded marketing calls or texts</li>
              <li>Not contact any phone numbers registered on federal or state Do-Not-Call registries without proper consent</li>
              <li>Register for A2P 10DLC messaging when sending SMS to U.S. numbers, providing valid business information (EIN or sole proprietor registration)</li>
              <li>Provide clear notice to all SMS recipients that they are enrolling in a messaging service and that standard message and data rates apply</li>
              <li>Ensure that consent to receive SMS is not a condition of any purchase</li>
              <li>Honor unsubscribe requests immediately — recipients may reply STOP, QUIT, END, CANCEL, or UNSUBSCRIBE to opt out</li>
              <li>Send no more than one confirmation message following an unsubscribe request</li>
            </ul>
            <p className="text-slate-600 mb-4">
              RealElite is not responsible for any delays in sending or receiving text messages. Customer is solely
              responsible for compliance with all applicable messaging laws and regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Call Recording & Transcription Disclosures</h2>
            <p className="text-slate-600 mb-4">
              RealElite's Telecom Services include optional call recording, AI transcription, and call analysis features.
              Customer acknowledges and agrees that:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Recording laws vary by jurisdiction. Many states require all-party consent (including but not limited to California, Florida, Illinois, Maryland, Massachusetts, Montana, New Hampshire, Pennsylvania, and Washington)</li>
              <li>It is Customer's sole responsibility to determine applicable recording consent requirements and to obtain all necessary consents before enabling call recording</li>
              <li>Customer must inform all call participants of any recording and provide an opportunity to object</li>
              <li>AI-generated transcriptions and analysis are provided for informational purposes only and may contain errors — they should not be relied upon as verbatim records</li>
              <li>Call recordings are stored securely and subject to RealElite's data retention policies and applicable privacy regulations</li>
              <li>RealElite bears no liability for Customer's failure to comply with applicable recording consent laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Emergency Services (911/E911) Limitations</h2>
            <p className="text-slate-600 mb-4 font-semibold uppercase text-sm tracking-wide">
              IMPORTANT: READ THIS SECTION CAREFULLY. VOIP-BASED 911 SERVICES DIFFER SIGNIFICANTLY
              FROM TRADITIONAL LANDLINE 911 SERVICES.
            </p>
            <p className="text-slate-600 mb-4">
              RealElite's Telecom Services are VoIP-based and are NOT designed as a primary means of contacting
              emergency services. Customer acknowledges and agrees to the following limitations:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Power Outages:</strong> VoIP services will not operate during a power outage. Customer is responsible for maintaining backup power if continued operation is required.</li>
              <li><strong>Internet Dependency:</strong> Services will not function if Customer's broadband connection is disrupted or if the service has been suspended for any reason, including non-payment.</li>
              <li><strong>Location Accuracy:</strong> Customer must register and maintain an accurate physical address for each telephone number. Failure to do so may result in emergency services being dispatched to an incorrect location.</li>
              <li><strong>Network Instability:</strong> 911 calls may be delayed or dropped due to network congestion. Users may not be connected to emergency services, or calls may take longer to connect than traditional 911 calls.</li>
              <li><strong>Emergency Personnel Limitations:</strong> Local emergency call centers may not be equipped to receive VoIP-based 911 calls or capture caller location information.</li>
            </ul>
            <p className="text-slate-600 mb-4 font-medium">
              RealElite strongly advises Customer to maintain access to traditional 911 emergency services (e.g., a
              landline or mobile phone) at all times and not to rely solely on VoIP-based services for emergency calling.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Fees & Billing</h2>
            <p className="text-slate-600 mb-4">
              Telecom Services are billed as part of Customer's RealElite subscription plan. Additional charges may apply for:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Usage exceeding included plan minutes or message limits</li>
              <li>Additional phone numbers, call credits, or premium features</li>
              <li>Number porting (inbound or outbound)</li>
              <li>International calls or messages</li>
              <li>Compliance and Administrative Cost Recovery Fee ("CRF") — a per-user monthly fee covering regulatory compliance costs including FCC fees, Telecommunications Relay Service charges, caller ID verification, number management, and network infrastructure maintenance. The CRF is not a tax or government-mandated charge.</li>
              <li>E911 Regulatory Recovery Fee — a per-user monthly fee funding emergency service infrastructure and compliance with FCC 911/E911 mandates</li>
            </ul>
            <p className="text-slate-600 mb-4">
              All fees are exclusive of applicable taxes. Customer is responsible for all sales, use, and excise taxes.
              Subscription fees renew automatically each billing cycle. RealElite reserves the right to modify fees
              with notice to Customer as provided in the general Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Do-Not-Call Compliance</h2>
            <p className="text-slate-600 mb-4">
              RealElite provides built-in Do-Not-Call (DNC) list management tools. However, Customer is solely
              responsible for compliance with all applicable DNC regulations, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>The National Do-Not-Call Registry maintained by the FTC</li>
              <li>State-specific Do-Not-Call registries and regulations</li>
              <li>Maintaining an internal DNC list and honoring all opt-out requests within the required timeframe</li>
              <li>The Telephone Consumer Protection Act (TCPA) and its implementing regulations</li>
              <li>FCC rules regarding unsolicited calls and text messages</li>
            </ul>
            <p className="text-slate-600 mb-4">
              RealElite is not liable for any violations of DNC regulations arising from Customer's use of the Telecom Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Usage Limits & Anti-Spam Protections</h2>
            <p className="text-slate-600 mb-4">
              To prevent spam, robocalling, and service abuse, the following limits apply:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Short Call Limit:</strong> On average, users shall not make more than 60 outgoing calls (completed or not) per user per day of less than 15 seconds duration. If this threshold is reached three or more times in a month, RealElite reserves the right to suspend or terminate the Service.</li>
              <li><strong>SMS Limits:</strong> SMS messaging is limited to 2,000 messages per month per account unless a higher limit is included in Customer's plan. SMS messages are limited to 160 characters (standard) or 70 characters (Unicode).</li>
              <li><strong>Reasonable Use:</strong> Usage of unlimited call packages is considered reasonable when the average rate of use does not exceed five times the average observed across all customers on comparable plans during the preceding six months.</li>
              <li><strong>Single-User Accounts:</strong> Each user account is for individual use only. Sharing accounts, using the service as a call center switch, or connecting automated dialing hardware is prohibited.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">11. AI-Powered Features Disclaimer</h2>
            <p className="text-slate-600 mb-4">
              RealElite's Telecom Services may include AI-powered features such as:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Real-time call transcription and analysis</li>
              <li>AI call coaching and suggested responses</li>
              <li>Automated call disposition and follow-up scheduling</li>
              <li>AI voice agents for lead qualification</li>
              <li>Sentiment analysis and emotional state detection</li>
            </ul>
            <p className="text-slate-600 mb-4">
              These AI features are provided for informational and assistance purposes only. AI-generated content,
              suggestions, and analysis may contain errors or inaccuracies. Customer should not rely solely on AI
              outputs for critical business decisions and should exercise independent professional judgment.
              RealElite makes no warranties regarding the accuracy, completeness, or reliability of AI-generated content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Suspension & Termination</h2>
            <p className="text-slate-600 mb-4">
              RealElite may suspend or terminate Customer's access to Telecom Services immediately if:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Customer uses the Services for fraudulent or illegal activities</li>
              <li>Customer's use poses a security risk to the platform or other customers</li>
              <li>Customer fails to pay applicable fees for 15 or more days after notice</li>
              <li>Customer violates anti-spam, DNC, or usage limit provisions</li>
              <li>A third-party service provider required for Telecom Services suspends or terminates RealElite's access</li>
              <li>Required by applicable law or regulatory authority</li>
            </ul>
            <p className="text-slate-600 mb-4">
              RealElite will use reasonable efforts to provide notice of any suspension and work to restore services
              promptly once the triggering condition is resolved.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">13. Warranty Disclaimer</h2>
            <p className="text-slate-600 mb-4 uppercase text-sm">
              THE TELECOM SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." REALELITE DISCLAIMS ALL
              WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. REALELITE DOES NOT WARRANT THAT THE
              TELECOM SERVICES WILL OPERATE WITHOUT INTERRUPTION, BE ERROR-FREE, OR MEET CUSTOMER'S
              REQUIREMENTS. ANY INFORMATION PROVIDED THROUGH THE SERVICES IS FOR INFORMATIONAL
              PURPOSES ONLY AND SHOULD NOT BE CONSTRUED AS PROFESSIONAL ADVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">14. Limitation of Liability</h2>
            <p className="text-slate-600 mb-4 uppercase text-sm">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, REALELITE SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA,
              USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING FROM OR RELATED TO THE TELECOM SERVICES.
              REALELITE'S AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID BY CUSTOMER FOR THE
              TELECOM SERVICES DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">15. Indemnification</h2>
            <p className="text-slate-600 mb-4">
              Customer shall indemnify, defend, and hold harmless RealElite and its officers, directors, employees,
              and agents from and against any claims, liabilities, damages, losses, and expenses arising from:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Customer's use of the Telecom Services in violation of these terms or applicable law</li>
              <li>Customer's failure to obtain required consents for calls, texts, or recordings</li>
              <li>Customer's violation of TCPA, DNC, or other telecommunications regulations</li>
              <li>Any claims by third parties arising from Customer's communications conducted through the Services</li>
              <li>Customer's failure to provide accurate location information for emergency services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">16. Governing Law</h2>
            <p className="text-slate-600 mb-4">
              These Telecom Terms shall be governed by and construed in accordance with the laws of the State of
              Delaware, without regard to conflict of law principles. Any disputes arising under these terms shall be
              resolved through binding arbitration in accordance with applicable rules, or in the federal or state courts
              located in Delaware.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">17. Contact Information</h2>
            <p className="text-slate-600 mb-4">
              For questions about these Telecommunications Terms of Service, please contact us at:
            </p>
            <p className="text-slate-600">
              Email: legal@realelite.io<br />
              Support: support@realelite.io
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
