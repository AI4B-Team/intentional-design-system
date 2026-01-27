import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PropertyTabs,
  OverviewTab,
  UnderwritingTab,
  ExitStrategyTab,
  OffersTab,
  OutreachTab,
  AppointmentsTab,
  DocumentsTab,
  NotesTab,
  TitleTab,
  NegotiationCoachTab,
  OfferWizardModal,
  DispositionTab,
} from "@/components/properties/property-detail";
import { useProperty, useUpdateProperty } from "@/hooks/useProperty";
import {
  ArrowLeft,
  DollarSign,
  Wrench,
  Calculator,
  TrendingUp,
  Flame,
  MoreHorizontal,
  Archive,
  Trash2,
  Copy,
  Phone,
  Calendar,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statuses = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "appointment", label: "Appointment" },
  { value: "offer_made", label: "Offer Made" },
  { value: "under_contract", label: "Under Contract" },
  { value: "closed", label: "Closed" },
  { value: "dead", label: "Dead" },
];

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "title", label: "Title" },
  { id: "underwriting", label: "Underwriting" },
  { id: "exit-strategy", label: "Exit Strategy" },
  { id: "negotiation", label: "Negotiation Coach" },
  { id: "offers", label: "Offers" },
  { id: "disposition", label: "Disposition" },
  { id: "outreach", label: "Outreach" },
  { id: "appointments", label: "Appointments" },
  { id: "documents", label: "Documents" },
  { id: "notes", label: "Notes" },
];

function getStatusVariant(status: string | null): "success" | "warning" | "info" | "error" | "secondary" {
  switch (status) {
    case "under_contract":
    case "closed":
      return "success";
    case "appointment":
    case "offer_made":
      return "warning";
    case "contacted":
      return "info";
    case "dead":
      return "error";
    default:
      return "secondary";
  }
}

