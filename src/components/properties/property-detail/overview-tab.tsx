import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MotivationGauge } from "./motivation-gauge";
import { MotivationIQModal } from "../motivation-iq-modal";
import { MotivationIQBadge } from "../motivation-iq-badge";
import { AIAnalysisButton, DistressAnalysisModal } from "@/components/ai";
import { analyzeDistress, type DistressAnalysis, type PropertyAnalysisInput } from "@/lib/ai-analysis";
import {
  Pencil,
  Home,
  Bed,
  Bath,
  Maximize,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Percent,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Settings,
  Zap,
  Brain,
} from "lucide-react";
import { toast } from "sonner";

interface OverviewTabProps {
  property: {
    id: string;
    beds: number;
    baths: number;
    sqft: number;
    yearBuilt?: number;
    lotSize?: string;
    propertyType?: string;
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    ownerAddress?: string;
    mortgageBalance?: number;
    mortgageRate?: number;
    mortgagePayment?: number;
    lender?: string;
    source?: string;
    addedDate?: string;
    score: number;
    velocityScore?: number;
    urgencyLevel?: string;
    distressSignals?: string[];
  };
  onUpdateScore?: (signals: string[], score: number) => void;
  isUpdating?: boolean;
}

function InfoRow({ label, value, icon: Icon, copyable, onClick }: { 
  label: string; 
  value: React.ReactNode; 
  icon?: React.ElementType;
  copyable?: boolean;
  onClick?: () => void;
}) {
  const handleCopy = () => {
    if (typeof value === "string") {
      navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    }
  };

  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-content-tertiary mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-small text-content-secondary">{label}</div>
        <div 
          className={cn(
            "text-body text-content",
            (copyable || onClick) && "cursor-pointer hover:text-brand-accent transition-colors"
          )}
          onClick={copyable ? handleCopy : onClick}
        >
          {value}
          {copyable && <Copy className="inline h-3 w-3 ml-1.5 opacity-50" />}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, onEdit, children }: { title: string; onEdit?: () => void; children: React.ReactNode }) {
  return (
    <Card variant="default" padding="none">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
        <CardTitle className="text-h3 font-medium">{title}</CardTitle>
        {onEdit && (
          <Button variant="ghost" size="sm" icon={<Pencil />} onClick={onEdit}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

export function OverviewTab({ property, onUpdateScore, isUpdating }: OverviewTabProps) {
  const [showBreakdown, setShowBreakdown] = React.useState(false);
  const [showMotivationModal, setShowMotivationModal] = React.useState(false);
  const [distressAnalysis, setDistressAnalysis] = React.useState<DistressAnalysis | null>(null);
  const [showDistressModal, setShowDistressModal] = React.useState(false);
  const hasGoodRate = property.mortgageRate && property.mortgageRate < 5;

  const handleSaveScore = (signals: string[], score: number) => {
    onUpdateScore?.(signals, score);
    setShowMotivationModal(false);
  };

  const handleRunDistressAnalysis = async () => {
    const input: PropertyAnalysisInput = {
      property: {
        id: property.id,
        address: "", // Would come from parent
        beds: property.beds,
        baths: property.baths,
        sqft: property.sqft,
        year_built: property.yearBuilt,
        property_type: property.propertyType,
        mortgage_balance: property.mortgageBalance,
        mortgage_rate: property.mortgageRate,
        owner_name: property.ownerName,
        distress_signals: property.distressSignals,
        motivation_score: property.score,
      },
    };
    const result = await analyzeDistress(input);
    setDistressAnalysis(result);
    setShowDistressModal(true);
  };

  // Get breakdown from distress signals if available
  const getScoreBreakdown = () => {
    if (!property.distressSignals || property.distressSignals.length === 0) {
      return [
        { signal: "Equity > 40%", points: 150 },
        { signal: "Vacant Property", points: 200 },
        { signal: "Tax Delinquent", points: 175 },
      ];
    }
    // If we have real signals, we would compute breakdown from motivationiq.ts
    return property.distressSignals.slice(0, 5).map((signal) => ({
      signal: signal.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      points: 50,
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg p-lg">
      {/* Left Column - 2/3 width */}
      <div className="lg:col-span-2 space-y-lg">
        {/* Property Info */}
        <SectionCard title="Property Information" onEdit={() => {}}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <InfoRow label="Property Type" value={property.propertyType || "Single Family"} icon={Home} />
            <InfoRow label="Year Built" value={property.yearBuilt || "—"} icon={Calendar} />
            <InfoRow label="Bedrooms" value={property.beds} icon={Bed} />
            <InfoRow label="Bathrooms" value={property.baths} icon={Bath} />
            <InfoRow label="Square Feet" value={property.sqft.toLocaleString()} icon={Maximize} />
            <InfoRow label="Lot Size" value={property.lotSize || "—"} icon={Maximize} />
          </div>
        </SectionCard>

        {/* Owner Info */}
        <SectionCard title="Owner Information" onEdit={() => {}}>
          <div className="space-y-1">
            <InfoRow label="Name" value={property.ownerName || "John Smith"} icon={User} />
            <InfoRow 
              label="Phone" 
              value={property.ownerPhone || "(512) 555-0123"} 
              icon={Phone} 
              copyable 
            />
            <InfoRow 
              label="Email" 
              value={property.ownerEmail || "john.smith@email.com"} 
              icon={Mail} 
              copyable 
            />
            <InfoRow 
              label="Mailing Address" 
              value={property.ownerAddress || "456 Oak Avenue, Austin, TX 78702"} 
              icon={MapPin} 
            />
          </div>
        </SectionCard>

        {/* Mortgage Info */}
        {(property.mortgageBalance || property.mortgageRate) && (
          <SectionCard title="Mortgage Information" onEdit={() => {}}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <InfoRow 
                label="Balance" 
                value={property.mortgageBalance ? `$${property.mortgageBalance.toLocaleString()}` : "—"} 
                icon={DollarSign} 
              />
              <div className="flex items-start gap-3 py-2">
                <Percent className="h-4 w-4 text-content-tertiary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-small text-content-secondary">Interest Rate</div>
                  <div className="flex items-center gap-2">
                    <span className="text-body text-content">
                      {property.mortgageRate ? `${property.mortgageRate}%` : "—"}
                    </span>
                    {hasGoodRate && (
                      <Badge variant="success" size="sm">Good Sub-To</Badge>
                    )}
                  </div>
                </div>
              </div>
              <InfoRow 
                label="Monthly Payment" 
                value={property.mortgagePayment ? `$${property.mortgagePayment.toLocaleString()}` : "—"} 
                icon={Clock} 
              />
              <InfoRow label="Lender" value={property.lender || "—"} icon={Home} />
            </div>
          </SectionCard>
        )}
      </div>

      {/* Right Column - 1/3 width */}
      <div className="space-y-lg">
        {/* Source Card */}
        <Card variant="default" padding="md">
          <div className="text-small text-content-secondary mb-1">Lead Source</div>
          <div className="text-body font-medium text-content">{property.source || "Direct Mail"}</div>
          <div className="text-small text-content-tertiary mt-2">
            Added {property.addedDate || "3 days ago"}
          </div>
        </Card>

        {/* Motivation Score Card */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-small text-content-secondary">MotivationIQ Score</span>
            <MotivationIQBadge score={property.score} size="sm" showLabel />
          </div>
          
          <div className="text-center mb-4">
            <MotivationGauge score={property.score} size="lg" />
          </div>
          
          <div className="space-y-2">
            <AIAnalysisButton
              onClick={handleRunDistressAnalysis}
              label="AI Distress Analysis"
              showBadge={false}
              variant="secondary"
              icon={<Brain />}
              className="w-full [&>button]:w-full"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              fullWidth 
              icon={<Settings />}
              onClick={() => setShowMotivationModal(true)}
            >
              Configure Signals
            </Button>
          </div>

          {/* Score Breakdown */}
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center justify-between w-full text-small text-content-secondary hover:text-content transition-colors"
            >
              <span>Score Breakdown</span>
              {showBreakdown ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showBreakdown && (
              <div className="mt-3 space-y-2 animate-fade-in">
                {getScoreBreakdown().map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-small">
                    <span className="text-content-secondary">{item.signal}</span>
                    <span className="font-medium text-success tabular-nums">+{item.points}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Velocity Score Card */}
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-small text-content-secondary">Velocity Score</div>
            {property.urgencyLevel === "high" && (
              <Badge variant="error" size="sm" className="animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Move Now!
              </Badge>
            )}
          </div>
          <MotivationGauge score={property.velocityScore || 720} size="sm" showLabel={false} />
          <div className="mt-3 text-small text-content-secondary text-center">
            High engagement signals detected
          </div>
        </Card>

        {/* Map Card */}
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-surface-secondary to-surface-tertiary flex items-center justify-center">
            <MapPin className="h-8 w-8 text-content-tertiary" />
          </div>
          <div className="p-3">
            <Button variant="ghost" size="sm" fullWidth icon={<ExternalLink />}>
              Get Directions
            </Button>
          </div>
        </Card>
      </div>

      {/* MotivationIQ Modal */}
      <MotivationIQModal
        open={showMotivationModal}
        onOpenChange={setShowMotivationModal}
        currentSignals={property.distressSignals || []}
        onSave={handleSaveScore}
        isSaving={isUpdating}
      />
      
      {/* AI Distress Analysis Modal */}
      <DistressAnalysisModal
        isOpen={showDistressModal}
        onClose={() => setShowDistressModal(false)}
        data={distressAnalysis}
      />
    </div>
  );
}
