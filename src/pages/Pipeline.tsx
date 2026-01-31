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
  Kanban,
  Plus,
  Search,
  Filter,
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
  CheckCircle2,
  XCircle,
  Timer,
  Target,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Pipeline stages configuration
const PIPELINE_STAGES = [
  { 
    id: "lead", 
    label: "New Leads", 
    color: "bg-info", 
    description: "Fresh leads requiring qualification",
    targetDays: 2
  },
  { 
    id: "contacted", 
    label: "Contacted", 
    color: "bg-warning", 
    description: "Initial contact made",
    targetDays: 5
  },
  { 
    id: "analyzing", 
    label: "Analyzing", 
    color: "bg-brand", 
    description: "Running comps & deal analysis",
    targetDays: 3
  },
  { 
    id: "offer_made", 
    label: "Offer Made", 
    color: "bg-purple-500", 
    description: "Offer submitted, awaiting response",
    targetDays: 7
  },
  { 
    id: "negotiating", 
    label: "Negotiating", 
    color: "bg-orange-500", 
    description: "Active negotiation in progress",
    targetDays: 14
  },
  { 
    id: "under_contract", 
    label: "Under Contract", 
    color: "bg-success", 
    description: "Contract signed, heading to close",
    targetDays: 30
  },
  { 
    id: "closed", 
    label: "Closed", 
    color: "bg-emerald-600", 
    description: "Deal completed",
    targetDays: 0
  },
  { 
    id: "sold", 
    label: "Sold", 
    color: "bg-chart-4", 
    description: "Property sold and funds received",
    targetDays: 0
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
    stage: "lead",
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
    stage: "analyzing",
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
    days_in_stage: 12,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    notes: "Contract signed, closing in 18 days",
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
    stage: "lead",
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

function DealCard({ 
  deal, 
  onView, 
  onMove,
  stageConfig 
}: { 
  deal: PipelineDeal; 
  onView: () => void;
  onMove: (newStage: string) => void;
  stageConfig: typeof PIPELINE_STAGES[0];
}) {
  const isOverdue = deal.days_in_stage > stageConfig.targetDays && stageConfig.targetDays > 0;
  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === deal.stage);
  const nextStage = PIPELINE_STAGES[currentStageIndex + 1];
  const prevStage = PIPELINE_STAGES[currentStageIndex - 1];

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5",
        isOverdue && "border-warning/50 bg-warning/5"
      )}
      onClick={onView}
    >
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand flex-shrink-0" />
              <span className="text-small font-semibold truncate">{deal.address}</span>
            </div>
            <div className="flex items-center gap-1 text-tiny text-content-tertiary mt-0.5">
              <MapPin className="h-3 w-3" />
              <span>{deal.city}, {deal.state}</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[100]">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="h-4 w-4 mr-2" />
                Call Contact
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {nextStage && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(nextStage.id); }}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Move to {nextStage.label}
                </DropdownMenuItem>
              )}
              {prevStage && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(prevStage.id); }}>
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Move to {prevStage.label}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove from Pipeline
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price & Equity */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" size="sm" className="text-tiny">
            ${(deal.asking_price / 1000).toFixed(0)}k
          </Badge>
          {deal.offer_amount && (
            <Badge variant="success" size="sm" className="text-tiny">
              Offer: ${(deal.offer_amount / 1000).toFixed(0)}k
            </Badge>
          )}
          <Badge 
            variant="secondary" 
            size="sm" 
            className={cn("text-tiny", deal.equity_percentage >= 20 ? "bg-success/10 text-success" : "")}
          >
            {deal.equity_percentage}% equity
          </Badge>
        </div>

        {/* Lead Score */}
        <div className="flex items-center justify-between mb-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-tiny font-medium",
            getLeadScoreBg(deal.lead_score),
            getLeadScoreColor(deal.lead_score)
          )}>
            <Target className="h-3 w-3" />
            <span>Score: {deal.lead_score}</span>
          </div>
          <Badge variant="secondary" size="sm" className="text-tiny">
            {deal.source}
          </Badge>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2 text-tiny text-content-secondary">
          <User className="h-3 w-3" />
          <span className="truncate">{deal.contact_name}</span>
          <Badge variant="secondary" size="sm" className="text-tiny">
            {deal.contact_type}
          </Badge>
        </div>

        {/* Time in Stage */}
        <div className={cn(
          "flex items-center gap-1 mt-2 text-tiny",
          isOverdue ? "text-warning" : "text-content-tertiary"
        )}>
          <Timer className="h-3 w-3" />
          <span>
            {deal.days_in_stage === 0 ? "Today" : `${deal.days_in_stage}d in stage`}
          </span>
          {isOverdue && (
            <AlertCircle className="h-3 w-3 ml-auto" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StageColumn({ 
  stage, 
  deals, 
  onViewDeal,
  onMoveDeal,
}: { 
  stage: typeof PIPELINE_STAGES[0]; 
  deals: PipelineDeal[];
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
              <div className={cn("h-3 w-3 rounded-full", stage.color)} />
              <span className="text-small font-semibold">{stage.label}</span>
              <Badge variant="secondary" size="sm">{deals.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Stage Stats */}
          <div className="flex items-center gap-3 text-tiny text-content-tertiary">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${(totalValue / 1000).toFixed(0)}k
            </span>
            {stage.targetDays > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Avg: {avgDaysInStage}d
              </span>
            )}
            {overdueCount > 0 && (
              <span className="flex items-center gap-1 text-warning">
                <AlertCircle className="h-3 w-3" />
                {overdueCount} overdue
              </span>
            )}
          </div>
        </div>

        {/* Deals */}
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="p-2 space-y-2">
            {deals.length === 0 ? (
              <div className="text-center py-8 text-content-tertiary">
                <Kanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-tiny">No deals in this stage</p>
              </div>
            ) : (
              deals.map((deal) => (
                <DealCard 
                  key={deal.id} 
                  deal={deal} 
                  onView={() => onViewDeal(deal)}
                  onMove={(newStage) => onMoveDeal(deal.id, newStage)}
                  stageConfig={stage}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function PipelineStats({ deals }: { deals: PipelineDeal[] }) {
  const totalDeals = deals.length;
  const totalPipelineValue = deals.reduce((sum, d) => sum + (d.offer_amount || d.asking_price), 0);
  const underContract = deals.filter(d => d.stage === "under_contract").length;
  const avgLeadScore = totalDeals > 0 
    ? Math.round(deals.reduce((sum, d) => sum + d.lead_score, 0) / totalDeals)
    : 0;
  const hotLeads = deals.filter(d => d.lead_score >= 80).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-tiny text-content-tertiary">Hot Leads (80+)</p>
            <p className="text-xl font-bold">{hotLeads}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Pipeline() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState<string>("all");
  const [selectedDeal, setSelectedDeal] = React.useState<PipelineDeal | null>(null);
  const [deals, setDeals] = React.useState<PipelineDeal[]>(MOCK_DEALS);

  // Filter deals
  const filteredDeals = React.useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = !search || 
        deal.address.toLowerCase().includes(search.toLowerCase()) ||
        deal.contact_name.toLowerCase().includes(search.toLowerCase()) ||
        deal.city.toLowerCase().includes(search.toLowerCase());
      const matchesSource = sourceFilter === "all" || deal.source === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [deals, search, sourceFilter]);

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

  return (
    <PageLayout>
      <PageHeader
        title="Pipeline"
        description="Track and manage deals through your acquisition process"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw />}>
              Sync
            </Button>
            <Button variant="primary" size="sm" icon={<Plus />}>
              Add Deal
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <PipelineStats deals={filteredDeals} />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
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
        <Button variant="secondary" size="sm" icon={<Filter />}>
          More Filters
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map(stage => (
          <StageColumn
            key={stage.id}
            stage={stage}
            deals={dealsByStage[stage.id] || []}
            onViewDeal={handleViewDeal}
            onMoveDeal={handleMoveDeal}
          />
        ))}
      </div>

      {/* Deal Detail Modal */}
      <Dialog open={!!selectedDeal} onOpenChange={(open) => !open && setSelectedDeal(null)}>
        <DialogContent className="max-w-lg">
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

              <div className="space-y-4">
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
                  <div className="flex items-center gap-4 text-small">
                    <span>{selectedDeal.property_type}</span>
                    <span>{selectedDeal.beds} bed</span>
                    <span>{selectedDeal.baths} bath</span>
                    <span>{selectedDeal.sqft.toLocaleString()} sqft</span>
                  </div>
                </Card>

                {/* Contact */}
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
