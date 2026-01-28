import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

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
}

export function WebsiteHero({
  companyName,
  companyPhone,
  logoUrl,
  headline,
  subheadline,
  heroImageUrl,
  heroVideoUrl,
  primaryColor,
  accentColor,
  onGetOfferClick,
}: WebsiteHeroProps) {
  const backgroundStyle = heroImageUrl
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
      };

  return (
    <section className="relative min-h-[80vh] flex flex-col" style={backgroundStyle}>
      {/* Video Background */}
      {heroVideoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideoUrl} type="video/mp4" />
        </video>
      )}
      {heroVideoUrl && <div className="absolute inset-0 bg-black/60" />}

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="h-10 md:h-12 object-contain" />
          ) : (
            <span className="text-white text-xl md:text-2xl font-bold">{companyName}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {companyPhone && (
            <a
              href={`tel:${companyPhone}`}
              className="hidden md:flex items-center gap-2 text-white hover:text-white/80 transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span className="font-semibold">{companyPhone}</span>
            </a>
          )}
          <Button
            onClick={onGetOfferClick}
            className="font-semibold"
            style={{ backgroundColor: accentColor }}
          >
            Get Offer
          </Button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-12 md:py-20">
        <h1 
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl"
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
        >
          {headline}
        </h1>
        <p 
          className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
        >
          {subheadline}
        </p>
        <Button
          size="lg"
          onClick={onGetOfferClick}
          className="text-lg px-8 py-6 font-bold shadow-lg hover:scale-105 transition-transform"
          style={{ backgroundColor: accentColor }}
        >
          Get Your Cash Offer Now
        </Button>
        
        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-10 text-white/80">
          <span className="flex items-center gap-2 text-sm md:text-base">
            ✓ No Fees
          </span>
          <span className="flex items-center gap-2 text-sm md:text-base">
            ✓ Close Fast
          </span>
          <span className="flex items-center gap-2 text-sm md:text-base">
            ✓ Any Condition
          </span>
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
