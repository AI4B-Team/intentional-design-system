import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Check, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateLivePreviewProps {
  templateName: string;
  templateType: string;
  loiContent: string;
  useSampleData: boolean;
  onToggleSampleData: () => void;
  activeStep?: string;
  emailSubject?: string;
  emailBody?: string;
  smsMessage?: string;
  includeSms?: boolean;
}

const SAMPLE_DATA = {
  your_name: "Marcus Chen",
  your_company: "Summit Capital Partners",
  your_address: "2100 Commerce Tower, Suite 450",
  your_city: "Phoenix",
  your_state: "AZ",
  your_zip: "85004",
  your_phone: "(602) 555-8900",
  your_email: "offers@summitcapital.com",
  agent_name: "Sarah Mitchell",
  agent_first_name: "Sarah",
  agent_email: "sarah.mitchell@compass.com",
  agent_brokerage: "Compass Real Estate",
  property_address: "4821 Sonoran Vista Dr",
  property_city: "Scottsdale",
  property_state: "AZ",
  property_zip: "85255",
  list_price: "$485,000",
  offer_amount: "$465,000",
  earnest_money: "$15,000",
  closing_timeline: "21",
  closing_timeline_type: "days",
  inspection_period: "7",
  inspection_period_type: "business days",
  existing_loan_balance: "$280,000",
  existing_monthly_payment: "$1,850",
  existing_interest_rate: "3.75",
  loan_type: "Conventional",
  seller_finance_amount: "$200,000",
  seller_finance_interest_rate: "5.5",
  seller_finance_term: "30",
  seller_finance_balloon: "7",
  seller_finance_monthly_payment: "$1,136",
  seller_name: "Robert & Linda Thompson",
  buyer_name: "Marcus Chen",
  deposit_amount: "$15,000",
  closing_days: "21",
  days_on_market: "47",
  date: new Date().toLocaleDateString(),
};

