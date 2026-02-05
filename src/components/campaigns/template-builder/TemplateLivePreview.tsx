import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, Check, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateLivePreviewProps {
  templateName: string;
  templateType: string;
  loiContent: string;
  useSampleData: boolean;
  onToggleSampleData: () => void;
}

const SAMPLE_DATA = {
  your_name: "Alex Johnson",
  your_company: "AcquireFlow Investments",
  your_address: "456 Business Ave",
  your_city: "Austin",
  your_state: "TX",
  your_zip: "78701",
  your_phone: "(555) 123-4567",
  your_email: "alex@acquireflow.com",
  agent_name: "John Smith",
  agent_first_name: "John",
  property_address: "123 Main Street",
  property_city: "Dallas",
  property_state: "TX",
  property_zip: "75001",
  offer_amount: "$360,000",
  earnest_money: "$10,000",
  closing_timeline: "30",
  closing_timeline_type: "days",
  inspection_period: "10",
  inspection_period_type: "business days",
  existing_loan_balance: "$180,000",
  existing_monthly_payment: "$1,450",
  existing_interest_rate: "4.5",
  loan_type: "FHA",
  seller_finance_amount: "$150,000",
  seller_finance_interest_rate: "6",
  seller_finance_term: "30",
  seller_finance_balloon: "5",
  seller_finance_monthly_payment: "$899",
};

export function TemplateLivePreview({
  templateName,
  templateType,
  loiContent,
  useSampleData,
  onToggleSampleData,
}: TemplateLivePreviewProps) {
  const [isLoiExpanded, setIsLoiExpanded] = useState(true);

  const processContent = (content: string): string => {
    if (!useSampleData) return content;
    
    let processed = content;
    Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
      // Match both {key} and {{key}} and [KEY] formats
      processed = processed.replace(new RegExp(`\\{\\{?${key}\\}\\}?`, "gi"), value);
      processed = processed.replace(new RegExp(`\\[${key.toUpperCase()}\\]`, "g"), value);
    });
    return processed;
  };

  const displayContent = processContent(loiContent);

  return (
    <Card variant="default" padding="lg" className="sticky top-4 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">LIVE Preview</h3>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Check className="h-3.5 w-3.5 text-success" />
            <span className="text-small text-success">Using custom terms</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleSampleData}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Sample Data
        </Button>
      </div>

      {/* LOI Document Preview */}
      <Collapsible open={isLoiExpanded} onOpenChange={setIsLoiExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-small">LOI Document</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-small text-muted-foreground">Template:</span>
              <span className="text-small font-medium">{templateName || "Standard Cash Offer"}</span>
              {isLoiExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 border rounded-lg bg-white p-6">
            <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
              <div className="space-y-4">
                {/* Company Header */}
                <div className="border-b pb-4">
                  <h4 className="font-bold text-lg text-foreground">
                    {useSampleData ? SAMPLE_DATA.your_company : "{your_company}"}
                  </h4>
                  <p className="text-small text-muted-foreground">
                    {useSampleData ? SAMPLE_DATA.your_address : "{your_address}"}
                  </p>
                  <p className="text-small text-muted-foreground">
                    {useSampleData 
                      ? `${SAMPLE_DATA.your_city}, ${SAMPLE_DATA.your_state} ${SAMPLE_DATA.your_zip}` 
                      : "{your_city}, {your_state} {your_zip}"
                    }
                  </p>
                </div>

                {/* Letter Content */}
                <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {displayContent || (
                    <div className="text-muted-foreground italic">
                      No LOI content configured. Add content in the LOI editor.
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
