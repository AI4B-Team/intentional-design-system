import React from 'react';
import { useParams } from 'react-router-dom';
import { usePublicDeal } from '@/hooks/usePublicDeal';
import { Loader2 } from 'lucide-react';
import {
  DealHeader,
  DealHeroGallery,
  DealSummary,
  DealPricingCard,
  DealPropertyDetails,
  DealDescription,
  DealRepairs,
  DealInvestmentAnalysis,
  DealComps,
  DealDocuments,
  DealInterestForm,
  DealFooter,
} from '@/components/public-deal';

export default function PublicDealPage() {
  const { slug } = useParams<{ slug: string }>();
  const { deal, settings, loading, error } = usePublicDeal(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Deal Not Available</h1>
          <p className="text-muted-foreground">
            {error || 'This deal may have been removed or is no longer active.'}
          </p>
        </div>
      </div>
    );
  }

  const isSold = deal.status === 'sold';
  const isUnderContract = deal.status === 'under_contract';

  return (
    <div className={`min-h-screen bg-background ${isSold ? 'opacity-70' : ''}`}>
      {/* Header */}
      <DealHeader 
        settings={settings} 
        status={deal.status}
      />

      {/* Status Banner */}
      {isUnderContract && (
        <div className="bg-amber-500 text-white text-center py-3 font-semibold">
          🔥 UNDER CONTRACT - Backup offers welcome!
        </div>
      )}
      {isSold && (
        <div className="bg-muted text-muted-foreground text-center py-3 font-semibold">
          SOLD
        </div>
      )}

      {/* Hero Gallery */}
      <DealHeroGallery 
        photos={deal.photos} 
        videoUrl={deal.video_url}
        status={deal.status}
        createdAt={deal.created_at}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            <DealSummary deal={deal} />

            {/* Property Details */}
            <DealPropertyDetails deal={deal} />

            {/* Description */}
            {deal.description && (
              <DealDescription description={deal.description} />
            )}

            {/* Repairs */}
            {deal.repair_estimate && (
              <DealRepairs 
                repairEstimate={deal.repair_estimate}
                repairDetails={deal.repair_details}
              />
            )}

            {/* Investment Analysis */}
            <DealInvestmentAnalysis deal={deal} />

            {/* Comps */}
            {deal.comps_data.length > 0 && (
              <DealComps 
                comps={deal.comps_data}
                compsSummary={deal.comps_summary}
              />
            )}

            {/* Documents */}
            <DealDocuments 
              documents={deal.documents}
              requiresVerification={settings?.require_proof_of_funds || false}
            />
          </div>

          {/* Right Column - Pricing Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <DealPricingCard 
                deal={deal}
                settings={settings}
                disabled={isSold}
              />
            </div>
          </div>
        </div>

        {/* Interest Form */}
        {!isSold && (
          <div className="mt-12">
            <DealInterestForm 
              dealId={deal.id}
              userId={deal.user_id}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <DealFooter settings={settings} />

      {/* Mobile Sticky CTA */}
      {!isSold && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background border-t border-border p-4 z-50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-foreground">
                ${deal.asking_price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {deal.equity_percentage ? `${deal.equity_percentage.toFixed(1)}% equity` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              {settings?.company_phone && (
                <a 
                  href={`tel:${settings.company_phone}`}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium"
                >
                  Call
                </a>
              )}
              <a 
                href="#interest-form"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                I'm Interested
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
