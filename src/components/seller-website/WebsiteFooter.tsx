import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

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
  socialLinks,
  primaryColor,
  accentColor,
  onGetOfferClick,
}: WebsiteFooterProps) {
  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
  };

  const hasSocialLinks = socialLinks && Object.values(socialLinks).some(Boolean);

  return (
    <footer 
      className="py-12 text-white"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{companyName}</h3>
            {companyPhone && (
              <p className="mb-2">
                <a href={`tel:${companyPhone}`} className="hover:underline">
                  📞 {companyPhone}
                </a>
              </p>
            )}
            {companyEmail && (
              <p className="mb-2">
                <a href={`mailto:${companyEmail}`} className="hover:underline">
                  ✉️ {companyEmail}
                </a>
              </p>
            )}
          </div>

          {/* Quick CTA */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Ready to Sell?</h3>
            <button
              onClick={onGetOfferClick}
              className="px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              Get Your Cash Offer
            </button>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-right">
            {hasSocialLinks && (
              <>
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex justify-center md:justify-end gap-4">
                  {Object.entries(socialLinks || {}).map(([platform, url]) => {
                    if (!url) return null;
                    const Icon = socialIcons[platform as keyof typeof socialIcons];
                    if (!Icon) return null;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Text & Copyright */}
        <div className="border-t border-white/20 pt-6 text-center text-sm text-white/70">
          {footerText && <p className="mb-2">{footerText}</p>}
          <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
