import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getPublicWebsite, trackWebsiteEvent, submitSellerLead } from "@/lib/getPublicWebsite";
import { WebsiteHero } from "@/components/seller-website/WebsiteHero";
import { ValuePropsSection } from "@/components/seller-website/ValuePropsSection";
import { LeadCaptureForm, type FormData } from "@/components/seller-website/LeadCaptureForm";
import { HowItWorksSection } from "@/components/seller-website/HowItWorksSection";
import { TestimonialsSection } from "@/components/seller-website/TestimonialsSection";
import { FAQSection } from "@/components/seller-website/FAQSection";
import { AboutSection } from "@/components/seller-website/AboutSection";
import { WebsiteFooter } from "@/components/seller-website/WebsiteFooter";
import { SEOHead } from "@/components/seller-website/SEOHead";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SellerWebsite = Database["public"]["Tables"]["seller_websites"]["Row"];

interface ValueProp {
  icon: string;
  title: string;
  description: string;
}

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
}

interface FAQ {
  question: string;
  answer: string;
}

interface TeamMember {
  name: string;
  title: string;
  image_url?: string;
  bio?: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

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
        // Track page view
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

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (!website) return;

    setIsSubmitting(true);
    
    // Track form submission
    await trackWebsiteEvent(website.id, 'form_submit', window.location.href);

    const params = new URLSearchParams(window.location.search);
    
    const { error } = await submitSellerLead(website.id, website.user_id, {
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
      sourceUrl: window.location.href,
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      utmContent: params.get('utm_content') || undefined,
    });

    setIsSubmitting(false);

    if (!error) {
      setIsSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-foreground mb-4">Page Not Found</h1>
          <p className="text-muted-foreground">
            The website you're looking for doesn't exist or is not published.
          </p>
        </div>
      </div>
    );
  }

  // Parse JSON fields safely
  const valueProps = (website.value_props as unknown as ValueProp[] | null) || [];
  const processSteps = (website.process_steps as unknown as ProcessStep[] | null) || [];
  const testimonials = (website.testimonials as unknown as Testimonial[] | null) || [];
  const faqs = (website.faqs as unknown as FAQ[] | null) || [];
  const teamMembers = (website.team_members as unknown as TeamMember[] | null) || [];
  const socialLinks = (website.social_links as unknown as SocialLinks | null) || {};
  const formFields = (website.form_fields as unknown as string[] | null) || ["address", "name", "phone", "email"];

  return (
    <div className="min-h-screen" style={{ backgroundColor: website.background_color || '#FFFFFF' }}>
      <SEOHead
        title={website.meta_title}
        description={website.meta_description}
        ogImageUrl={website.og_image_url}
        companyName={website.company_name}
        googleAnalyticsId={website.google_analytics_id}
        facebookPixelId={website.facebook_pixel_id}
        googleTagManagerId={website.google_tag_manager_id}
      />

      {/* Hero Section */}
      <WebsiteHero
        companyName={website.company_name}
        companyPhone={website.company_phone}
        logoUrl={website.logo_url}
        headline={website.hero_headline || "We Buy Houses Fast For Cash"}
        subheadline={website.hero_subheadline || "Get a fair cash offer in 24 hours."}
        heroImageUrl={website.hero_image_url}
        heroVideoUrl={website.hero_video_url}
        primaryColor={website.primary_color || "#2563EB"}
        accentColor={website.accent_color || "#10B981"}
        onGetOfferClick={scrollToForm}
      />

      {/* Value Propositions */}
      <ValuePropsSection
        valueProps={valueProps}
        primaryColor={website.primary_color || "#2563EB"}
      />

      {/* Lead Capture Form Section */}
      <section className="py-16 md:py-24 bg-white" id="get-offer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left side - Benefits */}
            <div className="hidden lg:block">
              <h2 
                className="text-3xl font-bold mb-6"
                style={{ color: website.primary_color || "#2563EB" }}
              >
                Get Your Fair Cash Offer Today
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: website.accent_color || "#10B981" }}
                  >
                    ✓
                  </span>
                  <span className="text-gray-700">No obligation - get your offer with zero commitment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: website.accent_color || "#10B981" }}
                  >
                    ✓
                  </span>
                  <span className="text-gray-700">Fast response - we'll contact you within 24 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: website.accent_color || "#10B981" }}
                  >
                    ✓
                  </span>
                  <span className="text-gray-700">Fair pricing - we use market data to make competitive offers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: website.accent_color || "#10B981" }}
                  >
                    ✓
                  </span>
                  <span className="text-gray-700">Close on your timeline - as fast as 7 days or whenever you're ready</span>
                </li>
              </ul>
            </div>

            {/* Right side - Form */}
            <div ref={formRef}>
              <LeadCaptureForm
                formHeadline={website.form_headline || "Get Your Cash Offer Today"}
                formSubheadline={website.form_subheadline || "Fill out the form below and we'll contact you within 24 hours"}
                formFields={formFields}
                formSubmitText={website.form_submit_text || "Get My Cash Offer"}
                accentColor={website.accent_color || "#10B981"}
                primaryColor={website.primary_color || "#2563EB"}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                isSubmitted={isSubmitted}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorksSection
        processSteps={processSteps}
        primaryColor={website.primary_color || "#2563EB"}
        accentColor={website.accent_color || "#10B981"}
      />

      {/* Testimonials */}
      <TestimonialsSection
        testimonials={testimonials}
        primaryColor={website.primary_color || "#2563EB"}
        accentColor={website.accent_color || "#10B981"}
      />

      {/* About Section */}
      <AboutSection
        headline={website.about_headline || "Why Sell To Us?"}
        content={website.about_content}
        imageUrl={website.about_image_url}
        teamMembers={teamMembers}
        primaryColor={website.primary_color || "#2563EB"}
      />

      {/* FAQ Section */}
      <FAQSection
        faqs={faqs}
        primaryColor={website.primary_color || "#2563EB"}
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
        onGetOfferClick={scrollToForm}
      />

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-40">
        <button
          onClick={scrollToForm}
          className="w-full py-3 rounded-lg font-bold text-white transition-transform active:scale-95"
          style={{ backgroundColor: website.accent_color || "#10B981" }}
        >
          Get Your Cash Offer
        </button>
      </div>
    </div>
  );
}
