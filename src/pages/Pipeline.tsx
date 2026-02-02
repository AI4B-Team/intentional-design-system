import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Kanban,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  MoreVertical,
  Building2,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronRight,
  GripVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  Target,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Zap,
  Users,
  Handshake,
  BadgeDollarSign,
  CalendarClock,
  Send,
  MessageCircle,
  Megaphone,
  Home,
  Bed,
  Bath,
  Square,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePipelineValueStats } from "@/hooks/usePipelineValueStats";
import { useDashboardInsights } from "@/hooks/useDashboardInsights";
import { GoalSettingsDialog, useGoals } from "@/components/dashboard/GoalSettingsDialog";
import { PipelineValueCard } from "@/components/pipeline/PipelineValueCard";
import { Hourglass } from "lucide-react";
import {
  FocusStrip,
  getFocusFilteredDeals,
  StagePressureIndicator,
  StallingStat,
  getStalledDeals,
  PipelineGoalHeader,
  EmptyStageGuide,
} from "@/components/pipeline";
import { PipelineDealCard } from "@/components/pipeline/PipelineDealCard";

// Pipeline stages configuration - SYNCHRONIZED with src/lib/pipeline-colors.ts
// Categories: Discovery (Red), Intent (Yellow), Commitment (Blue), Outcome (Green)
const PIPELINE_STAGES: {
  id: string;
  label: string;
  color: string;
  icon: LucideIcon;
  description: string;
  targetDays: number;
  category: string;
}[] = [
  // === DISCOVERY GROUP (Red) - Uses Users icon like dashboard ===
  { 
    id: "new", 
    label: "New Leads", 
    color: "bg-red-500", 
    icon: Users,
    description: "Fresh leads requiring qualification",
    targetDays: 2,
    category: "discovery",
  },
  { 
    id: "contacted", 
    label: "Contacted", 
    color: "bg-red-500", 
    icon: Phone,
    description: "Initial contact made",
    targetDays: 5,
    category: "discovery",
  },
  { 
    id: "appointment", 
    label: "Appointments", 
    color: "bg-red-500", 
    icon: CalendarClock,
    description: "Meeting scheduled with seller",
    targetDays: 3,
    category: "discovery",
  },
  // === INTENT GROUP (Yellow/Amber) - Uses FileText icon like dashboard ===
  { 
    id: "offer_made", 
    label: "Offer Made", 
    color: "bg-amber-500", 
    icon: FileText,
    description: "Offer submitted, awaiting response",
    targetDays: 7,
    category: "intent",
  },
  { 
    id: "follow_up", 
    label: "Follow Up", 
    color: "bg-amber-400", 
    icon: Clock,
    description: "Awaiting response or next contact",
    targetDays: 7,
    category: "intent",
  },
  { 
    id: "negotiating", 
    label: "Negotiating", 
    color: "bg-amber-500", 
    icon: MessageCircle,
    description: "Active negotiation in progress",
    targetDays: 14,
    category: "intent",
  },
  // === COMMITMENT GROUP (Blue) - Uses Handshake icon like dashboard ===
  { 
    id: "under_contract", 
    label: "Under Contract", 
    color: "bg-blue-500", 
    icon: Handshake,
    description: "Contract signed, heading to close",
    targetDays: 30,
    category: "commitment",
  },
  { 
    id: "marketing", 
    label: "Marketing", 
    color: "bg-blue-500", 
    icon: Megaphone,
    description: "Property being marketed to buyers",
    targetDays: 14,
    category: "commitment",
  },
  // === OUTCOME GROUP (Green) - Uses BadgeDollarSign icon like dashboard ===
  { 
    id: "closed", 
    label: "Purchased", 
    color: "bg-emerald-500", 
    icon: BadgeDollarSign,
    description: "Deal completed",
    targetDays: 0,
    category: "outcome",
  },
  { 
    id: "sold", 
    label: "Sold", 
    color: "bg-emerald-500", 
    icon: BadgeDollarSign,
    description: "Property sold and funds received",
    targetDays: 0,
    category: "outcome",
  },
];

