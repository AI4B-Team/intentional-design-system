import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getPublicWebsite, trackWebsiteEvent } from "@/lib/getPublicWebsite";
import { useLeadSubmit } from "@/hooks/useLeadSubmit";
import { WebsiteHero } from "@/components/seller-website/WebsiteHero";
import { StatsSection } from "@/components/seller-website/StatsSection";
import { HowItWorksSection } from "@/components/seller-website/HowItWorksSection";
import { ComparisonSection } from "@/components/seller-website/ComparisonSection";
import { TestimonialsSection } from "@/components/seller-website/TestimonialsSection";
import { SituationsSection } from "@/components/seller-website/SituationsSection";
import { FAQSection } from "@/components/seller-website/FAQSection";
import { CTABannerSection } from "@/components/seller-website/CTABannerSection";
import { WebsiteFooter } from "@/components/seller-website/WebsiteFooter";
import { SEOHead } from "@/components/seller-website/SEOHead";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SellerWebsite = Database["public"]["Tables"]["seller_websites"]["Row"];

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  location?: string;
  quote: string;
  image_url?: string;
  rating?: number;
  sale_price?: string;
  situation?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export default function SellerWebsitePage() {
  const { slug } = useParams<{ slug: string }>();
  const [website, setWebsite] = useState<SellerWebsite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [companyPhone, setCompanyPhone] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const { submitLead, submitting, success, error: submitError } = useLeadSubmit();

  useEffect(() => {
    async function loadWebsite() {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }

      const data = await getPublicWebsite(slug);
      if (!data) {
        setError(true);
      } else {
        setWebsite(data);
        setCompanyPhone(data.company_phone);
        trackWebsiteEvent(data.id, 'page_view', window.location.href, {
          referrer: document.referrer,
          utmSource: new URLSearchParams(window.location.search).get('utm_source') || undefined,
          utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
          utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
        });
      }
      setLoading(false);
    }

    loadWebsite();
  }, [slug]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (formData: any) => {
    if (!website) return;

    try {
      const result = await submitLead(website.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        propertyAddress: formData.propertyAddress,
        propertyCity: formData.propertyCity,
        propertyState: formData.propertyState,
        propertyZip: formData.propertyZip,
        propertyCondition: formData.propertyCondition,
        sellTimeline: formData.sellTimeline,
        reasonSelling: formData.reasonSelling,
        notes: formData.notes,
      });
      
      if (result?.companyPhone) {
        setCompanyPhone(result.companyPhone);
      }
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-500">
            The website you're looking for doesn't exist or is not published.
          </p>
        </div>
      </div>
    );
  }

  const processSteps = (website.process_steps as unknown as ProcessStep[] | null) || [];
  const testimonials = (website.testimonials as unknown as Testimonial[] | null) || [];
  const faqs = (website.faqs as unknown as FAQ[] | null) || [];
  const socialLinks = (website.social_links as unknown as SocialLinks | null) || {};
  const formFields = (website.form_fields as unknown as string[] | null) || ["address", "name", "phone", "email"];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={website.meta_title}
        description={website.meta_description}
        ogImageUrl={website.og_image_url}
        companyName={website.company_name}
        googleAnalyticsId={website.google_analytics_id}
        facebookPixelId={website.facebook_pixel_id}
        googleTagManagerId={website.google_tag_manager_id}
      />

      {/* Hero with Inline Form */}
      <div ref={formRef}>
        <WebsiteHero
          companyName={website.company_name}
          companyPhone={website.company_phone}
          logoUrl={website.logo_url}
          headline={website.hero_headline || "Sell Your Home Fast, Fair & Simple"}
          subheadline={website.hero_subheadline || "Get a free cash offer on your house regardless of location, condition, size, price & equity."}
          heroImageUrl={website.hero_image_url}
          heroVideoUrl={website.hero_video_url}
          primaryColor={website.primary_color || "#2563EB"}
          accentColor={website.accent_color || "#10B981"}
          onGetOfferClick={scrollToTop}
          formHeadline={website.form_headline || "Get Your Free Cash Offer"}
          formSubheadline={website.form_subheadline || "No Obligation. No Pressure. Takes 7 Minutes."}
          formFields={formFields}
          formSubmitText={website.form_submit_text || "Get My Cash Offer →"}
          onFormSubmit={handleFormSubmit}
          isFormSubmitting={submitting}
          isFormSubmitted={success}
        />
      </div>

      {/* Stats */}
      <StatsSection primaryColor={website.primary_color || "#2563EB"} />

      {/* How It Works */}
      <HowItWorksSection
        processSteps={processSteps}
        primaryColor={website.primary_color || "#2563EB"}
        accentColor={website.accent_color || "#10B981"}
      />

      {/* Comparison Table */}
      <ComparisonSection
        companyName={website.company_name}
        primaryColor={website.primary_color || "#2563EB"}
        accentColor={website.accent_color || "#10B981"}
      />

      {/* Testimonials */}
      <TestimonialsSection
        testimonials={testimonials}
        primaryColor={website.primary_color || "#2563EB"}
        accentColor={website.accent_color || "#10B981"}
      />

      {/* Situations */}
      <SituationsSection primaryColor={website.primary_color || "#2563EB"} />

      {/* FAQ */}
      <FAQSection
        faqs={faqs}
        primaryColor={website.primary_color || "#2563EB"}
      />

      {/* CTA Banner */}
      <CTABannerSection
        companyPhone={website.company_phone}
        primaryColor={website.primary_color || "#2563EB"}
        accentColor={website.accent_color || "#10B981"}
        onGetOfferClick={scrollToTop}
      />

      {/* Footer */}
      <WebsiteFooter
        companyName={website.company_name}
        companyPhone={website.company_phone}
        companyEmail={website.company_email}
        footerText={website.footer_text}
        socialLinks={socialLinks}
        primaryColor={website.primary_color || "#2563EB"}
        accentColor={website.accent_color || "#10B981"}
        onGetOfferClick={scrollToTop}
      />

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-40">
        <button
          onClick={scrollToTop}
          className="w-full py-3 rounded-lg font-bold text-white transition-colors"
          style={{ backgroundColor: website.accent_color || "#10B981" }}
        >
          Get Your Cash Offer
        </button>
      </div>
    </div>
  );
}
