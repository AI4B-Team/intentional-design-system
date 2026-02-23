import { Phone } from "lucide-react";

interface CTABannerSectionProps {
  companyPhone?: string | null;
  accentColor: string;
  primaryColor: string;
  onGetOfferClick: () => void;
}

export function CTABannerSection({ companyPhone, accentColor, primaryColor, onGetOfferClick }: CTABannerSectionProps) {
  return (
    <section className="py-16 md:py-20 text-white text-center" style={{ backgroundColor: primaryColor }}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">
          Ready To Sell Your House For Cash?
        </h2>
        <p className="text-white/80 mb-8 max-w-lg mx-auto">
          Get your free, no-obligation cash offer in under 2 minutes. We've helped thousands of homeowners just like you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetOfferClick}
            className="px-8 py-4 rounded-full font-bold text-white text-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accentColor }}
          >
            Get My FREE Cash Offer →
          </button>
          {companyPhone && (
            <a
              href={`tel:${companyPhone}`}
              className="flex items-center gap-2 px-6 py-4 rounded-full border border-white/30 hover:bg-white/10 transition-colors font-medium"
            >
              <Phone className="h-5 w-5" />
              {companyPhone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
