import { useState } from "react";
import { Phone, Mail, MapPin, X } from "lucide-react";

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

interface LegalDoc {
  id: string;
  title: string;
  enabled: boolean;
  content: string;
}

interface WebsiteFooterProps {
  companyName: string;
  companyPhone?: string | null;
  companyEmail?: string | null;
  footerText?: string | null;
  socialLinks?: SocialLinks;
  primaryColor: string;
  accentColor: string;
  onGetOfferClick: () => void;
  legalDocs?: LegalDoc[];
}

const DEFAULT_LEGAL_DOCS: LegalDoc[] = [
  {
    id: "privacy",
    title: "Privacy Policy",
    enabled: true,
    content: `Last Updated: January 1, 2026

1. Information We Collect
We collect personal information you voluntarily provide when you use our services, including your name, email address, phone number, and property address. We also automatically collect certain information when you visit our website, including your IP address, browser type, and browsing behavior.

2. How We Use Your Information
We use the information we collect to:
• Provide you with a cash offer for your property
• Communicate with you about our services
• Improve our website and user experience
• Comply with legal obligations
• Send marketing communications (with your consent)

3. Information Sharing
We do not sell your personal information. We may share your information with:
• Service providers who assist in our operations
• Legal authorities when required by law
• Business partners with your explicit consent

4. Data Security
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. Your Rights
You have the right to:
• Access your personal data
• Correct inaccurate data
• Request deletion of your data
• Opt out of marketing communications
• Lodge a complaint with a supervisory authority

6. Cookies
Our website uses cookies to enhance your browsing experience. You can control cookie settings through your browser preferences.

7. Contact Us
If you have questions about this Privacy Policy, please contact us using the information provided on this website.`,
  },
  {
    id: "tos",
    title: "Terms of Service",
    enabled: true,
    content: `Last Updated: January 1, 2026

1. Acceptance of Terms
By accessing and using this website, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.

2. Services Description
We provide a platform for homeowners to receive cash offers for their properties. Our services include property evaluation, offer generation, and transaction facilitation.

3. User Responsibilities
You agree to:
• Provide accurate and truthful information
• Not misrepresent property conditions or ownership
• Comply with all applicable laws and regulations
• Not use our services for any unlawful purpose

4. No Obligation
Submitting your information through our website does not obligate you to sell your property. Any offer we provide is subject to property inspection and verification.

5. Intellectual Property
All content on this website, including text, graphics, logos, and software, is our property and is protected by intellectual property laws.

6. Limitation of Liability
We are not liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid for the specific service giving rise to the claim.

7. Indemnification
You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of our services or violation of these terms.

8. Governing Law
These terms shall be governed by and construed in accordance with the laws of the state in which we operate.

9. Changes to Terms
We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.

10. Contact
For questions about these Terms of Service, please contact us using the information provided on this website.`,
  },
  {
    id: "refund",
    title: "Refund Policy",
    enabled: true,
    content: `Last Updated: January 1, 2026

1. Overview
This Refund Policy outlines the terms under which refunds may be issued for our services.

2. Free Services
Our property evaluation and cash offer services are provided at no cost to homeowners. Since no payment is required to receive an offer, refunds are generally not applicable.

3. Transaction Fees
In the event that any fees are charged during the closing process, these fees will be clearly disclosed prior to closing. Any disputes regarding fees should be raised before the closing date.

4. Cancellation
You may cancel any transaction at any time prior to closing without penalty. We do not charge cancellation fees.

5. Earnest Money
If earnest money is deposited as part of a transaction, the return of earnest money will be governed by the terms of the purchase agreement and applicable state law.

6. Contact Us
If you have questions about this Refund Policy, please contact us using the information provided on this website.`,
  },
  {
    id: "cookie",
    title: "Cookie Policy",
    enabled: true,
    content: `Last Updated: January 1, 2026

1. What Are Cookies
Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.

2. Types of Cookies We Use
• Essential Cookies: Required for the website to function properly
• Analytics Cookies: Help us understand how visitors interact with our website
• Marketing Cookies: Used to deliver relevant advertisements
• Preference Cookies: Remember your settings and preferences

3. Third-Party Cookies
We may use third-party services such as Google Analytics that set their own cookies. These cookies are governed by the respective third party's privacy policy.

4. Managing Cookies
You can control and delete cookies through your browser settings. Please note that disabling cookies may affect the functionality of our website.

5. Cookie Consent
By continuing to use our website, you consent to the use of cookies as described in this policy.

6. Changes to This Policy
We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.

7. Contact Us
If you have questions about our use of cookies, please contact us using the information provided on this website.`,
  },
];

function LegalModal({
  doc,
  companyName,
  onClose,
}: {
  doc: LegalDoc;
  companyName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{doc.title}</h2>
            <p className="text-sm text-gray-500">{companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="prose prose-sm prose-gray max-w-none whitespace-pre-line text-gray-600 leading-relaxed">
            {doc.content}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WebsiteFooter({
  companyName,
  companyPhone,
  companyEmail,
  footerText,
  primaryColor,
  accentColor,
  onGetOfferClick,
  legalDocs,
}: WebsiteFooterProps) {
  const [openDoc, setOpenDoc] = useState<LegalDoc | null>(null);

  const docs = (legalDocs && legalDocs.length > 0 ? legalDocs : DEFAULT_LEGAL_DOCS).filter(
    (d) => d.enabled && d.content
  );

  return (
    <>
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {companyName.charAt(0)}
                </div>
                <span className="font-bold text-gray-900">{companyName}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                We help homeowners sell their properties quickly and fairly. No fees, no repairs, no hassle.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><button onClick={onGetOfferClick} className="hover:text-gray-700 transition-colors">About Us</button></li>
                <li><button onClick={onGetOfferClick} className="hover:text-gray-700 transition-colors">How It Works</button></li>
                <li><button onClick={onGetOfferClick} className="hover:text-gray-700 transition-colors">Testimonials</button></li>
                <li><button onClick={onGetOfferClick} className="hover:text-gray-700 transition-colors">Blog</button></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {docs.map((doc) => (
                  <li key={doc.id}>
                    <button
                      onClick={() => setOpenDoc(doc)}
                      className="hover:text-gray-700 transition-colors"
                    >
                      {doc.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                {companyPhone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${companyPhone}`} className="hover:text-gray-700">{companyPhone}</a>
                  </li>
                )}
                {companyEmail && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${companyEmail}`} className="hover:text-gray-700">{companyEmail}</a>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>United States</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100">
          <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
            <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
              {docs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setOpenDoc(doc)}
                  className="hover:text-gray-600 transition-colors"
                >
                  {doc.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {openDoc && (
        <LegalModal doc={openDoc} companyName={companyName} onClose={() => setOpenDoc(null)} />
      )}
    </>
  );
}
