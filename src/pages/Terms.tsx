import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">RealVest</span>
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-8">Last updated: January 28, 2025</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 mb-4">
              By accessing or using RealVest ("the Service"), you agree to be bound by these Terms of Service 
              ("Terms"). If you do not agree to these Terms, you may not access or use the Service. These Terms 
              apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 mb-4">
              RealVest provides a real estate investment management platform that includes property analysis tools, 
              buyer network management, deal tracking, and related services. The Service is designed for real estate 
              professionals and investors to manage their investment activities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">3. User Accounts</h2>
            <p className="text-slate-600 mb-4">
              To access certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and accept all risks of unauthorized access</li>
              <li>Immediately notify us if you discover or suspect any security breaches</li>
              <li>Take responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Acceptable Use</h2>
            <p className="text-slate-600 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Collect or harvest any information from the Service without authorization</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Use the Service to send spam or unsolicited communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Intellectual Property</h2>
            <p className="text-slate-600 mb-4">
              The Service and its original content, features, and functionality are owned by RealVest and are 
              protected by international copyright, trademark, patent, trade secret, and other intellectual 
              property laws. You may not copy, modify, distribute, sell, or lease any part of our Service without 
              our prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">6. User Content</h2>
            <p className="text-slate-600 mb-4">
              You retain ownership of any content you submit to the Service. By submitting content, you grant us 
              a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, 
              publish, transmit, display, and distribute such content in connection with providing the Service. 
              You represent that you have all necessary rights to grant this license.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Third-Party Services</h2>
            <p className="text-slate-600 mb-4">
              The Service may contain links to third-party websites or services that are not owned or controlled 
              by us. We have no control over, and assume no responsibility for, the content, privacy policies, or 
              practices of any third-party websites or services. You acknowledge and agree that we shall not be 
              liable for any damage or loss caused by your use of any such third-party services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-slate-600 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
              OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
              PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE. We do not warrant that the Service 
              will function uninterrupted, secure, or available at any particular time or location, or that any 
              defects will be corrected.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-slate-600 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL REALVEST, ITS DIRECTORS, EMPLOYEES, 
              PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, 
              GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO 
              ACCESS OR USE THE SERVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Indemnification</h2>
            <p className="text-slate-600 mb-4">
              You agree to defend, indemnify, and hold harmless RealVest and its officers, directors, employees, 
              and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, 
              expenses, or fees arising out of or relating to your violation of these Terms or your use of the 
              Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Termination</h2>
            <p className="text-slate-600 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice 
              or liability, for any reason, including without limitation if you breach these Terms. Upon termination, 
              your right to use the Service will immediately cease. All provisions of the Terms which by their 
              nature should survive termination shall survive.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Governing Law</h2>
            <p className="text-slate-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in 
              which RealVest is established, without regard to its conflict of law provisions. Any disputes arising 
              under these Terms shall be resolved through binding arbitration in accordance with applicable 
              arbitration rules.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">13. Changes to Terms</h2>
            <p className="text-slate-600 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we 
              will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a 
              material change will be determined at our sole discretion. By continuing to access or use our 
              Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">14. Contact Us</h2>
            <p className="text-slate-600 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-slate-600">
              Email: legal@realvest.io<br />
              Address: [Your Business Address]
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} RealVest. All rights reserved.
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
