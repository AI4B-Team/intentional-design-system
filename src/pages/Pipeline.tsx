import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
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
  List,
  Plus,
  Search,
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
  ChevronUp,
  ChevronDown,
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
  Ruler,
  Settings,
  LayoutGrid,
  Columns,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { usePipelineDeals, useUpdatePipelineDealStage, useCreatePipelineDeal } from "@/hooks/usePipelineDeals";
import { useUnifiedActions } from "@/hooks/useUnifiedActions";
import type { PipelineDeal } from "@/hooks/usePipelineDeals";
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

// MOCK_DEALS removed - now using usePipelineDeals hook to fetch real data from the database
// PipelineDeal interface moved to src/hooks/usePipelineDeals.ts

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

// Sortable wrapper for PipelineDealCard
function SortableDealCard({
  deal,
  stageConfig,
  nextStage,
  prevStage,
  onView,
  onMove,
}: {
  deal: PipelineDeal;
  stageConfig: typeof PIPELINE_STAGES[0];
  nextStage?: typeof PIPELINE_STAGES[0];
  prevStage?: typeof PIPELINE_STAGES[0];
  onView: () => void;
  onMove: (newStage: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PipelineDealCard
        deal={deal}
        stageConfig={stageConfig}
        nextStage={nextStage}
        prevStage={prevStage}
        onView={onView}
        onMove={onMove}
      />
    </div>
  );
}

function StageColumn({ 
  stage, 
  deals,
  allDeals, 
  onViewDeal,
  onMoveDeal,
  onAddDeal,
  isDropTarget,
  activeDragId,
}: { 
  stage: typeof PIPELINE_STAGES[0]; 
  deals: PipelineDeal[];
  allDeals: PipelineDeal[];
  onViewDeal: (deal: PipelineDeal) => void;
  onMoveDeal: (dealId: string, newStage: string) => void;
  onAddDeal: (stageId: string) => void;
  isDropTarget: boolean;
  activeDragId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
    data: { stageId: stage.id },
  });

  // Check if we're dragging a card FROM this column (to show where it's leaving)
  const isDragSource = activeDragId ? deals.some(d => d.id === activeDragId) : false;

  const totalValue = deals.reduce((sum, d) => sum + (d.offer_amount || d.asking_price), 0);
  const avgDaysInStage = deals.length > 0 
    ? Math.round(deals.reduce((sum, d) => sum + d.days_in_stage, 0) / deals.length)
    : 0;
  const overdueCount = deals.filter(d => d.days_in_stage > stage.targetDays && stage.targetDays > 0).length;

  const dealIds = deals.map(d => d.id);

  // Show enhanced visual when this column is the drop target
  const showDropIndicator = isDropTarget && !isDragSource;

  return (
    <div className="flex-shrink-0 w-72" data-stage-id={stage.id}>
      <div className={cn(
        "bg-surface-secondary rounded-lg border transition-all duration-200",
        showDropIndicator 
          ? "border-brand border-2 bg-brand/10 shadow-xl ring-2 ring-brand/30" 
          : isOver 
            ? "border-primary border-2 bg-primary/5 shadow-lg" 
            : "border-border-subtle",
        isDragSource && activeDragId && "opacity-75"
      )}>
        {/* Stage Header */}
        <div className="p-3 border-b border-border-subtle">
          {/* Full-width white box containing all header elements */}
          <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-md shadow-sm border border-border-subtle">
            {/* Left: icon, label, count */}
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
            
            {/* Right: + and 3-dot icons aligned far right */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-brand transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddDeal(stage.id);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-tiny">Add deal to {stage.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onAddDeal(stage.id)}>
                    Add Deal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    View All in {stage.label}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Deals */}
        <div 
          ref={setNodeRef}
          className={cn(
            "p-2 pr-4 space-y-2 min-h-[100px] transition-all duration-200",
            showDropIndicator && "bg-brand/5",
            isOver && !showDropIndicator && "bg-primary/5"
          )}
        >
          {/* Drop indicator at top when dragging to this column */}
          {showDropIndicator && (
            <div className="flex items-center gap-2 p-3 border-2 border-dashed border-brand rounded-lg bg-brand/10 mb-2 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-brand" />
              <span className="text-sm font-medium text-brand">Drop here</span>
            </div>
          )}
          
          <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
            {deals.length === 0 && !showDropIndicator ? (
              <div className={cn(
                "transition-all duration-200",
                isOver && "opacity-50"
              )}>
                <EmptyStageGuide stageId={stage.id} />
              </div>
            ) : (
              deals.map((deal) => {
                const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === deal.stage);
                const nextStage = PIPELINE_STAGES[currentStageIndex + 1];
                const prevStage = PIPELINE_STAGES[currentStageIndex - 1];
                return (
                  <SortableDealCard 
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
          </SortableContext>
        </div>
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
  const { data: pipelineValueStatsRaw, isLoading: pipelineValueLoading } = usePipelineValueStats();
  const { data: insights } = useDashboardInsights();
  
  // Fetch real deals from database
  const { data: pipelineDeals = [], isLoading: dealsLoading } = usePipelineDeals();
  const updateDealStage = useUpdatePipelineDealStage();
  const createDeal = useCreatePipelineDeal();

  // Fetch pending unified actions to show counts on deal cards
  const { data: pendingActions = [] } = useUnifiedActions({
    status: ["pending", "overdue"],
  });

  // Build a map of property_id -> pending action count
  const actionCountByProperty = React.useMemo(() => {
    const map: Record<string, number> = {};
    pendingActions.forEach((action) => {
      if (action.property_id) {
        map[action.property_id] = (map[action.property_id] || 0) + 1;
      }
    });
    return map;
  }, [pendingActions]);

  // Demo data for visualization when no real data exists - matches Dashboard exactly
  const demoData = {
    leads: { count: 42, totalValue: 7350000, profitPotential: 367500 },
    offers: { count: 12, totalValue: 2100000, profitPotential: 105000 },
    contracted: { count: 8, totalValue: 1400000, profitPotential: 84000 },
    sold: { count: 1, totalValue: 175000, profitPotential: 10500 },
  };

  // Determine if we have real data
  const hasRealData = pipelineValueStatsRaw && (
    (pipelineValueStatsRaw.leads?.count ?? 0) > 0 ||
    (pipelineValueStatsRaw.offers?.count ?? 0) > 0 ||
    (pipelineValueStatsRaw.contracted?.count ?? 0) > 0 ||
    (pipelineValueStatsRaw.sold?.count ?? 0) > 0
  );
  
  const pipelineValueStats = hasRealData ? pipelineValueStatsRaw : demoData;
  const [search, setSearch] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState<string>("all");
  const [selectedDeal, setSelectedDeal] = React.useState<PipelineDeal | null>(null);
  // Use fetched deals from database instead of local state
  const deals = pipelineDeals;
  const [focusFilter, setFocusFilter] = React.useState<string | null>(null);
  const [stalledFilter, setStalledFilter] = React.useState(false);
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
  const [overStageId, setOverStageId] = React.useState<string | null>(null);
  const [addDealStage, setAddDealStage] = React.useState<string | null>(null);
  const [isKpiExpanded, setIsKpiExpanded] = React.useState(true);
  const [showCompactCards, setShowCompactCards] = React.useState(false);
  const [showDealCounts, setShowDealCounts] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<"kanban" | "list">("kanban");
  const [newDealForm, setNewDealForm] = React.useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    asking_price: "",
    arv: "",
    contact_name: "",
    beds: "3",
    baths: "2",
    sqft: "1500",
  });

  // DnD sensors with activation constraints for smooth dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Get the dragged deal for overlay
  const activeDeal = React.useMemo(() => {
    if (!activeDragId) return null;
    return deals.find(d => d.id === activeDragId) || null;
  }, [activeDragId, deals]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (!over) {
      setOverStageId(null);
      return;
    }

    const overId = over.id as string;
    
    // If hovering over a stage column directly
    if (overId.startsWith('stage-')) {
      setOverStageId(overId.replace('stage-', ''));
      return;
    }
    
    // If hovering over a card, find its stage
    const overDeal = deals.find(d => d.id === overId);
    if (overDeal) {
      setOverStageId(overDeal.stage);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setOverStageId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Check if dropped on a stage (for empty columns)
    if (overId.startsWith('stage-')) {
      const stageId = overId.replace('stage-', '');
      const activeDeal = deals.find(d => d.id === activeId);
      if (activeDeal && activeDeal.stage !== stageId) {
        updateDealStage.mutate({ id: activeId, stage: stageId });
      }
      return;
    }

    // Find what stage the "over" element belongs to
    const overDeal = deals.find(d => d.id === overId);
    if (overDeal) {
      const activeDeal = deals.find(d => d.id === activeId);
      if (activeDeal && activeDeal.stage !== overDeal.stage) {
        updateDealStage.mutate({ id: activeId, stage: overDeal.stage });
      }
    }
  };

  const handleViewDeal = (deal: PipelineDeal) => {
    setSelectedDeal(deal);
  };

  const handleMoveDeal = (dealId: string, newStage: string) => {
    updateDealStage.mutate({ id: dealId, stage: newStage });
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

  const handleAddDeal = (stageId: string) => {
    setAddDealStage(stageId);
    setNewDealForm({
      address: "",
      city: "",
      state: "",
      zip: "",
      asking_price: "",
      arv: "",
      contact_name: "",
      beds: "3",
      baths: "2",
      sqft: "1500",
    });
  };

  const handleCreateDeal = () => {
    if (!addDealStage || !newDealForm.address) return;
    
    createDeal.mutate({
      address: newDealForm.address,
      city: newDealForm.city || "Austin",
      state: newDealForm.state || "TX",
      zip: newDealForm.zip || "78701",
      status: addDealStage,
      estimated_value: parseInt(newDealForm.asking_price) || 250000,
      arv: parseInt(newDealForm.arv) || 300000,
      owner_name: newDealForm.contact_name || "New Contact",
      beds: parseInt(newDealForm.beds) || 3,
      baths: parseInt(newDealForm.baths) || 2,
      sqft: parseInt(newDealForm.sqft) || 1500,
    });
    
    setAddDealStage(null);
  };

  return (
    <PageLayout fullWidth>
      <div className="px-4 lg:px-6 pt-6 flex flex-col flex-1">
      <PageHeader
        title="Pipeline"
        description="Track and manage deals through your acquisition process"
        className="!mb-4 !pb-0 border-none"
      />

      {/* Search Bar + Action Buttons */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address, contact, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="inline-flex rounded-lg border border-border-subtle p-1 bg-muted/30">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className={cn("gap-1.5 px-3", viewMode === "kanban" && "bg-white shadow-sm")}
              onClick={() => setViewMode("kanban")}
            >
              <Kanban className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className={cn("gap-1.5 px-3", viewMode === "list" && "bg-white shadow-sm")}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
          <Button variant="secondary" size="sm" icon={<RefreshCw />}>
            Sync
          </Button>
          <GoalSettingsDialog>
            <Button variant="outline" size="sm" icon={<Target />}>
              Goals
            </Button>
          </GoalSettingsDialog>
          <Button variant="primary" size="sm" icon={<Plus />} onClick={() => handleAddDeal("new")}>
            Add Deal
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={() => setIsKpiExpanded(!isKpiExpanded)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  {isKpiExpanded ? "Hide KPI Cards" : "Show KPI Cards"}
                </span>
                {isKpiExpanded && <CheckCircle2 className="h-4 w-4 text-success" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowCompactCards(!showCompactCards)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Kanban className="h-4 w-4" />
                  {showCompactCards ? "Detailed Cards" : "Compact Cards"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Pipeline Value Cards - Collapsible */}
      {isKpiExpanded && (
        <div className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
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
        </div>
      )}

      {/* Focus Strip */}
      <div>
        <FocusStrip 
          deals={deals}
          stages={PIPELINE_STAGES}
          activeFilter={focusFilter}
          onFilterChange={handleFocusFilterChange}
        />
      </div>

      {/* Kanban Board */}
      {viewMode === "kanban" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-y-visible overflow-x-auto pb-4">
            {PIPELINE_STAGES.map(stage => (
              <StageColumn
                key={stage.id}
                stage={stage}
                deals={dealsByStage[stage.id] || []}
                allDeals={deals}
                onViewDeal={handleViewDeal}
                onMoveDeal={handleMoveDeal}
                onAddDeal={handleAddDeal}
                isDropTarget={overStageId === stage.id && activeDragId !== null}
                activeDragId={activeDragId}
              />
            ))}
          </div>
          
          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeDeal ? (
              <div className="rotate-3 scale-105 opacity-90">
                <PipelineDealCard
                  deal={activeDeal}
                  stageConfig={PIPELINE_STAGES.find(s => s.id === activeDeal.stage) || PIPELINE_STAGES[0]}
                  onView={() => {}}
                  onMove={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-surface-secondary shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">Property</th>
                  <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">Type</th>
                  <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">Stage</th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Beds/Baths</th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Sq Ft</th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Price</th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">ARV</th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Score</th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Equity</th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Days</th>
                  <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">Contact</th>
                  <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-muted-foreground">
                      No deals found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal, index) => {
                    const stageConfig = PIPELINE_STAGES.find(s => s.id === deal.stage);
                    const canCall = !!deal.contact_phone;
                    const canText = !!deal.contact_phone;
                    const canEmail = !!deal.contact_email;
                    const formatPhoneForTel = (phone?: string) => {
                      if (!phone) return "";
                      const digits = phone.replace(/[^\d+]/g, "");
                      return digits.startsWith("+") ? digits : `+1${digits}`;
                    };
                    const homeTypeLabel = deal.property_type
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (c: string) => c.toUpperCase()) || "—";

                    return (
                      <tr
                        key={deal.id}
                        onClick={() => handleViewDeal(deal)}
                        className={cn(
                          "h-14 cursor-pointer transition-colors group",
                          index % 2 === 0 ? "bg-white" : "bg-surface-secondary/50",
                          "hover:bg-brand-accent/5"
                        )}
                      >
                        {/* Property */}
                        <td className="px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-body font-medium text-content group-hover:text-brand-accent transition-colors whitespace-nowrap">
                                {deal.address}
                              </div>
                              <div className="flex items-center gap-1 text-small text-content-secondary whitespace-nowrap">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                {deal.city}, {deal.state} {deal.zip}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Home Type */}
                        <td className="px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-success/15 text-success border border-success/20">
                            {homeTypeLabel}
                          </span>
                        </td>
                        {/* Stage */}
                        <td className="px-4 whitespace-nowrap">
                          <Badge className={cn("text-white text-[10px]", stageConfig?.color)}>
                            {stageConfig?.label}
                          </Badge>
                        </td>
                        {/* Beds/Baths */}
                        <td className="px-4 text-center text-body tabular-nums">
                          <span className="flex items-center justify-center gap-2 text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{deal.beds}</span>
                            <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{deal.baths}</span>
                          </span>
                        </td>
                        {/* Sq Ft */}
                        <td className="px-4 text-center text-body tabular-nums">
                          {deal.sqft?.toLocaleString() || "—"}
                        </td>
                        {/* Price */}
                        <td className="px-4 text-center">
                          <span className="text-body font-bold text-success tabular-nums">
                            ${deal.asking_price.toLocaleString()}
                          </span>
                        </td>
                        {/* ARV */}
                        <td className="px-4 text-center text-body tabular-nums text-muted-foreground">
                          ${deal.arv.toLocaleString()}
                        </td>
                        {/* Score */}
                        <td className="px-4 text-center">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-small font-medium",
                            deal.lead_score >= 80 ? "bg-success/10 text-success" :
                            deal.lead_score >= 60 ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          )}>
                            {deal.lead_score}
                          </span>
                        </td>
                        {/* Equity */}
                        <td className="px-4 text-center">
                          <span className={cn(
                            "text-body font-medium",
                            deal.equity_percentage >= 25 ? "text-success" :
                            deal.equity_percentage >= 15 ? "text-warning" :
                            "text-destructive"
                          )}>
                            {deal.equity_percentage}%
                          </span>
                        </td>
                        {/* Days in Stage */}
                        <td className="px-4 text-center">
                          <div className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
                            deal.days_in_stage >= 3
                              ? "bg-destructive/15 text-destructive"
                              : deal.days_in_stage >= 2
                                ? "bg-warning/15 text-warning"
                                : "bg-muted text-muted-foreground"
                          )}>
                            <Clock className="h-3 w-3" />
                            {deal.days_in_stage === 0 ? "Today" : `${deal.days_in_stage}D`}
                          </div>
                        </td>
                        {/* Contact */}
                        <td className="px-4 whitespace-nowrap">
                          <div className="text-body font-medium">{deal.contact_name}</div>
                          <div className="text-tiny text-content-secondary">{deal.contact_type}</div>
                        </td>
                        {/* Actions */}
                        <td className="px-4">
                          <div className="flex items-center justify-center gap-0.5">
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (deal.contact_phone) {
                                        window.open(`tel:${formatPhoneForTel(deal.contact_phone)}`);
                                      }
                                    }}
                                  >
                                    <Phone className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>{canCall ? `Call ${deal.contact_phone}` : "No Phone"}</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (deal.contact_phone) {
                                        window.open(`sms:${formatPhoneForTel(deal.contact_phone)}`);
                                      }
                                    }}
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>{canText ? "Text Seller" : "No Phone"}</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (deal.contact_email) {
                                        window.open(`mailto:${deal.contact_email}`);
                                      }
                                    }}
                                  >
                                    <Mail className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>{canEmail ? `Email ${deal.contact_email}` : "No Email"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deal Detail Modal */}
      <Dialog open={!!selectedDeal} onOpenChange={(open) => !open && setSelectedDeal(null)}>
        <DialogContent className="max-w-lg overflow-visible top-[8%] translate-y-0">
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

              <div className="space-y-3 px-6 py-3">
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

                <Card className="p-3">
                  <h4 className="text-small font-semibold mb-2">Deal Numbers</h4>
                  <div className="grid grid-cols-2 gap-3">
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

                <Card className="p-3">
                  <h4 className="text-small font-semibold mb-2">Property Details</h4>
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
                      <Ruler className="h-4 w-4" />
                      {selectedDeal.sqft.toLocaleString()} sqft
                    </span>
                  </div>
                </Card>
                <Card className="p-3">
                  <h4 className="text-small font-semibold mb-2">Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedDeal.contact_name}</p>
                        <Badge variant="secondary" size="sm" className="rounded-md uppercase">{selectedDeal.contact_type}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Call {selectedDeal.contact_phone || "(512) 555-0147"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Email {selectedDeal.contact_email || `${selectedDeal.contact_name.toLowerCase().replace(/\s+/g, '.')}@email.com`}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="space-y-1 text-small">
                      <div className="flex items-center gap-2 text-content-secondary">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{selectedDeal.contact_phone || "(512) 555-0147"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-content-secondary">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{selectedDeal.contact_email || `${selectedDeal.contact_name.toLowerCase().replace(/\s+/g, '.')}@email.com`}</span>
                      </div>
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

      {/* Add Deal Dialog */}
      <Dialog open={!!addDealStage} onOpenChange={(open) => !open && setAddDealStage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand" />
              Add New Deal
            </DialogTitle>
            <DialogDescription>
              Adding to: {PIPELINE_STAGES.find(s => s.id === addDealStage)?.label || "Pipeline"}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Property Address *</label>
              <Input
                placeholder="123 Main Street"
                value={newDealForm.address}
                onChange={(e) => setNewDealForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  placeholder="Austin"
                  value={newDealForm.city}
                  onChange={(e) => setNewDealForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input
                  placeholder="TX"
                  value={newDealForm.state}
                  onChange={(e) => setNewDealForm(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">ZIP</label>
                <Input
                  placeholder="78701"
                  value={newDealForm.zip}
                  onChange={(e) => setNewDealForm(prev => ({ ...prev, zip: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Asking Price</label>
                <Input
                  type="number"
                  placeholder="250000"
                  value={newDealForm.asking_price}
                  onChange={(e) => setNewDealForm(prev => ({ ...prev, asking_price: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">ARV</label>
                <Input
                  type="number"
                  placeholder="300000"
                  value={newDealForm.arv}
                  onChange={(e) => setNewDealForm(prev => ({ ...prev, arv: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Contact Name</label>
              <Input
                placeholder="John Smith"
                value={newDealForm.contact_name}
                onChange={(e) => setNewDealForm(prev => ({ ...prev, contact_name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Beds</label>
                <Input
                  type="number"
                  value={newDealForm.beds}
                  onChange={(e) => setNewDealForm(prev => ({ ...prev, beds: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Baths</label>
                <Input
                  type="number"
                  value={newDealForm.baths}
                  onChange={(e) => setNewDealForm(prev => ({ ...prev, baths: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sqft</label>
                <Input
                  type="number"
                  value={newDealForm.sqft}
                  onChange={(e) => setNewDealForm(prev => ({ ...prev, sqft: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setAddDealStage(null)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCreateDeal}
              disabled={!newDealForm.address}
            >
              Add Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </PageLayout>
  );
}
