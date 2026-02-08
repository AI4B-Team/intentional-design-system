import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Building,
  User,
  Sparkles,
  ExternalLink,
  Phone,
  Mail,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { InlineLenderRequest } from "./InlineLenderRequest";
import { OfferInsightCard } from "@/components/ai/OfferInsightCard";

interface POFDocument {
  id: string;
  fileName: string;
  amount: number;
  lenderName: string;
  expirationDate: string;
  isActive: boolean;
}

interface AgentContact {
  name: string;
  email: string;
  phone: string;
  brokerage?: string;
  type: "listing" | "buyer";
}

interface DealSetupData {
  // POF
  selectedPofId: string | null;
  includePof: boolean;
  // Agent
  listingAgent: AgentContact | null;
  buyerAgent: AgentContact | null;
  useDualAgency: boolean;
  // Property confirmed
  propertyConfirmed: boolean;
}

interface DealSetupStepProps {
  isOnMarket: boolean;
  propertyAddress: string;
  propertyState: string;
  arv: number;
  offerAmount: number;
  pofDocuments: POFDocument[];
  listingAgent?: AgentContact;
  data: DealSetupData;
  onUpdate: (data: Partial<DealSetupData>) => void;
  onUploadPof: () => void;
  insight?: string | null;
  insightLoading?: boolean;
  insightError?: string | null;
  onRefreshInsight?: () => void;
}

function getExpirationStatus(expirationDate: string) {
  const daysUntilExpiry = differenceInDays(new Date(expirationDate), new Date());
  if (daysUntilExpiry < 0) {
    return { label: "Expired", variant: "error" as const, days: daysUntilExpiry, valid: false };
  }
  if (daysUntilExpiry <= 5) {
    return { label: "Expiring Soon", variant: "warning" as const, days: daysUntilExpiry, valid: true };
  }
  return { label: "Active", variant: "success" as const, days: daysUntilExpiry, valid: true };
}

