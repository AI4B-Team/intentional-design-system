import React, { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  LayoutGrid,
  List,
  Target,
} from "lucide-react";
import { BuyBoxCard } from "@/components/marketplace-deals/BuyBoxCard";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  DialogBody,
} from "@/components/ui/dialog";
import { BuyBoxCreator } from "@/components/property-scout/BuyBoxCreator";
import { BuyBoxWizard } from "@/components/marketplace-deals/BuyBoxWizard";
import { BuyBox as BuyBoxType } from "@/types/property-scout";
import { toast } from "sonner";
import { MapPin, Sparkles, X } from "lucide-react";

interface PendingMarketTarget {
  state: string;
  target: { type: "statewide" | "cities" | "counties" | "zips"; values: string };
}

function BuyBoxRefinementBanner() {
  const [items, setItems] = React.useState<PendingMarketTarget[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("buybox_pending_refinement");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const dismiss = () => {
    setItems([]);
    try {
      localStorage.removeItem("buybox_pending_refinement");
    } catch {}
  };

  if (items.length === 0) return null;

  const needsRefinement = items.filter((i) => i.target.type === "statewide" || !i.target.values.trim());

  return (
    <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Refine Your Buy Box Markets</h3>
            <p className="text-xs text-muted-foreground">
              You Picked {items.length} {items.length === 1 ? "State" : "States"} During Setup. Narrow Each One To Cities, Counties, Or Zip Codes For Sharper Lead Targeting.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {items.map((i) => (
                <div
                  key={i.state}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs"
                >
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="font-semibold">{i.state}</span>
                  <span className="text-muted-foreground">
                    {i.target.type === "statewide"
                      ? "Statewide"
                      : `${i.target.type}: ${i.target.values || "Not Set"}`}
                  </span>
                  {needsRefinement.find((n) => n.state === i.state) && (
                    <span className="ml-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                      Refine
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}


// Mock data for buy boxes
const mockBuyBoxes: (BuyBoxType & { matchCount?: number })[] = [
  {
    id: "1",
    name: "Florida Single Family",
    description: "Single family homes in Florida under $300k with good equity",
    ownerId: "user1",
    isActive: true,
    visibleToScouts: [],
    criteria: {
      states: ["FL"],
      propertyTypes: ["single_family"],
      minPrice: 100000,
      maxPrice: 300000,
      minBedrooms: 3,
      conditions: ["good", "fair"],
    },
    requiredFields: {
      address: true,
      propertyType: true,
      estimatedValue: true,
      condition: true,
      photos: { required: true, minimum: 3 },
      ownerInfo: true,
      motivationLevel: true,
      notes: false,
    },
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    matchCount: 24,
  },
  {
    id: "2",
    name: "Texas Multi-Family",
    description: "Multi-family properties in Texas metro areas",
    ownerId: "user1",
    isActive: true,
    visibleToScouts: [],
    criteria: {
      states: ["TX"],
      propertyTypes: ["multi_family"],
      minPrice: 200000,
      maxPrice: 500000,
      conditions: ["good", "fair", "poor"],
    },
    requiredFields: {
      address: true,
      propertyType: true,
      estimatedValue: true,
      condition: true,
      photos: { required: true, minimum: 5 },
      ownerInfo: true,
      motivationLevel: true,
      notes: true,
    },
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18",
    matchCount: 12,
  },
  {
    id: "3",
    name: "Distressed Properties Nationwide",
    description: "Any distressed property with significant equity",
    ownerId: "user1",
    isActive: false,
    visibleToScouts: [],
    criteria: {
      conditions: ["poor", "distressed"],
      minEquity: 30,
    },
    requiredFields: {
      address: true,
      propertyType: true,
      estimatedValue: true,
      condition: true,
      photos: { required: true, minimum: 5 },
      ownerInfo: true,
      motivationLevel: true,
      notes: true,
    },
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
    matchCount: 0,
  },
];

const BuyBox: React.FC = () => {
  const [buyBoxes, setBuyBoxes] = useState(mockBuyBoxes);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBuyBox, setEditingBuyBox] = useState<BuyBoxType | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const filteredBuyBoxes = buyBoxes.filter(
    (bb) =>
      bb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bb.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (buyBox: Partial<BuyBoxType>) => {
    if (editingBuyBox) {
      setBuyBoxes((prev) =>
        prev.map((bb) =>
          bb.id === editingBuyBox.id ? { ...bb, ...buyBox, updatedAt: new Date().toISOString() } : bb
        )
      );
      toast.success("Buy box updated successfully");
    } else {
      const newBuyBox: BuyBoxType & { matchCount: number } = {
        id: Date.now().toString(),
        name: buyBox.name || "Untitled Buy Box",
        description: buyBox.description,
        ownerId: "user1",
        isActive: buyBox.isActive ?? true,
        visibleToScouts: buyBox.visibleToScouts || [],
        criteria: buyBox.criteria || {},
        requiredFields: buyBox.requiredFields || {
          address: true,
          propertyType: true,
          estimatedValue: true,
          condition: true,
          photos: { required: true, minimum: 3 },
          ownerInfo: true,
          motivationLevel: true,
          notes: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        matchCount: 0,
      };
      setBuyBoxes((prev) => [newBuyBox, ...prev]);
      toast.success("Buy box created successfully");
    }
    setShowCreateDialog(false);
    setEditingBuyBox(null);
  };

  const handleToggleActive = (id: string) => {
    setBuyBoxes((prev) =>
      prev.map((bb) =>
        bb.id === id ? { ...bb, isActive: !bb.isActive, updatedAt: new Date().toISOString() } : bb
      )
    );
    toast.success("Buy box status updated");
  };

  const handleDuplicate = (buyBox: BuyBoxType) => {
    const duplicate: BuyBoxType & { matchCount: number } = {
      ...buyBox,
      id: Date.now().toString(),
      name: `${buyBox.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matchCount: 0,
    };
    setBuyBoxes((prev) => [duplicate, ...prev]);
    toast.success("Buy box duplicated");
  };

  const handleDelete = (id: string) => {
    setBuyBoxes((prev) => prev.filter((bb) => bb.id !== id));
    toast.success("Buy box deleted");
  };

  return (
    <PageLayout title="Buy Box">
      <BuyBoxRefinementBanner />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Buy Box</h1>
          <p className="text-muted-foreground">Define your investment criteria to find matching deals</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Buy Box
        </Button>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Buy Boxes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(v) => v && setViewMode(v as "grid" | "list")}
          className="border rounded-lg p-1"
        >
          <ToggleGroupItem value="list" aria-label="List view" className="h-8 w-8 p-0">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view" className="h-8 w-8 p-0">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Buy Box Grid/List */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
        : "flex flex-col gap-3"
      }>
        {filteredBuyBoxes.map((buyBox) => (
          <BuyBoxCard
            key={buyBox.id}
            buyBox={buyBox}
            viewMode={viewMode}
            onEdit={(bb) => {
              setEditingBuyBox(bb);
              setShowCreateDialog(true);
            }}
            onDuplicate={handleDuplicate}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
          />
        ))}

        {/* Empty State */}
        {filteredBuyBoxes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No buy boxes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first buy box to start finding matching deals"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Buy Box
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setEditingBuyBox(null);
        }}
      >
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Create Your BuyBox</DialogTitle>
            <DialogDescription>Set your investment criteria to start matching with deals</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <BuyBoxWizard
              onSave={handleSave}
              onCancel={() => {
                setShowCreateDialog(false);
                setEditingBuyBox(null);
              }}
              existingBuyBox={editingBuyBox || undefined}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default BuyBox;
