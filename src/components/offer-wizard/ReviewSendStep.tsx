import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Send, Home, Package, CheckCircle2 } from "lucide-react";
import { OfferInsightCard } from "@/components/ai/OfferInsightCard";
import { SubjectPropertySummaryCard } from "@/components/offer-wizard/SubjectPropertySummaryCard";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/components/offer-wizard/offer-campaign-constants";
import type { OfferWizardStepProps } from "@/components/offer-wizard/offer-campaign-constants";

export function ReviewSendStep(props: OfferWizardStepProps) {
  const { dealSetupData, deal, arv, offerAmount, effectivePercentage, selectedTemplateData, emailEnabled, smsEnabled, scheduleType, scheduledDate, scheduledTime, autoFollowUp, followUpDays, propertyImages, reviewInsight } = props;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Review & Send</h3>
        <p className="text-sm text-muted-foreground">
          Confirm all details before sending your offer
        </p>
      </div>

      <OfferInsightCard
        insight={reviewInsight.insight}
        isLoading={reviewInsight.isLoading}
        error={reviewInsight.error}
        onRefresh={reviewInsight.refetch}
      />

      <SubjectPropertySummaryCard
        imageUrl={propertyImages[0]}
        address={deal.address}
        locationLine={`${deal.city}, ${deal.state} ${deal.zip}`}
        askingPrice={deal.price}
        arv={arv}
        offerAmount={offerAmount}
      />

      {/* Summary Cards */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Offer Configuration
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Offer Type</p>
            <p className="font-medium">{selectedTemplateData?.name || "Cash Offer"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Offer Amount</p>
            <p className="font-medium text-lg">{formatCurrency(offerAmount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Offer Percentage</p>
            <p className="font-medium">{effectivePercentage}% of ARV</p>
          </div>
          <div>
            <p className="text-muted-foreground">POF</p>
            <p className="font-medium flex items-center gap-1">
              {dealSetupData.includePof && dealSetupData.selectedPofId ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Attached
                </>
              ) : (
                "Not Required"
              )}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Send className="h-4 w-4" />
          Delivery Settings
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Methods</p>
            <div className="flex items-center gap-2 mt-1">
              {emailEnabled && (
                <Badge variant="secondary" className="text-xs">
                  <Mail className="h-3 w-3 mr-1" /> Email
                </Badge>
              )}
              {smsEnabled && (
                <Badge variant="secondary" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" /> SMS
                </Badge>
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Schedule</p>
            <p className="font-medium capitalize">
              {scheduleType === "immediate"
                ? "Send Immediately"
                : scheduleType === "drip"
                ? "Drip Campaign"
                : scheduleType === "scheduled"
                ? `${scheduledDate} at ${scheduledTime}`
                : "Save As Draft"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Auto Follow-Up</p>
            <p className="font-medium">
              {autoFollowUp ? `After ${followUpDays} days` : "Disabled"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Inbox Sync</p>
            <p className="font-medium flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Enabled
            </p>
          </div>
        </div>
      </Card>

      {/* Property Card */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Home className="h-4 w-4" />
          Subject Property
        </h4>
        <div className="flex gap-4">
          <div className="w-20 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
            {deal.images?.[0] ? (
              <img
                src={deal.images[0]}
                alt={deal.address}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{deal.address}</p>
            <p className="text-sm text-muted-foreground">
              {deal.city}, {deal.state} {deal.zip}
            </p>
            <div className="flex items-center gap-4 mt-1 text-sm">
              <span>Asking: {formatCurrency(deal.price)}</span>
              <span className="text-success">ARV: {formatCurrency(arv)}</span>
              <span className="text-primary font-medium">
                Offer: {formatCurrency(offerAmount)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