export function DealSetupStep({
  isOnMarket,
  propertyAddress,
  propertyState,
  arv,
  offerAmount,
  pofDocuments,
  listingAgent,
  data,
  onUpdate,
  onUploadPof,
  insight,
  insightLoading,
  insightError,
  onRefreshInsight,
}: DealSetupStepProps) {
  const [showLenderRequest, setShowLenderRequest] = useState(false);
  
  // Auto-select valid POF if available
  useEffect(() => {
    if (isOnMarket && !data.selectedPofId && pofDocuments.length > 0) {
      const validPof = pofDocuments.find(
        (p) => p.isActive && getExpirationStatus(p.expirationDate).valid && p.amount >= offerAmount
      );
      if (validPof) {
        onUpdate({ selectedPofId: validPof.id, includePof: true });
      }
    }
  }, [isOnMarket, pofDocuments, offerAmount]);

  // Set listing agent if available
  useEffect(() => {
    if (listingAgent && !data.listingAgent) {
      onUpdate({ listingAgent, useDualAgency: true });
    }
  }, [listingAgent]);

  const selectedPof = pofDocuments.find((p) => p.id === data.selectedPofId);
  const validPofExists = pofDocuments.some(
    (p) => p.isActive && getExpirationStatus(p.expirationDate).valid && p.amount >= offerAmount
  );
  
  const pofStatus = !isOnMarket 
    ? "not_required"
    : selectedPof && getExpirationStatus(selectedPof.expirationDate).valid && selectedPof.amount >= offerAmount
    ? "valid"
    : pofDocuments.length === 0
    ? "missing"
    : !validPofExists
    ? "insufficient"
    : "select_required";

  const canProceed = !isOnMarket || pofStatus === "valid" || pofStatus === "not_required";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Deal Setup</h3>
        <p className="text-sm text-muted-foreground">
          Confirm property, proof of funds, and agent representation
        </p>
      </div>

      {/* AI Insight */}
      {(insight || insightLoading) && (
        <OfferInsightCard
          insight={insight}
          isLoading={insightLoading}
          error={insightError}
          onRefresh={onRefreshInsight}
        />
      )}

      {/* Property Confirmation */}
      <Card className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-2 rounded-lg",
            data.propertyConfirmed ? "bg-success/10" : "bg-muted"
          )}>
            <CheckCircle2 className={cn(
              "h-5 w-5",
              data.propertyConfirmed ? "text-success" : "text-muted-foreground"
            )} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Property Confirmed</h4>
                <p className="text-sm text-muted-foreground mt-0.5">{propertyAddress}</p>
              </div>
              <Switch
                checked={data.propertyConfirmed}
                onCheckedChange={(checked) => onUpdate({ propertyConfirmed: checked })}
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span>Offer: <span className="font-semibold">{formatCurrency(offerAmount)}</span></span>
              <span className="text-success">ARV: <span className="font-semibold">{formatCurrency(arv)}</span></span>
              <Badge variant="secondary" size="sm">
                {isOnMarket ? "On Market (MLS)" : "Off Market"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* POF Section - Only shown for on-market */}
      {isOnMarket && (
        <Card className={cn(
          "p-4",
          pofStatus === "valid" && "border-success/50 bg-success/5",
          (pofStatus === "missing" || pofStatus === "insufficient") && "border-destructive/50 bg-destructive/5"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-2 rounded-lg",
              pofStatus === "valid" ? "bg-success/10" : "bg-warning/10"
            )}>
              <FileText className={cn(
                "h-5 w-5",
                pofStatus === "valid" ? "text-success" : "text-warning"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">Proof Of Funds</h4>
                <Badge variant={pofStatus === "valid" ? "success" : "warning"} size="sm">
                  {isOnMarket ? "Required For MLS" : "Optional"}
                </Badge>
              </div>

              {pofStatus === "valid" && selectedPof && (
                <div className="p-3 bg-success/10 rounded-lg border border-success/20 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium text-sm">{selectedPof.fileName}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {selectedPof.lenderName}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(selectedPof.amount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expires in {getExpirationStatus(selectedPof.expirationDate).days} days
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onUpdate({ selectedPofId: null })}>
                      Change
                    </Button>
                  </div>
                </div>
              )}

              {(pofStatus === "missing" || pofStatus === "insufficient" || pofStatus === "select_required") && (
                <div className="space-y-3 mt-2">
                  {pofStatus === "missing" && (
                    <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-destructive">No Proof Of Funds On File</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            On-market (MLS) offers require POF to be submitted with your offer.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {pofStatus === "insufficient" && (
                    <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-warning">Insufficient POF Coverage</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Your POF amount must be at least {formatCurrency(offerAmount)} to cover this offer.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* POF Selection if documents exist */}
                  {pofDocuments.length > 0 && (
                    <div>
                      <Label className="text-sm">Select Existing POF</Label>
                      <Select
                        value={data.selectedPofId || ""}
                        onValueChange={(id) => onUpdate({ selectedPofId: id, includePof: true })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a POF document" />
                        </SelectTrigger>
                        <SelectContent>
                          {pofDocuments.map((pof) => {
                            const status = getExpirationStatus(pof.expirationDate);
                            const isValid = status.valid && pof.amount >= offerAmount;
                            return (
                              <SelectItem key={pof.id} value={pof.id} disabled={!isValid}>
                                <div className="flex items-center gap-2">
                                  <span>{pof.lenderName} - {formatCurrency(pof.amount)}</span>
                                  {!isValid && (
                                    <Badge variant="destructive" size="sm">
                                      {!status.valid ? "Expired" : "Insufficient"}
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onUploadPof}
                      className="flex-1 gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload POF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLenderRequest(true)}
                      className="flex-1 gap-2"
                    >
                      <Building className="h-4 w-4" />
                      Get From Lender
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Inline Lender Request Modal */}
      {showLenderRequest && (
        <InlineLenderRequest
          offerAmount={offerAmount}
          propertyAddress={propertyAddress}
          propertyState={propertyState}
          onClose={() => setShowLenderRequest(false)}
          onSuccess={(pofId) => {
            onUpdate({ selectedPofId: pofId, includePof: true });
            setShowLenderRequest(false);
          }}
        />
      )}

      {/* Agent Section */}
      <Card className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-2 rounded-lg",
            data.listingAgent || data.buyerAgent ? "bg-success/10" : "bg-muted"
          )}>
            <User className={cn(
              "h-5 w-5",
              data.listingAgent || data.buyerAgent ? "text-success" : "text-muted-foreground"
            )} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-3">Agent Representation</h4>

            {/* Listing Agent */}
            {data.listingAgent && (
              <div className="p-3 bg-muted/50 rounded-lg mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{data.listingAgent.name}</p>
                      <Badge variant="secondary" size="sm">Listing Agent</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      {data.listingAgent.brokerage && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {data.listingAgent.brokerage}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {data.listingAgent.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {data.listingAgent.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dual Agency Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">Use Dual Agency</p>
                <p className="text-xs text-muted-foreground">
                  Listing agent represents both parties (common for LOI)
                </p>
              </div>
              <Switch
                checked={data.useDualAgency}
                onCheckedChange={(checked) => onUpdate({ useDualAgency: checked })}
              />
            </div>

            {/* Buyer's Agent (if not dual agency) */}
            {!data.useDualAgency && (
              <div className="mt-3 space-y-3">
                <Label className="text-sm">Buyer's Agent</Label>
                {data.buyerAgent ? (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{data.buyerAgent.name}</p>
                        <p className="text-xs text-muted-foreground">{data.buyerAgent.brokerage}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => onUpdate({ buyerAgent: null })}>
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => {
                      // Mock buyer agent selection
                      if (value === "add") {
                        // Would open a dialog to add new buyer agent
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select buyer's agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Represent Myself</SelectItem>
                        <SelectItem value="add">
                          <span className="flex items-center gap-2">
                            <Plus className="h-3 w-3" />
                            Add New Agent
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Compliance Notice */}
      <Card className="p-3 bg-muted/30 border-muted">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">State Compliance: {propertyState}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your offer will include required disclosures for {propertyState} real estate transactions.
            </p>
          </div>
        </div>
      </Card>

      {/* Proceed Gate Warning */}
      {!canProceed && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              Cannot proceed without valid Proof of Funds for on-market offers
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