// Mock pipeline deals for demonstration
const MOCK_DEALS = [
  {
    id: "1",
    address: "123 Main Street",
    city: "Austin",
    state: "TX",
    zip: "78701",
    stage: "new",
    asking_price: 285000,
    offer_amount: null,
    arv: 350000,
    equity_percentage: 18,
    lead_score: 85,
    contact_name: "John Smith",
    contact_phone: "(512) 555-0123",
    contact_email: "john@email.com",
    contact_type: "Seller",
    source: "Direct Mail",
    days_in_stage: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    notes: "Motivated seller, relocating for work",
    property_type: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1850,
  },
  {
    id: "2",
    address: "456 Oak Avenue",
    city: "Round Rock",
    state: "TX",
    zip: "78664",
    stage: "contacted",
    asking_price: 320000,
    offer_amount: null,
    arv: 400000,
    equity_percentage: 20,
    lead_score: 72,
    contact_name: "Sarah Johnson",
    contact_phone: "(512) 555-0456",
    contact_email: "sarah@realty.com",
    contact_type: "Agent",
    source: "MLS",
    days_in_stage: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    notes: "Agent representing absentee owner",
    property_type: "Single Family",
    beds: 4,
    baths: 2.5,
    sqft: 2200,
  },
  {
    id: "3",
    address: "789 Elm Boulevard",
    city: "Cedar Park",
    state: "TX",
    zip: "78613",
    stage: "appointment",
    asking_price: 275000,
    offer_amount: null,
    arv: 380000,
    equity_percentage: 28,
    lead_score: 91,
    contact_name: "Mike Williams",
    contact_phone: "(512) 555-0789",
    contact_email: "mike@gmail.com",
    contact_type: "Seller",
    source: "Driving for Dollars",
    days_in_stage: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    notes: "Inherited property, needs repairs",
    property_type: "Single Family",
    beds: 3,
    baths: 1,
    sqft: 1400,
  },
  {
    id: "4",
    address: "321 Pine Drive",
    city: "Georgetown",
    state: "TX",
    zip: "78626",
    stage: "offer_made",
    asking_price: 295000,
    offer_amount: 245000,
    arv: 365000,
    equity_percentage: 24,
    lead_score: 78,
    contact_name: "Lisa Chen",
    contact_phone: "(512) 555-0321",
    contact_email: "lisa@realty.com",
    contact_type: "Agent",
    source: "Cold Call",
    days_in_stage: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    notes: "Submitted cash offer, waiting for response",
    property_type: "Single Family",
    beds: 4,
    baths: 3,
    sqft: 2600,
  },
  {
    id: "5",
    address: "555 Maple Court",
    city: "Pflugerville",
    state: "TX",
    zip: "78660",
    stage: "negotiating",
    asking_price: 310000,
    offer_amount: 265000,
    arv: 395000,
    equity_percentage: 22,
    lead_score: 88,
    contact_name: "Robert Davis",
    contact_phone: "(512) 555-0555",
    contact_email: "robert@email.com",
    contact_type: "Seller",
    source: "Website Lead",
    days_in_stage: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    notes: "Counter at $275k, may accept $270k",
    property_type: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1750,
  },
  {
    id: "6",
    address: "888 Birch Lane",
    city: "Leander",
    state: "TX",
    zip: "78641",
    stage: "under_contract",
    asking_price: 340000,
    offer_amount: 290000,
    arv: 420000,
    equity_percentage: 31,
    lead_score: 95,
    contact_name: "Emily Brown",
    contact_phone: "(512) 555-0888",
    contact_email: "emily@gmail.com",
    contact_type: "Seller",
    source: "Referral",
    days_in_stage: 18,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    notes: "Contract signed, closing in 12 days",
    property_type: "Single Family",
    beds: 5,
    baths: 3,
    sqft: 3100,
  },
  {
    id: "7",
    address: "999 Cypress Way",
    city: "Austin",
    state: "TX",
    zip: "78745",
    stage: "new",
    asking_price: 225000,
    offer_amount: null,
    arv: 295000,
    equity_percentage: 24,
    lead_score: 67,
    contact_name: "James Wilson",
    contact_phone: "(512) 555-0999",
    contact_email: null,
    contact_type: "Seller",
    source: "Direct Mail",
    days_in_stage: 0,
    created_at: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    notes: "Just responded to mailer",
    property_type: "Single Family",
    beds: 2,
    baths: 1,
    sqft: 1100,
  },
  {
    id: "8",
    address: "777 Marketing Lane",
    city: "Austin",
    state: "TX",
    zip: "78702",
    stage: "marketing",
    asking_price: 295000,
    offer_amount: 250000,
    arv: 375000,
    equity_percentage: 27,
    lead_score: 92,
    contact_name: "Amanda Garcia",
    contact_phone: "(512) 555-0777",
    contact_email: "amanda@gmail.com",
    contact_type: "Seller",
    source: "Direct Mail",
    days_in_stage: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    notes: "Property acquired, actively marketing to cash buyers",
    property_type: "Single Family",
    beds: 4,
    baths: 2,
    sqft: 2100,
  },
  // Additional deals to showcase more focus items
  {
    id: "9",
    address: "222 Offer Street",
    city: "Austin",
    state: "TX",
    zip: "78748",
    stage: "offer_made",
    asking_price: 198000,
    offer_amount: 165000,
    arv: 255000,
    equity_percentage: 29,
    lead_score: 82,
    contact_name: "Patricia Moore",
    contact_phone: "(512) 555-0222",
    contact_email: "pat@email.com",
    contact_type: "Seller",
    source: "Cold Call",
    days_in_stage: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    notes: "Sent offer, no response yet",
    property_type: "Single Family",
    beds: 3,
    baths: 2,
    sqft: 1550,
  },
  {
    id: "10",
    address: "444 Stalled Ave",
    city: "Round Rock",
    state: "TX",
    zip: "78681",
    stage: "negotiating",
    asking_price: 275000,
    offer_amount: 235000,
    arv: 345000,
    equity_percentage: 25,
    lead_score: 79,
    contact_name: "Tom Harris",
    contact_phone: "(512) 555-0444",
    contact_email: "tom@gmail.com",
    contact_type: "Seller",
    source: "Website Lead",
    days_in_stage: 12,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    notes: "Back and forth on price, seller hesitant",
    property_type: "Single Family",
    beds: 4,
    baths: 2,
    sqft: 1900,
  },
  {
    id: "11",
    address: "666 Contract Close",
    city: "Leander",
    state: "TX",
    zip: "78642",
    stage: "under_contract",
    asking_price: 265000,
    offer_amount: 225000,
    arv: 335000,
    equity_percentage: 26,
    lead_score: 94,
    contact_name: "Nancy White",
    contact_phone: "(512) 555-0666",
    contact_email: "nancy@email.com",
    contact_type: "Seller",
    source: "Referral",
    days_in_stage: 22,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    notes: "Closing scheduled, waiting on title",
    property_type: "Townhouse",
    beds: 3,
    baths: 2.5,
    sqft: 1650,
  },
  {
    id: "12",
    address: "111 Cold Lead Rd",
    city: "Pflugerville",
    state: "TX",
    zip: "78660",
    stage: "contacted",
    asking_price: 189000,
    offer_amount: null,
    arv: 245000,
    equity_percentage: 23,
    lead_score: 65,
    contact_name: "Steve Martinez",
    contact_phone: "(512) 555-0111",
    contact_email: "steve@email.com",
    contact_type: "Seller",
    source: "Direct Mail",
    days_in_stage: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    notes: "Initial contact made, needs follow up",
    property_type: "Single Family",
    beds: 2,
    baths: 1,
    sqft: 1050,
  },
];