function formatCurrency(value: number | null): string {
  if (!value) return "Not Set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status: string | null): string {
  if (!status) return "New";
  return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function getScoreColor(score: number): { bg: string; text: string } {
  if (score >= 800) return { bg: "bg-destructive/15", text: "text-destructive" };
  if (score >= 500) return { bg: "bg-warning/15", text: "text-warning" };
  return { bg: "bg-muted", text: "text-muted-foreground" };
}

interface QuickStatProps {
  label: string;
  value: string;
  icon: React.ElementType;
  valueColor?: string;
  subValue?: string;
}

function QuickStat({ label, value, icon: Icon, valueColor, subValue }: QuickStatProps) {
  return (
    <Card variant="default" padding="md" className="flex-1">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-medium bg-background-secondary flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-tiny uppercase tracking-wide text-muted-foreground font-medium">
            {label}
          </p>
          <p className={cn("text-h3 font-semibold tabular-nums", valueColor || "text-foreground")}>
            {value}
          </p>
          {subValue && (
            <p className="text-tiny text-muted-foreground">{subValue}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [showOfferWizard, setShowOfferWizard] = React.useState(false);

  const { data: property, isLoading, error } = useProperty(id);
  const updateProperty = useUpdateProperty();

  const handleStatusChange = (newStatus: string) => {
    if (!id) return;
    updateProperty.mutate({ id, updates: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Properties", href: "/properties" },
          { label: "Loading..." },
        ]}
        fullWidth
      >
        <div className="p-lg space-y-lg">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !property) {
    return (
      <DashboardLayout
        breadcrumbs={[
          { label: "Properties", href: "/properties" },
          { label: "Not Found" },
        ]}
        fullWidth
      >
        <div className="p-lg text-center">
          <p className="text-muted-foreground">Property not found</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate("/properties")}>
            Back to Properties
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const score = property.motivation_score || 0;
  const scoreColors = getScoreColor(score);
  const isHot = score >= 800;
  
  // Calculate spread: ARV - Repairs - MAO
  const spread = property.arv && property.mao_standard
    ? property.arv - (property.repair_estimate || 0) - property.mao_standard
    : null;

  // Handle score update
  const handleUpdateScore = (signals: string[], score: number) => {
    if (!id) return;
    updateProperty.mutate({ 
      id, 
      updates: { 
        motivation_score: score, 
        distress_signals: signals 
      } 
    });
  };

  // Build property object for tabs
  const propertyForTabs = {
    id: property.id,
    beds: property.beds || 0,
    baths: property.baths || 0,
    sqft: property.sqft || 0,
    yearBuilt: property.year_built || undefined,
    lotSize: property.lot_size ? `${property.lot_size} acres` : undefined,
    propertyType: property.property_type || undefined,
    ownerName: property.owner_name || undefined,
    ownerPhone: property.owner_phone || undefined,
    ownerEmail: property.owner_email || undefined,
    ownerAddress: property.owner_mailing_address || undefined,
    mortgageBalance: property.mortgage_balance ? Number(property.mortgage_balance) : undefined,
    mortgageRate: property.mortgage_rate ? Number(property.mortgage_rate) : undefined,
    mortgagePayment: property.mortgage_payment ? Number(property.mortgage_payment) : undefined,
    source: property.source || undefined,
    addedDate: property.created_at 
      ? new Date(property.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : undefined,
    score: score,
    velocityScore: property.velocity_score || 50,
    urgencyLevel: score >= 800 ? "high" : score >= 500 ? "medium" : "low",
    distressSignals: property.distress_signals && Array.isArray(property.distress_signals) 
      ? (property.distress_signals as string[])
      : undefined,
    arv: property.arv ? Number(property.arv) : undefined,
    repairs: property.repair_estimate ? Number(property.repair_estimate) : undefined,
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Properties", href: "/properties" },
        { label: property.address },
      ]}
      fullWidth
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-background-secondary/80 to-background-tertiary/50">
        <div className="px-lg py-md">
          {/* Top Row: Back + Status */}
          <div className="flex items-center justify-between mb-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/properties")}
              icon={<ArrowLeft />}
            >
              Properties
            </Button>

            <Select value={property.status || "new"} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-auto gap-2 border-0 bg-transparent shadow-none">
                <Badge variant={getStatusVariant(property.status)} size="md">
                  {formatStatus(property.status)}
                </Badge>
              </SelectTrigger>
              <SelectContent className="bg-white">
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <h1 className="text-display font-semibold text-foreground mb-1">
            {property.address}
          </h1>
          <p className="text-body text-muted-foreground mb-lg">
            {[property.city, property.state, property.zip].filter(Boolean).join(", ")}
          </p>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-lg">
            <QuickStat
              label="ARV"
              value={formatCurrency(property.arv ? Number(property.arv) : null)}
              icon={DollarSign}
            />
            <QuickStat
              label="Repairs"
              value={formatCurrency(property.repair_estimate ? Number(property.repair_estimate) : null)}
              icon={Wrench}
            />
            <QuickStat
              label="MAO"
              value={formatCurrency(property.mao_standard ? Number(property.mao_standard) : null)}
              icon={Calculator}
            />
            <QuickStat
              label="Spread"
              value={spread !== null ? formatCurrency(spread) : "—"}
              icon={TrendingUp}
              valueColor={spread && spread > 0 ? "text-success" : undefined}
            />
            <Card variant="default" padding="md" className="flex-1">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-medium flex items-center justify-center flex-shrink-0",
                  scoreColors.bg
                )}>
                  {isHot ? (
                    <Flame className={cn("h-5 w-5", scoreColors.text)} />
                  ) : (
                    <span className={cn("text-h3 font-bold", scoreColors.text)}>{Math.round(score / 100)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-tiny uppercase tracking-wide text-muted-foreground font-medium">
                    Motivation
                  </p>
                  <p className={cn("text-h3 font-semibold tabular-nums", scoreColors.text)}>
                    {score}/1000
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" size="sm" icon={<Phone />}>
              Log Contact
            </Button>
            <Button variant="secondary" size="sm" icon={<Calendar />}>
              Schedule Appointment
            </Button>
            <Button variant="secondary" size="sm" icon={<Pencil />}>
              Edit Property
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowOfferWizard(true)}>
              Make Offer
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white">
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <PropertyTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === "overview" && (
          <OverviewTab 
            property={propertyForTabs} 
            onUpdateScore={handleUpdateScore}
            isUpdating={updateProperty.isPending}
          />
        )}
        {activeTab === "title" && (
          <TitleTab 
            propertyId={property.id}
            propertyValue={property.arv ? Number(property.arv) : (property.estimated_value ? Number(property.estimated_value) : null)}
            propertyAddress={property.address}
          />
        )}
        {activeTab === "underwriting" && <UnderwritingTab property={propertyForTabs} />}
        {activeTab === "exit-strategy" && (
          <ExitStrategyTab 
            property={{
              ...propertyForTabs,
              estimatedValue: property.estimated_value ? Number(property.estimated_value) : undefined,
            }} 
            onNavigateToUnderwriting={() => setActiveTab("underwriting")}
          />
        )}
        {activeTab === "negotiation" && (
          <NegotiationCoachTab 
            property={{
              ...propertyForTabs,
              address: property.address,
            }} 
            onCompleteProfile={() => setActiveTab("overview")}
          />
        )}
        {activeTab === "offers" && <OffersTab />}
        {activeTab === "disposition" && (
          <DispositionTab
            property={{
              id: property.id,
              address: property.address,
              city: property.city,
              state: property.state,
              zip: property.zip,
              property_type: property.property_type,
              beds: property.beds,
              baths: property.baths,
              sqft: property.sqft,
              arv: property.arv ? Number(property.arv) : null,
              repair_estimate: property.repair_estimate ? Number(property.repair_estimate) : null,
              mao_standard: property.mao_standard ? Number(property.mao_standard) : null,
              status: property.status,
            }}
          />
        )}
        {activeTab === "outreach" && <OutreachTab />}
        {activeTab === "appointments" && <AppointmentsTab />}
        {activeTab === "documents" && <DocumentsTab />}
        {activeTab === "notes" && <NotesTab />}
      </div>

      {/* Offer Wizard Modal */}
      <OfferWizardModal
        open={showOfferWizard}
        onOpenChange={setShowOfferWizard}
        propertyId={property.id}
        property={{
          address: property.address,
          ownerName: property.owner_name || undefined,
          ownerEmail: property.owner_email || undefined,
          ownerPhone: property.owner_phone || undefined,
          ownerAddress: property.owner_mailing_address || undefined,
          maoStandard: property.mao_standard ? Number(property.mao_standard) : undefined,
          maoAggressive: property.mao_aggressive ? Number(property.mao_aggressive) : undefined,
          maoConservative: property.mao_conservative ? Number(property.mao_conservative) : undefined,
        }}
      />
    </DashboardLayout>
  );
}
