import * as React from "react";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Kanban,
  List,
  Plus,
  Search,
  FileText,
  DollarSign,
  Target,
  RefreshCw,
  Users,
  Handshake,
  BadgeDollarSign,
  Settings,
  LayoutGrid,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePipelineDeals, useUpdatePipelineDealStage, useCreatePipelineDeal } from "@/hooks/usePipelineDeals";
import { useUnifiedActions } from "@/hooks/useUnifiedActions";
import type { PipelineDeal } from "@/hooks/usePipelineDeals";
import { useAuth } from "@/contexts/AuthContext";
import { usePipelineValueStats } from "@/hooks/usePipelineValueStats";
import { useDashboardInsights } from "@/hooks/useDashboardInsights";
import { GoalSettingsDialog, useGoals } from "@/components/dashboard/GoalSettingsDialog";
import { Hourglass } from "lucide-react";
import {
  FocusStrip,
  getFocusFilteredDeals,
  StallingStat,
  getStalledDeals,
} from "@/components/pipeline";
import { PipelineDealCard } from "@/components/pipeline/PipelineDealCard";
import { PipelineValueCard } from "@/components/pipeline/PipelineValueCard";
import { PIPELINE_STAGES } from "@/components/pipeline/pipeline-config";
import { StageColumn } from "@/components/pipeline/StageColumn";
import { PipelineListView } from "@/components/pipeline/PipelineListView";
import { DealDetailModal } from "@/components/pipeline/DealDetailModal";
import { AddDealDialog, type AddDealFormData } from "@/components/pipeline/AddDealDialog";
import { demoPipelineValueData } from "@/components/dashboard/dashboard-demo-data";