interface PipelineDeal {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  stage: string;
  asking_price: number;
  offer_amount: number | null;
  arv: number;
  equity_percentage: number;
  lead_score: number;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_type: string;
  source: string;
  days_in_stage: number;
  created_at: string;
  last_activity: string;
  notes: string | null;
  property_type: string;
  beds: number;
  baths: number;
  sqft: number;
}

function getLeadScoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

function getLeadScoreBg(score: number) {
  if (score >= 80) return "bg-success/10";
  if (score >= 60) return "bg-warning/10";
  return "bg-destructive/10";
}

// Profit band calculation
function getProfitBand(equityPct: number, arv: number, askingPrice: number) {
  const spread = arv - askingPrice;
  const spreadK = Math.round(spread / 1000);
  
  if (equityPct >= 25) {
    return { label: "Strong", color: "text-success", bg: "bg-success/10", spread: spreadK };
  }
  if (equityPct >= 15) {
    return { label: "Thin", color: "text-warning", bg: "bg-warning/10", spread: spreadK };
  }
  return { label: "Risky", color: "text-destructive", bg: "bg-destructive/10", spread: spreadK };
}

// Next action determination
function getNextAction(deal: PipelineDeal, stageConfig: typeof PIPELINE_STAGES[0]) {
  const daysSinceActivity = differenceInDays(new Date(), new Date(deal.last_activity));
  const isOverdue = deal.days_in_stage > stageConfig.targetDays && stageConfig.targetDays > 0;
  
  // Priority order of nags
  if (daysSinceActivity >= 5) {
    return { text: `No contact in ${daysSinceActivity}d`, urgent: true, icon: MessageSquare };
  }
  if (isOverdue) {
    const overdueDays = deal.days_in_stage - stageConfig.targetDays;
    return { text: `${overdueDays}d overdue`, urgent: true, icon: AlertTriangle };
  }
  if (deal.stage === "offer_made" && deal.days_in_stage >= 5) {
    return { text: "Follow up on offer", urgent: true, icon: Phone };
  }
  if (deal.stage === "new" && deal.days_in_stage >= 1) {
    return { text: "Make first contact", urgent: false, icon: Phone };
  }
  if (deal.stage === "appointment" && deal.days_in_stage >= 2) {
    return { text: "Complete analysis", urgent: false, icon: FileText };
  }
  if (deal.stage === "contacted" && deal.days_in_stage >= 3) {
    return { text: "Follow up due", urgent: false, icon: Phone };
  }
  if (deal.stage === "negotiating") {
    return { text: "Counter or close", urgent: false, icon: DollarSign };
  }
  if (deal.stage === "marketing" && deal.days_in_stage >= 7) {
    return { text: "Update buyer list", urgent: false, icon: MessageSquare };
  }
  return null;
}

