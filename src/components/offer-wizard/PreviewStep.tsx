import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { OfferInsightCard } from "@/components/ai/OfferInsightCard";
import { SubjectPropertySummaryCard } from "@/components/offer-wizard/SubjectPropertySummaryCard";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/components/offer-wizard/offer-campaign-constants";
import type { OfferWizardStepProps } from "@/components/offer-wizard/offer-campaign-constants";

export function PreviewStep(props: OfferWizardStepProps) {
  const { deal, arv, offerAmount, emailEnabled, smsEnabled, previewTab, setPreviewTab, emailSubject, emailBody, smsBody, propertyImages, previewInsight } = props;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Preview Delivery</h3>
        <p className="text-sm text-muted-foreground">
          Review exactly what recipients will receive
        </p>
      </div>

      <OfferInsightCard
        insight={previewInsight.insight}
        isLoading={previewInsight.isLoading}
        error={previewInsight.error}
        onRefresh={previewInsight.refetch}
      />

      {/* Subject Property Summary */}
      <SubjectPropertySummaryCard
        imageUrl={propertyImages[0]}
        address={deal.address}
        locationLine={`${deal.city}, ${deal.state} ${deal.zip}`}
        askingPrice={deal.price}
        arv={arv}
        offerAmount={offerAmount}
      />

      <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as any)}>
        <div className="flex gap-2">
          <Button
            variant={previewTab === "email" ? "default" : "outline"}
            size="sm"
            disabled={!emailEnabled}
            onClick={() => setPreviewTab("email")}
          >
            <Mail className="h-4 w-4 mr-2" /> Email Preview
          </Button>
          <Button
            variant={previewTab === "sms" ? "default" : "outline"}
            size="sm"
            disabled={!smsEnabled}
            onClick={() => setPreviewTab("sms")}
          >
            <MessageSquare className="h-4 w-4 mr-2" /> Text Preview
          </Button>
        </div>

        <TabsContent value="email" className="mt-4">
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Subject:</span>
                <span>{emailSubject}</span>
              </div>
            </div>

            <div className="px-4 py-2 bg-primary/5 border-b flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Offer:</span>{" "}
                <span className="font-semibold">{formatCurrency(offerAmount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">EMD:</span>{" "}
                <span className="font-semibold">$5,000</span>
              </div>
              <div>
                <span className="text-muted-foreground">Due Diligence:</span>{" "}
                <span className="font-semibold">3 Days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Close:</span>{" "}
                <span className="font-semibold">14-21 Days</span>
              </div>
            </div>

            <div className="p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {emailBody}
              </pre>
            </div>

            <div className="px-4 py-3 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Merge fields:{" "}
                <code className="bg-muted px-1 rounded">{"{property_address}"}</code>,{" "}
                <code className="bg-muted px-1 rounded">{"{offer_amount}"}</code>
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="mt-4">
          <Card className="overflow-hidden max-w-md mx-auto">
            <div className="p-4 bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">SMS Preview</span>
              </div>
            </div>

            <div className="p-4">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-bl-sm p-3 max-w-[85%]">
                <p className="text-sm">{smsBody}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {smsBody.length} characters ({Math.ceil(smsBody.length / 160)} message
                {Math.ceil(smsBody.length / 160) > 1 ? "s" : ""})
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
