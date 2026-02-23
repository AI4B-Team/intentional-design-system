import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { LeadCaptureForm, type FormData } from "./LeadCaptureForm";

interface WebsiteHeroProps {
  companyName: string;
  companyPhone?: string | null;
  logoUrl?: string | null;
  headline: string;
  subheadline: string;
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
  primaryColor: string;
  accentColor: string;
  onGetOfferClick: () => void;
  // Inline form props
  formHeadline?: string;
  formSubheadline?: string;
  formFields?: string[];
  formSubmitText?: string;
  onFormSubmit?: (data: FormData) => Promise<void>;
  isFormSubmitting?: boolean;
  isFormSubmitted?: boolean;
}

export function WebsiteHero({
  companyName,
  companyPhone,
  logoUrl,
  headline,
  subheadline,
  primaryColor,
  accentColor,
  onGetOfferClick,
  formHeadline,
  formSubheadline,
  formFields,
  formSubmitText,
  onFormSubmit,
  isFormSubmitting,
  isFormSubmitted,
}: WebsiteHeroProps) {
  const hasInlineForm = !!onFormSubmit;

  return (
    <section className="bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="h-10 md:h-12 object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {companyName.charAt(0)}
              </div>
              <span className="text-lg font-bold text-gray-900">{companyName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {companyPhone && (
            <a
              href={`tel:${companyPhone}`}
              className="hidden md:flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="font-medium text-sm">{companyPhone}</span>
            </a>
          )}
          <Button
            onClick={onGetOfferClick}
            className="font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            Get Offer
          </Button>
        </div>
      </nav>

      {/* Hero Content - Split Layout */}
      <div className="px-6 md:px-12 lg:px-16 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: Headlines & Trust */}
          <div className="pt-4">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 mb-6">
              <span className="text-sm" style={{ color: accentColor }}>✦</span>
              <span className="text-sm text-gray-600 font-medium">Rated 4.9★ By 2,400+ Homeowners</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 leading-tight">
              {headline.split(/(?=Fast|Fair|Simple|Cash)/i).map((part, i) => {
                const isAccent = /^(Fast|Fair|Simple|Cash)/i.test(part.trim());
                if (i === 0) return <span key={i}>{part}</span>;
                return (
                  <span key={i} style={{ color: isAccent ? accentColor : undefined }}>
                    {part}
                  </span>
                );
              })}
            </h1>

            <p className="text-lg text-gray-600 mt-4 mb-4 max-w-lg">
              {subheadline}
            </p>

            {/* Bold Benefits */}
            <p className="font-bold text-gray-900 mb-1">
              NO Commissions! NO Repairs! NO Listing Fees! NO Hassles!
            </p>
            <p className="text-gray-500 mb-8">
              Simply our cash for your house in 3 days.
            </p>

            {/* Quick Stats */}
            <div className="flex items-start gap-8 mb-8">
              <div>
                <div className="text-2xl font-bold" style={{ color: accentColor }}>$0</div>
                <div className="text-xs text-gray-500">Fees & Commissions</div>
              </div>
              <div className="border-l border-gray-200 pl-8">
                <div className="text-2xl font-bold" style={{ color: accentColor }}>3 Days</div>
                <div className="text-xs text-gray-500">Fastest Closing</div>
              </div>
              <div className="border-l border-gray-200 pl-8">
                <div className="text-2xl font-bold" style={{ color: accentColor }}>24hr</div>
                <div className="text-xs text-gray-500">Offer Turnaround</div>
              </div>
            </div>

            {/* As Seen On */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">As Seen On</p>
              <div className="flex items-center gap-6 opacity-40">
                <span className="text-lg font-bold text-gray-800">HGTV</span>
                <span className="text-lg font-bold text-gray-800">A&E</span>
                <span className="text-lg font-bold text-gray-800">DIY</span>
                <span className="text-sm font-semibold text-gray-800">Tampa Bay Times</span>
              </div>
            </div>
          </div>

          {/* Right: Lead Capture Form */}
          {hasInlineForm && (
            <div>
              <LeadCaptureForm
                formHeadline={formHeadline || "Get Your Free Cash Offer"}
                formSubheadline={formSubheadline || "No Obligation. No Pressure. Takes 7 Minutes."}
                formFields={formFields || ["address", "name", "phone", "email"]}
                formSubmitText={formSubmitText || "Get My Cash Offer →"}
                accentColor={accentColor}
                primaryColor={primaryColor}
                onSubmit={onFormSubmit}
                isSubmitting={isFormSubmitting}
                isSubmitted={isFormSubmitted}
              />
            </div>
          )}

          {/* Fallback CTA if no inline form */}
          {!hasInlineForm && (
            <div className="flex items-center justify-center">
              <Button
                size="lg"
                onClick={onGetOfferClick}
                className="text-lg px-8 py-6 font-bold text-white shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: accentColor }}
              >
                Get Your Cash Offer Now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Phone Button */}
      {companyPhone && (
        <a
          href={`tel:${companyPhone}`}
          className="md:hidden fixed bottom-20 right-4 z-50 bg-white rounded-full p-4 shadow-lg"
          style={{ color: primaryColor }}
        >
          <Phone className="h-6 w-6" />
        </a>
      )}
    </section>
  );
}