// Lead score explanation
function getLeadScoreReason(deal: PipelineDeal) {
  const reasons: string[] = [];
  
  if (deal.equity_percentage >= 25) reasons.push("High equity (25%+)");
  else if (deal.equity_percentage >= 15) reasons.push("Moderate equity");
  else reasons.push("Low equity");
  
  if (deal.contact_type === "Seller") reasons.push("Direct to seller");
  if (deal.source === "Referral") reasons.push("Referral lead");
  if (deal.source === "Driving for Dollars") reasons.push("D4D lead");
  
  if (deal.lead_score >= 80) reasons.push("High motivation signals");
  else if (deal.lead_score < 60) reasons.push("Low engagement");
  
  return reasons.join(" • ");
}

// DealCard component moved to src/components/pipeline/PipelineDealCard.tsx


function StageColumn({ 
  stage, 
  deals,
  allDeals, 
  onViewDeal,
  onMoveDeal,
}: { 
  stage: typeof PIPELINE_STAGES[0]; 
  deals: PipelineDeal[];
  allDeals: PipelineDeal[];
  onViewDeal: (deal: PipelineDeal) => void;
  onMoveDeal: (dealId: string, newStage: string) => void;
}) {
  const totalValue = deals.reduce((sum, d) => sum + (d.offer_amount || d.asking_price), 0);
  const avgDaysInStage = deals.length > 0 
    ? Math.round(deals.reduce((sum, d) => sum + d.days_in_stage, 0) / deals.length)
    : 0;
  const overdueCount = deals.filter(d => d.days_in_stage > stage.targetDays && stage.targetDays > 0).length;

  return (
    <div className="flex-shrink-0 w-72">
      <div className="bg-surface-secondary rounded-lg border border-border-subtle">
        {/* Stage Header */}
        <div className="p-3 border-b border-border-subtle">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <stage.icon className={cn(
                "h-4 w-4",
                stage.category === "discovery" && "text-red-500",
                stage.category === "intent" && "text-amber-500",
                stage.category === "commitment" && "text-blue-500",
                stage.category === "outcome" && "text-emerald-500"
              )} />
              <span className="text-small font-semibold">{stage.label}</span>
              <Badge variant="secondary" size="sm">{deals.length}</Badge>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-tiny">Add deal to {stage.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Deals */}
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="p-2 space-y-2">
            {deals.length === 0 ? (
              <EmptyStageGuide stageId={stage.id} />
            ) : (
              deals.map((deal) => {
                const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === deal.stage);
                const nextStage = PIPELINE_STAGES[currentStageIndex + 1];
                const prevStage = PIPELINE_STAGES[currentStageIndex - 1];
                return (
                  <PipelineDealCard 
                    key={deal.id} 
                    deal={deal} 
                    stageConfig={stage}
                    nextStage={nextStage}
                    prevStage={prevStage}
                    onView={() => onViewDeal(deal)}
                    onMove={(newStage) => onMoveDeal(deal.id, newStage)}
                  />
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function PipelineStats({ 
  deals, 
  onFilterStalled, 
  isStalledFiltered 
}: { 
  deals: PipelineDeal[];
  onFilterStalled: (enabled: boolean) => void;
  isStalledFiltered: boolean;
}) {
  const totalDeals = deals.length;
  const totalPipelineValue = deals.reduce((sum, d) => sum + (d.offer_amount || d.asking_price), 0);
  const underContract = deals.filter(d => d.stage === "under_contract").length;
  const avgLeadScore = totalDeals > 0 
    ? Math.round(deals.reduce((sum, d) => sum + d.lead_score, 0) / totalDeals)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center">
            <Kanban className="h-5 w-5 text-brand" />
          </div>
          <div>
            <p className="text-tiny text-content-tertiary">Total Deals</p>
            <p className="text-xl font-bold">{totalDeals}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-tiny text-content-tertiary">Pipeline Value</p>
            <p className="text-xl font-bold">${(totalPipelineValue / 1000000).toFixed(2)}M</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-info" />
          </div>
          <div>
            <p className="text-tiny text-content-tertiary">Under Contract</p>
            <p className="text-xl font-bold">{underContract}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-tiny text-content-tertiary">Avg Lead Score</p>
            <p className="text-xl font-bold">{avgLeadScore}</p>
          </div>
        </div>
      </Card>
      
      {/* Stalling Stat - Now Interactive */}
      <StallingStat 
        deals={deals}
        stages={PIPELINE_STAGES}
        onFilterStalled={onFilterStalled}
        isFiltered={isStalledFiltered}
      />
    </div>
  );
}


export default function Pipeline() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const goals = useGoals();
  const { data: pipelineValueStats, isLoading: pipelineValueLoading } = usePipelineValueStats();
  const { data: insights } = useDashboardInsights();
  const [search, setSearch] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState<string>("all");
  const [selectedDeal, setSelectedDeal] = React.useState<PipelineDeal | null>(null);
  const [deals, setDeals] = React.useState<PipelineDeal[]>(MOCK_DEALS);
  const [focusFilter, setFocusFilter] = React.useState<string | null>(null);
  const [stalledFilter, setStalledFilter] = React.useState(false);

  // Goals (would come from user settings/database)
  const underContractGoal = 5;
  const closedGoal = 3;

  // Filter deals
  const filteredDeals = React.useMemo(() => {
    let filtered = deals.filter(deal => {
      const matchesSearch = !search || 
        deal.address.toLowerCase().includes(search.toLowerCase()) ||
        deal.contact_name.toLowerCase().includes(search.toLowerCase()) ||
        deal.city.toLowerCase().includes(search.toLowerCase());
      const matchesSource = sourceFilter === "all" || deal.source === sourceFilter;
      return matchesSearch && matchesSource;
    });

    // Apply focus filter
    if (focusFilter) {
      filtered = getFocusFilteredDeals(filtered, focusFilter);
    }

    // Apply stalled filter
    if (stalledFilter) {
      filtered = getStalledDeals(filtered, PIPELINE_STAGES);
    }

    return filtered;
  }, [deals, search, sourceFilter, focusFilter, stalledFilter]);

  // Get deals by stage
  const dealsByStage = React.useMemo(() => {
    const grouped: Record<string, PipelineDeal[]> = {};
    PIPELINE_STAGES.forEach(stage => {
      grouped[stage.id] = filteredDeals.filter(d => d.stage === stage.id);
    });
    return grouped;
  }, [filteredDeals]);

  // Get unique sources
  const sources = React.useMemo(() => {
    return [...new Set(deals.map(d => d.source))];
  }, [deals]);

  // Count for goals
  const underContractCount = deals.filter(d => d.stage === "under_contract").length;
  const closedCount = deals.filter(d => d.stage === "closed" || d.stage === "sold").length;

  const handleViewDeal = (deal: PipelineDeal) => {
    setSelectedDeal(deal);
  };

  const handleMoveDeal = (dealId: string, newStage: string) => {
    setDeals(prev => prev.map(d => 
      d.id === dealId 
        ? { ...d, stage: newStage, days_in_stage: 0, last_activity: new Date().toISOString() }
        : d
    ));
  };

  const handleNavigateToProperty = () => {
    if (selectedDeal) {
      navigate(`/properties/${selectedDeal.id}`);
    }
  };

  const handleFocusFilterChange = (filter: string | null) => {
    setFocusFilter(filter);
    if (filter) setStalledFilter(false);
  };

  const handleStalledFilterChange = (enabled: boolean) => {
    setStalledFilter(enabled);
    if (enabled) setFocusFilter(null);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Pipeline"
        description="Track and manage deals through your acquisition process"
        actions={
          <div className="flex items-center gap-4">
            {/* Goal Context */}
            <PipelineGoalHeader
              underContractCount={underContractCount}
              underContractGoal={underContractGoal}
              closedCount={closedCount}
              closedGoal={closedGoal}
            />
            <div className="flex items-center gap-2">
              <GoalSettingsDialog>
                <Button variant="outline" size="sm" icon={<Target />}>
                  Goals
                </Button>
              </GoalSettingsDialog>
              <Button variant="secondary" size="sm" icon={<RefreshCw />}>
                Sync
              </Button>
              <Button variant="primary" size="sm" icon={<Plus />}>
                Add Deal
              </Button>
            </div>
          </div>
        }
      />

      {/* Pipeline Value Cards - matching Dashboard exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PipelineValueCard
          title="Leads"
          subtitle="New Opportunities"
          count={pipelineValueStats?.leads.count || 0}
          totalValue={pipelineValueStats?.leads.totalValue || 0}
          profitPotential={pipelineValueStats?.leads.profitPotential || 0}
          icon={Users}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          isLoading={pipelineValueLoading}
          onClick={() => navigate("/properties?status=new,contacted,appointment")}
          goal={goals.leadsGoal}
          actionInsight={insights?.leadsInsight}
        />
        <PipelineValueCard
          title="Offers"
          subtitle="Active Proposals"
          count={pipelineValueStats?.offers.count || 0}
          totalValue={pipelineValueStats?.offers.totalValue || 0}
          profitPotential={pipelineValueStats?.offers.profitPotential || 0}
          icon={FileText}
          iconBg="bg-amber-100"
          iconColor="text-amber-500"
          isLoading={pipelineValueLoading}
          onClick={() => navigate("/properties?status=offer_made,negotiating")}
          goal={goals.offersGoal}
          contextLine={pipelineValueStats?.offers.count && pipelineValueStats.offers.count > 0 
            ? `${pipelineValueStats.offers.count} ${pipelineValueStats.offers.count === 1 ? "Offer" : "Offers"} Awaiting Response` 
            : undefined}
          contextIcon={Hourglass}
          contextSeverity="attention"
        />
        <PipelineValueCard
          title="Contracts"
          subtitle="Secured Deals"
          count={pipelineValueStats?.contracted.count || 0}
          totalValue={pipelineValueStats?.contracted.totalValue || 0}
          profitPotential={pipelineValueStats?.contracted.profitPotential || 0}
          icon={Handshake}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          valueLabel="Revenue Secured"
          isLoading={pipelineValueLoading}
          onClick={() => navigate("/pipeline?filter=under_contract")}
          goal={goals.contractsGoal}
          variant="calm"
          nextExpectedClose={pipelineValueStats?.contracted.count && pipelineValueStats.contracted.count > 0 ? 14 : undefined}
        />
        <PipelineValueCard
          title="Sold"
          subtitle="Closed Deals"
          count={pipelineValueStats?.sold.count || 0}
          totalValue={pipelineValueStats?.sold.totalValue || 0}
          profitPotential={pipelineValueStats?.sold.profitPotential || 0}
          icon={BadgeDollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-500"
          profitLabel="Realized Profit"
          isLoading={pipelineValueLoading}
          onClick={() => navigate("/properties?status=closed")}
          goal={goals.soldGoal}
          variant="celebration"
        />
      </div>

      {/* Focus Strip */}
      <FocusStrip 
        deals={deals}
        stages={PIPELINE_STAGES}
        activeFilter={focusFilter}
        onFilterChange={handleFocusFilterChange}
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map(source => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="secondary" size="sm" icon={<SlidersHorizontal />}>
          Filter
        </Button>
        {(focusFilter || stalledFilter) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setFocusFilter(null); setStalledFilter(false); }}
            className="text-muted-foreground"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => (
          <StageColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            allDeals={deals}
            onViewDeal={handleViewDeal}
            onMoveDeal={handleMoveDeal}
          />
        ))}
      </div>

      {/* Deal Detail Modal */}
      <Dialog open={!!selectedDeal} onOpenChange={(open) => !open && setSelectedDeal(null)}>
        <DialogContent className="max-w-lg overflow-visible">
          {selectedDeal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-brand" />
                  {selectedDeal.address}
                </DialogTitle>
                <DialogDescription>
                  {selectedDeal.city}, {selectedDeal.state} {selectedDeal.zip}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 px-6 py-4">
                {/* Stage & Score */}
                <div className="flex items-center gap-3">
                  <Badge className={cn(
                    "text-white",
                    PIPELINE_STAGES.find(s => s.id === selectedDeal.stage)?.color
                  )}>
                    {PIPELINE_STAGES.find(s => s.id === selectedDeal.stage)?.label}
                  </Badge>
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-small font-medium",
                    getLeadScoreBg(selectedDeal.lead_score),
                    getLeadScoreColor(selectedDeal.lead_score)
                  )}>
                    <Target className="h-4 w-4" />
                    Lead Score: {selectedDeal.lead_score}
                  </div>
                </div>

                {/* Financials */}
                <Card className="p-4">
                  <h4 className="text-small font-semibold mb-3">Deal Numbers</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-tiny text-content-tertiary">Asking Price</p>
                      <p className="text-lg font-bold">${selectedDeal.asking_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-tiny text-content-tertiary">ARV</p>
                      <p className="text-lg font-bold">${selectedDeal.arv.toLocaleString()}</p>
                    </div>
                    {selectedDeal.offer_amount && (
                      <div>
                        <p className="text-tiny text-content-tertiary">Our Offer</p>
                        <p className="text-lg font-bold text-success">${selectedDeal.offer_amount.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-tiny text-content-tertiary">Equity</p>
                      <p className={cn("text-lg font-bold", selectedDeal.equity_percentage >= 20 ? "text-success" : "")}>
                        {selectedDeal.equity_percentage}%
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Property Details */}
                <Card className="p-4">
                  <h4 className="text-small font-semibold mb-3">Property Details</h4>
                  <div className="flex items-center gap-4 text-small text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Home className="h-4 w-4" />
                      {selectedDeal.property_type}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4" />
                      {selectedDeal.beds} bed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4" />
                      {selectedDeal.baths} bath
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Square className="h-4 w-4" />
                      {selectedDeal.sqft.toLocaleString()} sqft
                    </span>
                  </div>
                </Card>
                <Card className="p-4">
                  <h4 className="text-small font-semibold mb-3">Contact</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedDeal.contact_name}</p>
                      <Badge variant="secondary" size="sm">{selectedDeal.contact_type}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {selectedDeal.contact_phone && (
                        <Button variant="secondary" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      {selectedDeal.contact_email && (
                        <Button variant="secondary" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Notes */}
                {selectedDeal.notes && (
                  <div>
                    <h4 className="text-small font-semibold mb-2">Notes</h4>
                    <p className="text-small text-content-secondary">{selectedDeal.notes}</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="flex items-center gap-4 text-tiny text-content-tertiary">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Added {formatDistanceToNow(new Date(selectedDeal.created_at), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last activity {formatDistanceToNow(new Date(selectedDeal.last_activity), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="secondary" onClick={() => setSelectedDeal(null)}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleNavigateToProperty}>
                  View Full Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
