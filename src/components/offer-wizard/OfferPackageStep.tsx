import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageSquare, FileText, Check, Plus, Package } from "lucide-react";
import { OfferInsightCard } from "@/components/ai/OfferInsightCard";
import { OfferTemplateManager } from "@/components/offer-wizard/OfferTemplateManager";
import { SubjectPropertySummaryCard } from "@/components/offer-wizard/SubjectPropertySummaryCard";
import { cn } from "@/lib/utils";
import { OFFER_TEMPLATES } from "@/components/offer-wizard/offer-campaign-constants";
import type { OfferWizardStepProps } from "@/components/offer-wizard/offer-campaign-constants";

export function OfferPackageStep(props: OfferWizardStepProps) {
  const { deal, arv, offerAmount, offerPercentage, setOfferPercentage, setEstRepairsInput, setHoldingCostsInput, selectedTemplate, setSelectedTemplate, templateTab, setTemplateTab, templates, saveTemplate, deleteTemplate, setDefault, currentTemplateConfig, emailEnabled, setEmailEnabled, smsEnabled, setSmsEnabled, propertyImages, packageInsight } = props;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Select Offer Option</h3>
        <p className="text-sm text-muted-foreground">
          Choose how your offer will be structured
        </p>
      </div>

      <OfferTemplateManager
        currentConfig={currentTemplateConfig}
        savedTemplates={templates}
        onLoadTemplate={(tpl) => {
          setOfferPercentage(tpl.config.offerPercentage);
          setSelectedTemplate(tpl.config.selectedTemplate);
          setEmailEnabled(tpl.config.emailEnabled);
          setSmsEnabled(tpl.config.smsEnabled);
          setEstRepairsInput(tpl.config.estRepairs);
          setHoldingCostsInput(tpl.config.holdingCosts);
        }}
        onSaveTemplate={saveTemplate}
        onDeleteTemplate={deleteTemplate}
        onSetDefault={setDefault}
      />

      <OfferInsightCard
        insight={packageInsight.insight}
        isLoading={packageInsight.isLoading}
        error={packageInsight.error}
        onRefresh={packageInsight.refetch}
      />

      <SubjectPropertySummaryCard
        imageUrl={propertyImages[0]}
        address={deal.address}
        locationLine={`${deal.city}, ${deal.state} ${deal.zip}`}
        askingPrice={deal.price}
        arv={arv}
        offerAmount={offerAmount}
      />

      <Tabs value={templateTab} onValueChange={(v) => setTemplateTab(v as any)}>
        <div className="flex gap-2 max-w-xs">
          <Button
            variant={templateTab === "templates" ? "default" : "outline"}
            onClick={() => setTemplateTab("templates")}
            className="flex-1"
          >
            Templates
          </Button>
          <Button
            variant={templateTab === "custom" ? "default" : "outline"}
            onClick={() => setTemplateTab("custom")}
            className="flex-1"
          >
            Custom
          </Button>
        </div>

        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-3">
            {OFFER_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm",
                  selectedTemplate === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      selectedTemplate === template.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.badge && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 bg-warning/15 text-warning border-warning/20">
                          {template.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" /> LOI
                      </span>
                      {template.supportsEmail && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> Email
                        </span>
                      )}
                      {template.supportsSms && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" /> SMS
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      selectedTemplate === template.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {selectedTemplate === template.id && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <Card className="p-8 text-center border-dashed">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h4 className="font-medium mt-4">No Custom Packages Yet</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Create reusable offer packages in the Offer Builder
            </p>
            <Button variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create in Offer Builder
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