export default function Pipeline() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const goals = useGoals();
  const { data: pipelineValueStatsRaw, isLoading: pipelineValueLoading } = usePipelineValueStats();
  const { data: insights } = useDashboardInsights();

  const { data: pipelineDeals = [], isLoading: dealsLoading } = usePipelineDeals();
  const updateDealStage = useUpdatePipelineDealStage();
  const createDeal = useCreatePipelineDeal();

  const { data: pendingActions = [] } = useUnifiedActions({ status: ["pending", "overdue"] });

  const hasRealData = pipelineValueStatsRaw && (
    (pipelineValueStatsRaw.leads?.count ?? 0) > 0 ||
    (pipelineValueStatsRaw.offers?.count ?? 0) > 0 ||
    (pipelineValueStatsRaw.contracted?.count ?? 0) > 0 ||
    (pipelineValueStatsRaw.sold?.count ?? 0) > 0
  );
  const pipelineValueStats = hasRealData ? pipelineValueStatsRaw : demoPipelineValueData;

  const [search, setSearch] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState<string>("all");
  const [selectedDeal, setSelectedDeal] = React.useState<PipelineDeal | null>(null);
  const deals = pipelineDeals;
  const [focusFilter, setFocusFilter] = React.useState<string | null>(null);
  const [stalledFilter, setStalledFilter] = React.useState(false);
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
  const [overStageId, setOverStageId] = React.useState<string | null>(null);
  const [addDealStage, setAddDealStage] = React.useState<string | null>(null);
  const [isKpiExpanded, setIsKpiExpanded] = React.useState(true);
  const [showCompactCards, setShowCompactCards] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"kanban" | "list">("kanban");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    if (focusFilter) filtered = getFocusFilteredDeals(filtered, focusFilter);
    if (stalledFilter) filtered = getStalledDeals(filtered, PIPELINE_STAGES);
    return filtered;
  }, [deals, search, sourceFilter, focusFilter, stalledFilter]);

  const dealsByStage = React.useMemo(() => {
    const grouped: Record<string, PipelineDeal[]> = {};
    PIPELINE_STAGES.forEach(stage => { grouped[stage.id] = filteredDeals.filter(d => d.stage === stage.id); });
    return grouped;
  }, [filteredDeals]);

  const activeDeal = React.useMemo(() =>
    activeDragId ? deals.find(d => d.id === activeDragId) || null : null,
  [activeDragId, deals]);

  const triggerConfetti = () => {
    setTimeout(() => confetti({ particleCount: 60, spread: 80, origin: { x: 0.5, y: 0.4 }, colors: ["#10b981", "#34d399", "#ffffff", "#f59e0b"], zIndex: 9999 }), 100);
  };

  const handleDragStart = (event: DragStartEvent) => setActiveDragId(event.active.id as string);

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) { setOverStageId(null); return; }
    const overId = over.id as string;
    if (overId.startsWith('stage-')) { setOverStageId(overId.replace('stage-', '')); return; }
    const overDeal = deals.find(d => d.id === overId);
    if (overDeal) setOverStageId(overDeal.stage);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setOverStageId(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    let targetStage: string | null = null;
    if (overId.startsWith('stage-')) {
      targetStage = overId.replace('stage-', '');
    } else {
      targetStage = deals.find(d => d.id === overId)?.stage || null;
    }

    if (targetStage) {
      const deal = deals.find(d => d.id === activeId);
      if (deal && deal.stage !== targetStage) {
        updateDealStage.mutate({ id: activeId, stage: targetStage });
        if (targetStage === "closed" || targetStage === "sold") triggerConfetti();
      }
    }
  };

  const handleMoveDeal = (dealId: string, newStage: string) => {
    updateDealStage.mutate({ id: dealId, stage: newStage });
    if (newStage === "closed" || newStage === "sold") triggerConfetti();
  };

  const handleFocusFilterChange = (filter: string | null) => {
    setFocusFilter(filter);
    if (filter) setStalledFilter(false);
  };

  const handleStalledFilterChange = (enabled: boolean) => {
    setStalledFilter(enabled);
    if (enabled) setFocusFilter(null);
  };

  const handleCreateDeal = (form: AddDealFormData) => {
    if (!addDealStage || !form.address) return;
    createDeal.mutate({
      address: form.address,
      city: form.city || "Austin",
      state: form.state || "TX",
      zip: form.zip || "78701",
      status: addDealStage,
      estimated_value: parseInt(form.asking_price) || 250000,
      arv: parseInt(form.arv) || 300000,
      owner_name: form.contact_name || "New Contact",
      beds: parseInt(form.beds) || 3,
      baths: parseInt(form.baths) || 2,
      sqft: parseInt(form.sqft) || 1500,
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

        {/* Search Bar + Actions */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by address, contact, or city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border-subtle p-1 bg-muted/30">
              <Button variant={viewMode === "kanban" ? "secondary" : "ghost"} size="sm" className={cn("gap-1.5 px-3", viewMode === "kanban" && "bg-white shadow-sm")} onClick={() => setViewMode("kanban")}>
                <Kanban className="h-4 w-4" /><span className="hidden sm:inline">Kanban</span>
              </Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" className={cn("gap-1.5 px-3", viewMode === "list" && "bg-white shadow-sm")} onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" /><span className="hidden sm:inline">List</span>
              </Button>
            </div>
            <Button variant="secondary" size="sm" icon={<RefreshCw />}>Sync</Button>
            <GoalSettingsDialog><Button variant="outline" size="sm" icon={<Target />}>Goals</Button></GoalSettingsDialog>
            <Button variant="primary" size="sm" icon={<Plus />} onClick={() => setAddDealStage("new")}>Add Deal</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9"><Settings className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setIsKpiExpanded(!isKpiExpanded)} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" />{isKpiExpanded ? "Hide KPI Cards" : "Show KPI Cards"}</span>
                  {isKpiExpanded && <CheckCircle2 className="h-4 w-4 text-success" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCompactCards(!showCompactCards)} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Kanban className="h-4 w-4" />{showCompactCards ? "Detailed Cards" : "Compact Cards"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* KPI Cards */}
        {isKpiExpanded && (
          <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
              {[
                { title: "Leads", subtitle: "New Opportunities", key: "leads" as const, icon: Users, iconBg: "bg-red-100", iconColor: "text-red-500", goal: goals.leadsGoal, nav: "/properties?status=new,contacted,appointment", insight: insights?.leadsInsight, delay: "0ms" },
                { title: "Offers", subtitle: "Active Proposals", key: "offers" as const, icon: FileText, iconBg: "bg-amber-100", iconColor: "text-amber-500", goal: goals.offersGoal, nav: "/properties?status=offer_made,negotiating", delay: "150ms" },
                { title: "Contracts", subtitle: "Secured Deals", key: "contracted" as const, icon: Handshake, iconBg: "bg-blue-100", iconColor: "text-blue-600", goal: goals.contractsGoal, nav: "/pipeline?filter=under_contract", variant: "calm" as const, delay: "300ms" },
                { title: "Sold", subtitle: "Closed Deals", key: "sold" as const, icon: BadgeDollarSign, iconBg: "bg-emerald-100", iconColor: "text-emerald-500", goal: goals.soldGoal, nav: "/properties?status=closed", variant: "celebration" as const, delay: "450ms" },
              ].map(card => (
                <div key={card.key} className="animate-fade-in min-w-0" style={{ animationDelay: card.delay }}>
                  <PipelineValueCard
                    title={card.title}
                    subtitle={card.subtitle}
                    count={pipelineValueStats?.[card.key]?.count || 0}
                    totalValue={pipelineValueStats?.[card.key]?.totalValue || 0}
                    profitPotential={pipelineValueStats?.[card.key]?.profitPotential || 0}
                    icon={card.icon}
                    iconBg={card.iconBg}
                    iconColor={card.iconColor}
                    isLoading={pipelineValueLoading}
                    onClick={() => navigate(card.nav)}
                    goal={card.goal}
                    actionInsight={card.insight}
                    variant={card.variant}
                    valueLabel={card.key === "contracted" ? "Revenue Secured" : undefined}
                    profitLabel={card.key === "sold" ? "Realized Profit" : undefined}
                    contextLine={card.key === "offers" && pipelineValueStats?.offers?.count && pipelineValueStats.offers.count > 0
                      ? `${pipelineValueStats.offers.count} ${pipelineValueStats.offers.count === 1 ? "Offer" : "Offers"} Awaiting Response`
                      : undefined}
                    contextIcon={card.key === "offers" ? Hourglass : undefined}
                    contextSeverity={card.key === "offers" ? "attention" : undefined}
                    nextExpectedClose={card.key === "contracted" && pipelineValueStats?.contracted?.count && pipelineValueStats.contracted.count > 0 ? 14 : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Focus Strip */}
        <div>
          <FocusStrip deals={deals} stages={PIPELINE_STAGES} activeFilter={focusFilter} onFilterChange={handleFocusFilterChange} />
        </div>

        {/* Kanban View */}
        {viewMode === "kanban" && (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-y-visible overflow-x-auto pb-4">
              {PIPELINE_STAGES.map(stage => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  deals={dealsByStage[stage.id] || []}
                  allDeals={deals}
                  onViewDeal={setSelectedDeal}
                  onMoveDeal={handleMoveDeal}
                  onAddDeal={setAddDealStage}
                  isDropTarget={overStageId === stage.id && activeDragId !== null}
                  activeDragId={activeDragId}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
              {activeDeal ? (
                <div className="rotate-3 scale-105 opacity-90">
                  <PipelineDealCard deal={activeDeal} stageConfig={PIPELINE_STAGES.find(s => s.id === activeDeal.stage) || PIPELINE_STAGES[0]} onView={() => {}} onMove={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <PipelineListView deals={filteredDeals} stages={PIPELINE_STAGES} onViewDeal={setSelectedDeal} onAddDeal={setAddDealStage} />
        )}

        {/* Modals */}
        <DealDetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
        <AddDealDialog
          stage={PIPELINE_STAGES.find(s => s.id === addDealStage) || null}
          open={!!addDealStage}
          onClose={() => setAddDealStage(null)}
          onCreateDeal={handleCreateDeal}
        />
      </div>
    </PageLayout>
  );
}
