import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Mail,
  MessageSquare,
  FileCheck,
  Eye,
  Download,
  Printer,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  OfferPackage,
  OfferTerms,
  OFFER_TYPE_CONFIGS,
  EmailTemplate,
  TextTemplate,
  LOITemplate,
} from "./types";

interface OfferPreviewProps {
  offerType: string;
  terms: OfferTerms;
  includePOF: boolean;
  emailTemplate: EmailTemplate;
  textTemplate: TextTemplate;
  loiTemplate: LOITemplate;
  documentType: string;
  propertyData?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    sellerName: string;
    offerAmount: number;
  };
  buyerData?: {
    name: string;
    company: string;
    phone: string;
    email: string;
  };
}

const SAMPLE_PROPERTY = {
  address: "123 Main Street",
  city: "Dallas",
  state: "TX",
  zip: "75001",
  sellerName: "John Smith",
  offerAmount: 185000,
};

const SAMPLE_BUYER = {
  name: "Alex Johnson",
  company: "ABC Investments LLC",
  phone: "(555) 123-4567",
  email: "alex@abcinvestments.com",
};

export function OfferPreview({
  offerType,
  terms,
  includePOF,
  emailTemplate,
  textTemplate,
  loiTemplate,
  documentType,
  propertyData = SAMPLE_PROPERTY,
  buyerData = SAMPLE_BUYER,
}: OfferPreviewProps) {
  const [activeTab, setActiveTab] = useState<"loi" | "email" | "sms">("loi");
  const offerConfig = OFFER_TYPE_CONFIGS.find((c) => c.id === offerType);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const replaceVariables = (text: string) => {
    return text
      .replace(/{{seller_name}}/g, propertyData.sellerName)
      .replace(/{{buyer_name}}/g, buyerData.name)
      .replace(/{{buyer_company}}/g, buyerData.company)
      .replace(/{{property_address}}/g, propertyData.address)
      .replace(/{{property_city}}/g, propertyData.city)
      .replace(/{{property_state}}/g, propertyData.state)
      .replace(/{{property_zip}}/g, propertyData.zip)
      .replace(/{{offer_amount}}/g, formatCurrency(propertyData.offerAmount))
      .replace(
        /{{deposit_amount}}/g,
        terms.depositType === "flat"
          ? formatCurrency(terms.depositAmount)
          : `${terms.depositAmount}%`
      )
      .replace(/{{deposit_days}}/g, "3")
      .replace(/{{inspection_period}}/g, String(terms.inspectionPeriod))
      .replace(/{{inspection_day_type}}/g, terms.inspectionDayType)
      .replace(/{{closing_days}}/g, String(terms.closingTimeline))
      .replace(/{{buyer_phone}}/g, buyerData.phone)
      .replace(/{{buyer_email}}/g, buyerData.email)
      .replace(/{{date}}/g, new Date().toLocaleDateString())
      .replace(
        /{{expiration_date}}/g,
        new Date(
          Date.now() + terms.offerExpiration * 60 * 60 * 1000
        ).toLocaleDateString()
      )
      .replace(
        /{{contingencies}}/g,
        [
          terms.inspectionContingency && "• Inspection Contingency",
          terms.titleContingency && "• Title Contingency",
          terms.financingContingency && "• Financing Contingency",
          terms.appraisalContingency && "• Appraisal Contingency",
        ]
          .filter(Boolean)
          .join("\n")
      );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            Live Preview - Offer Package
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Package Summary */}
      <Card variant="default" padding="md" className="mb-4 bg-background-secondary">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {offerConfig && (
              <Badge
                variant="default"
                className={cn("gap-1", offerConfig.bgColor, offerConfig.color)}
              >
                {offerConfig.label}
              </Badge>
            )}
            <Badge variant="secondary">
              {documentType === "loi"
                ? "LOI Only"
                : documentType === "purchase_agreement"
                ? "Purchase Agreement"
                : "LOI + Agreement"}
            </Badge>
            {includePOF && (
              <Badge variant="info" className="gap-1">
                <FileCheck className="h-3 w-3" />
                POF Included
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-2 bg-white rounded-md">
            <DollarSign className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-h4 font-bold text-foreground">
              {formatCurrency(propertyData.offerAmount)}
            </p>
            <p className="text-tiny text-muted-foreground">Offer</p>
          </div>
          <div className="p-2 bg-white rounded-md">
            <DollarSign className="h-4 w-4 text-info mx-auto mb-1" />
            <p className="text-h4 font-bold text-foreground">
              {terms.depositType === "flat"
                ? formatCurrency(terms.depositAmount)
                : `${terms.depositAmount}%`}
            </p>
            <p className="text-tiny text-muted-foreground">EMD</p>
          </div>
          <div className="p-2 bg-white rounded-md">
            <Calendar className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-h4 font-bold text-foreground">
              {terms.closingTimeline}d
            </p>
            <p className="text-tiny text-muted-foreground">Close</p>
          </div>
          <div className="p-2 bg-white rounded-md">
            <Clock className="h-4 w-4 text-purple-500 mx-auto mb-1" />
            <p className="text-h4 font-bold text-foreground">
              {terms.offerExpiration}h
            </p>
            <p className="text-tiny text-muted-foreground">Expires</p>
          </div>
        </div>

        {/* Contingencies */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
          {terms.inspectionContingency && (
            <Badge variant="secondary" size="sm">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Inspection
            </Badge>
          )}
          {terms.titleContingency && (
            <Badge variant="secondary" size="sm">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Title
            </Badge>
          )}
          {terms.financingContingency && (
            <Badge variant="secondary" size="sm">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Financing
            </Badge>
          )}
          {terms.appraisalContingency && (
            <Badge variant="secondary" size="sm">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Appraisal
            </Badge>
          )}
        </div>
      </Card>

      {/* Document Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "loi" | "email" | "sms")}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mb-3">
          <TabsTrigger value="loi" className="gap-2">
            <FileText className="h-4 w-4" />
            LOI
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0">
          <TabsContent value="loi" className="h-full m-0">
            <ScrollArea className="h-[calc(100vh-480px)] min-h-[350px]">
              <Card variant="default" padding="lg" className="bg-white shadow-sm">
                {/* LOI Header */}
                <div className="text-center border-b border-border pb-4 mb-6">
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">
                    Letter of Intent to Purchase Real Estate
                  </h2>
                  <p className="text-small text-muted-foreground mt-1">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {/* LOI Content */}
                <div className="whitespace-pre-wrap font-sans text-small text-foreground leading-relaxed">
                  {replaceVariables(loiTemplate.content)}
                </div>
              </Card>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="email" className="h-full m-0">
            <ScrollArea className="h-[calc(100vh-480px)] min-h-[350px]">
              <Card variant="default" padding="lg" className="bg-white shadow-sm">
                {/* Email Header */}
                <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-tiny font-medium text-muted-foreground w-16">To:</span>
                    <span className="text-small text-foreground">{propertyData.sellerName} &lt;seller@example.com&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-tiny font-medium text-muted-foreground w-16">From:</span>
                    <span className="text-small text-foreground">{buyerData.name} &lt;{buyerData.email}&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-tiny font-medium text-muted-foreground w-16">Subject:</span>
                    <span className="text-small font-semibold text-foreground">
                      {replaceVariables(emailTemplate.subject)}
                    </span>
                  </div>
                </div>
                {/* Email Body */}
                <div className="whitespace-pre-wrap text-small text-foreground leading-relaxed">
                  {replaceVariables(emailTemplate.body)}
                </div>
                {emailTemplate.signature && (
                  <div className="mt-6 pt-4 border-t border-border whitespace-pre-wrap text-small text-foreground">
                    {replaceVariables(emailTemplate.signature)}
                  </div>
                )}
              </Card>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sms" className="h-full m-0">
            <ScrollArea className="h-[calc(100vh-480px)] min-h-[350px]">
              <div className="flex flex-col items-center py-6">
                {/* Phone Frame */}
                <div className="w-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-[3rem] p-3 shadow-2xl">
                  {/* Phone Notch */}
                  <div className="bg-black rounded-3xl h-7 w-28 mx-auto mb-2" />
                  
                  {/* Screen */}
                  <div className="bg-slate-100 rounded-[2rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-slate-200 px-6 py-2 flex items-center justify-between text-tiny text-slate-600">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 bg-slate-400 rounded-sm" />
                        <div className="w-6 h-3 bg-slate-400 rounded-sm" />
                      </div>
                    </div>
                    
                    {/* Header */}
                    <div className="bg-white border-b border-slate-200 px-4 py-3 text-center">
                      <p className="font-semibold text-foreground">{propertyData.sellerName}</p>
                      <p className="text-tiny text-muted-foreground">iMessage</p>
                    </div>
                    
                    {/* Messages */}
                    <div className="bg-white p-4 min-h-[220px]">
                      <p className="text-tiny text-center text-muted-foreground mb-4">Today</p>
                      
                      {/* Message Bubble */}
                      <div className="flex justify-end">
                        <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[85%] shadow-sm">
                          <p className="text-small leading-relaxed">
                            {replaceVariables(textTemplate.body)}
                          </p>
                        </div>
                      </div>
                      <p className="text-tiny text-muted-foreground text-right mt-1.5">
                        Delivered
                      </p>
                      
                      {/* Character Count */}
                      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                        <span className={cn(
                          "text-tiny font-medium",
                          replaceVariables(textTemplate.body).length > 160 ? "text-warning" : "text-muted-foreground"
                        )}>
                          {replaceVariables(textTemplate.body).length} / {textTemplate.maxLength} characters
                        </span>
                      </div>
                    </div>
                    
                    {/* Input Bar */}
                    <div className="bg-slate-100 px-4 py-3 flex items-center gap-2">
                      <div className="flex-1 bg-white rounded-full px-4 py-2 text-tiny text-muted-foreground">
                        iMessage
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
