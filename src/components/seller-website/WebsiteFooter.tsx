import { Phone, Mail, MapPin } from "lucide-react";

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
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
}

export function WebsiteFooter({
  companyName,
  companyPhone,
  companyEmail,
  footerText,
  primaryColor,
  accentColor,
  onGetOfferClick,
}: WebsiteFooterProps) {
  return (
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

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><button onClick={onGetOfferClick} className="hover:text-gray-700 transition-colors">FAQ</button></li>
              <li><button onClick={onGetOfferClick} className="hover:text-gray-700 transition-colors">Cost Guides</button></li>
              <li><button onClick={onGetOfferClick} className="hover:text-gray-700 transition-colors">Browse Properties</button></li>
              <li><button onClick={onGetOfferClick} className="hover:text-gray-700 transition-colors">Home Services</button></li>
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
            <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-600 cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
