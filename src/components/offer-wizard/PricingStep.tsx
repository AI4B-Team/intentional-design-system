import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { OfferInsightCard } from "@/components/ai/OfferInsightCard";
import { BuyerIntelligenceCard } from "@/components/ai/BuyerIntelligenceCard";
import { SubjectPropertySummaryCard } from "@/components/offer-wizard/SubjectPropertySummaryCard";
import { cn } from "@/lib/utils";
import { formatCurrency, PRESET_PERCENTAGES } from "@/components/offer-wizard/offer-campaign-constants";
import type { OfferWizardStepProps } from "@/components/offer-wizard/offer-campaign-constants";

export function PricingStep(props: OfferWizardStepProps) {
  const { deal, arv, offerAmount, effectivePercentage, offerPercentage, setOfferPercentage, customOfferAmount, setCustomOfferAmount, flipperProfit, wholesalerProfit, buyerMaxOffer, propertyImages, pricingInsight } = props;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Offer Settings</h3>
        <p className="text-sm text-muted-foreground">
          Define your offer amount based on ARV
        </p>
      </div>

      <OfferInsightCard
        insight={pricingInsight.insight}
        isLoading={pricingInsight.isLoading}
        error={pricingInsight.error}
        onRefresh={pricingInsight.refetch}
      />

      <SubjectPropertySummaryCard
        imageUrl={propertyImages[0]}
        address={deal.address}
        locationLine={`${deal.city}, ${deal.state} ${deal.zip}`}
        askingPrice={deal.price}
        arv={arv}
        offerAmount={offerAmount}
      />

      <BuyerIntelligenceCard
        data={pricingInsight.buyerIntelligence}
        arv={arv}
        offerAmount={offerAmount}
      />

      {/* Preset Buttons */}
      <div className="flex gap-2 flex-wrap">
        {PRESET_PERCENTAGES.map((pct) => (
          <Button
            key={pct}
            variant={customOfferAmount === null && offerPercentage === pct ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setOfferPercentage(pct);
              setCustomOfferAmount(null);
            }}
          >
            {pct}%
          </Button>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">Custom:</span>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-sm font-semibold text-foreground">
              $
            </span>
            <Input
              type="text"
              inputMode="numeric"
              value={(customOfferAmount ?? offerAmount).toLocaleString()}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, '');
                const val = Math.max(0, Number(rawValue) || 0);
                setCustomOfferAmount(val);
              }}
              className="relative z-0 w-36 h-9 pl-7 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Offer Percentage</Label>
          <span className="text-lg font-semibold text-primary">{effectivePercentage}%</span>
        </div>
        <Slider
          value={[effectivePercentage]}
          onValueChange={([val]) => {
            setOfferPercentage(val);
            setCustomOfferAmount(null);
          }}
          min={50}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Calculations Display */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">After Repaired Value (ARV)</p>
          <p className="text-xl font-semibold text-success">{formatCurrency(arv)}</p>
        </Card>
        <Card className="p-4 text-center bg-primary/5 border-primary">
          <p className="text-sm text-muted-foreground mb-1">Your Offer</p>
          <p className="text-2xl font-bold">${offerAmount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">({effectivePercentage}% of ARV)</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Flipper Profit</p>
          <p className={cn("text-xl font-semibold", flipperProfit > 0 ? "text-success" : "text-destructive")}>
            {formatCurrency(flipperProfit)}
          </p>
        </Card>
      </div>

      {/* Wholesaler Calculation */}
      <Card className="p-4 mt-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-1">Wholesaler Opportunity</p>
            <p className="text-xs text-muted-foreground">
              Sell to end buyer at {formatCurrency(buyerMaxOffer)} (70% ARV)
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Assignment Fee</p>
            <p className={cn("text-xl font-bold", wholesalerProfit > 0 ? "text-success" : "text-destructive")}>
              {formatCurrency(wholesalerProfit)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