export function TemplateLivePreview({
  templateName,
  templateType,
  loiContent,
  useSampleData,
  onToggleSampleData,
  activeStep = "general",
  emailSubject = "",
  emailBody = "",
  smsMessage = "",
  includeSms = true,
}: TemplateLivePreviewProps) {
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
  const displayEmailSubject = processContent(emailSubject);
  const displayEmailBody = processContent(emailBody);
  const displaySmsMessage = processContent(smsMessage);


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
      </div>

      {/* Email Preview */}
      {activeStep === "email" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-small">Email Preview</span>
            </div>
            {/* Sample Data Toggle - Pill Style */}
            <div 
              className="flex items-center bg-muted rounded-full p-0.5 cursor-pointer"
              onClick={onToggleSampleData}
            >
              <span className={cn(
                "px-2.5 py-1 text-tiny font-medium rounded-full transition-colors",
                useSampleData ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>
                Sample Data
              </span>
              <span className={cn(
                "px-2.5 py-1 text-tiny font-medium rounded-full transition-colors",
                !useSampleData ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>
                Template Tags
              </span>
            </div>
          </div>
          <div className="border rounded-lg bg-white overflow-hidden">
            {/* Email Header */}
            <div className="border-b bg-muted/20 p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-tiny text-muted-foreground w-12">From:</span>
                  <span className="text-small">{useSampleData ? SAMPLE_DATA.your_email : "{your_email}"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tiny text-muted-foreground w-12">To:</span>
                  <span className="text-small">{useSampleData ? SAMPLE_DATA.agent_email : "{agent_email}"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-tiny text-muted-foreground w-12">Subject:</span>
                  <span className="text-small font-medium">{displayEmailSubject || "Enter a subject line"}</span>
                </div>
              </div>
            </div>
            {/* Key Terms Strip */}
            <div className="border-b bg-primary/5 px-4 py-2.5 flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span className="text-tiny text-muted-foreground">Offer:</span>
                <span className="text-small font-semibold text-primary">
                  {useSampleData ? SAMPLE_DATA.offer_amount : "{offer_amount}"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-tiny text-muted-foreground">Close:</span>
                <span className="text-small font-medium">
                  {useSampleData ? `${SAMPLE_DATA.closing_timeline} days` : "{closing_timeline} days"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-tiny text-muted-foreground">EMD:</span>
                <span className="text-small font-medium">
                  {useSampleData ? SAMPLE_DATA.earnest_money : "{earnest_money}"}
                </span>
              </div>
            </div>
            {/* Email Body */}
            <ScrollArea className="h-[calc(100vh-480px)] min-h-[300px]">
              <div className="p-4">
                <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {displayEmailBody || (
                    <div className="text-muted-foreground italic">
                      No email content configured. Add content in the Email editor.
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* SMS Preview */}
      {activeStep === "sms" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-small">SMS Preview</span>
            </div>
            {/* Sample Data Toggle - Pill Style */}
            <div 
              className="flex items-center bg-muted rounded-full p-0.5 cursor-pointer"
              onClick={onToggleSampleData}
            >
              <span className={cn(
                "px-2.5 py-1 text-tiny font-medium rounded-full transition-colors",
                useSampleData ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>
                Sample Data
              </span>
              <span className={cn(
                "px-2.5 py-1 text-tiny font-medium rounded-full transition-colors",
                !useSampleData ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>
                Template Tags
              </span>
            </div>
          </div>
          {/* Phone mockup */}
          <div className="mx-auto max-w-[280px]">
            <div className="bg-gray-900 rounded-[2rem] p-2 shadow-xl">
              <div className="bg-gray-900 rounded-t-[1.5rem] pt-2 pb-1 flex justify-center">
                <div className="w-20 h-5 bg-black rounded-full" />
              </div>
              <div className="bg-gray-100 rounded-[1.25rem] min-h-[400px] flex flex-col">
                {/* Messages header */}
                <div className="bg-gray-200 rounded-t-[1.25rem] p-3 flex items-center justify-center border-b">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-1">
                      <span className="text-sm font-semibold text-primary">
                        {useSampleData ? "JS" : "??"}
                      </span>
                    </div>
                    <span className="text-tiny font-medium text-gray-700">
                      {useSampleData ? SAMPLE_DATA.agent_first_name : "{agent_first_name}"}
                    </span>
                  </div>
                </div>
                {/* Message bubbles */}
                <div className="flex-1 p-3 space-y-2">
                  {includeSms && (displaySmsMessage || smsMessage) ? (
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3 py-2 max-w-[85%]">
                        <p className="text-sm leading-relaxed">
                          {displaySmsMessage}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
                      {includeSms ? "No SMS content configured" : "SMS disabled"}
                    </div>
                  )}
                </div>
                {/* Input area mockup */}
                <div className="p-2 border-t">
                  <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2">
                    <div className="flex-1 text-gray-400 text-sm">iMessage</div>
                    <div className="w-6 h-6 rounded-full bg-primary/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Message count info */}
          {includeSms && smsMessage.length > 0 && (
            <div className="mt-3 text-center">
              <span className="text-tiny text-muted-foreground">
                {smsMessage.length > 160 
                  ? `${Math.ceil(smsMessage.length / 160)} SMS segments` 
                  : "Standard SMS (1 segment)"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* LOI Document Preview - shown for general, terms, loi steps */}
      {(activeStep === "general" || activeStep === "terms" || activeStep === "loi") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-small">Letter Of Intent (LOI)</span>
            </div>
            {/* Sample Data Toggle - Pill Style */}
            <div 
              className="flex items-center bg-muted rounded-full p-0.5 cursor-pointer"
              onClick={onToggleSampleData}
            >
              <span className={cn(
                "px-2.5 py-1 text-tiny font-medium rounded-full transition-colors",
                useSampleData ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>
                Sample Data
              </span>
              <span className={cn(
                "px-2.5 py-1 text-tiny font-medium rounded-full transition-colors",
                !useSampleData ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}>
                Template Tags
              </span>
            </div>
          </div>
          <div className="border rounded-lg bg-white p-6">
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

                {/* Key Terms Summary */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="space-y-0.5">
                    <span className="text-tiny text-muted-foreground">Purchase Price</span>
                    <p className="text-sm font-semibold text-foreground">
                      {useSampleData ? SAMPLE_DATA.offer_amount : "{offer_amount}"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-tiny text-muted-foreground">Earnest Money</span>
                    <p className="text-sm font-semibold text-foreground">
                      {useSampleData ? SAMPLE_DATA.earnest_money : "{earnest_money}"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-tiny text-muted-foreground">Inspection Period</span>
                    <p className="text-sm font-semibold text-foreground">
                      {useSampleData ? `${SAMPLE_DATA.inspection_period} ${SAMPLE_DATA.inspection_period_type}` : "{inspection_period} {inspection_period_type}"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-tiny text-muted-foreground">Closing Timeline</span>
                    <p className="text-sm font-semibold text-foreground">
                      {useSampleData ? `${SAMPLE_DATA.closing_timeline} ${SAMPLE_DATA.closing_timeline_type}` : "{closing_timeline} {closing_timeline_type}"}
                    </p>
                  </div>
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
        </div>
      )}
    </Card>
  );
}
