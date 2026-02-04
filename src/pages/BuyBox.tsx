import React, { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Target, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Copy,
  ToggleLeft,
  ToggleRight,
  MapPin,
  DollarSign,
  Home,
  Building2,
  LayoutGrid,
  List,
  Bed,
  TrendingUp
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeIcon = (types?: string[]) => {
    if (!types || types.length === 0) return <Home className="h-4 w-4" />;
    if (types.includes("multi_family")) return <Building2 className="h-4 w-4" />;
    return <Home className="h-4 w-4" />;
  };

  return (
    <PageLayout title="Buy Box">
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
            placeholder="Search buy boxes..."
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
          <ToggleGroupItem value="grid" aria-label="Grid view" className="h-8 w-8 p-0">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="h-8 w-8 p-0">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Buy Box Grid/List */}
      <div className={viewMode === "grid" 
        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" 
        : "flex flex-col gap-3"
      }>
        {filteredBuyBoxes.map((buyBox) => (
          viewMode === "grid" ? (
            // Grid Card View
            <Card
              key={buyBox.id}
              className={`relative transition-all hover:shadow-md hover:-translate-y-0.5 ${
                !buyBox.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Card Header with Icon and Title */}
              <div className="p-4 pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                      buyBox.isActive ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Target className={`h-5 w-5 ${buyBox.isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">{buyBox.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {buyBox.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-white z-[100]">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingBuyBox(buyBox);
                          setShowCreateDialog(true);
                        }}
                        className="gap-2 cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(buyBox)}
                        className="gap-2 cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(buyBox.id)}
                        className="gap-2 cursor-pointer"
                      >
                        {buyBox.isActive ? (
                          <>
                            <ToggleLeft className="h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(buyBox.id)}
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Criteria Tags */}
              <div className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {buyBox.criteria.states && buyBox.criteria.states.length > 0 && (
                    <Badge variant="outline" className="text-xs gap-1 bg-background">
                      <MapPin className="h-3 w-3" />
                      {buyBox.criteria.states.slice(0, 2).join(", ")}
                      {buyBox.criteria.states.length > 2 && ` +${buyBox.criteria.states.length - 2}`}
                    </Badge>
                  )}
                  {buyBox.criteria.propertyTypes && buyBox.criteria.propertyTypes.length > 0 && (
                    <Badge variant="outline" className="text-xs gap-1 bg-background">
                      {getPropertyTypeIcon(buyBox.criteria.propertyTypes)}
                      {buyBox.criteria.propertyTypes.length === 1
                        ? buyBox.criteria.propertyTypes[0].replace("_", " ")
                        : `${buyBox.criteria.propertyTypes.length} types`}
                    </Badge>
                  )}
                  {(buyBox.criteria.minPrice || buyBox.criteria.maxPrice) && (
                    <Badge variant="outline" className="text-xs gap-1 bg-background">
                      <DollarSign className="h-3 w-3" />
                      {formatPrice(buyBox.criteria.minPrice) || "$0"} -{" "}
                      {formatPrice(buyBox.criteria.maxPrice) || "Any"}
                    </Badge>
                  )}
                  {buyBox.criteria.minBedrooms && (
                    <Badge variant="outline" className="text-xs gap-1 bg-background">
                      <Bed className="h-3 w-3" />
                      {buyBox.criteria.minBedrooms}+ beds
                    </Badge>
                  )}
                  {buyBox.criteria.minEquity && (
                    <Badge variant="outline" className="text-xs gap-1 bg-background">
                      <TrendingUp className="h-3 w-3" />
                      {buyBox.criteria.minEquity}%+ equity
                    </Badge>
                  )}
                </div>
              </div>

              {/* Footer Stats */}
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant={buyBox.isActive ? "default" : "secondary"} className="text-xs">
                      {buyBox.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-muted-foreground">Matches:</span>
                    <span className="font-semibold text-primary">{buyBox.matchCount || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            // List View
            <Card
              key={buyBox.id}
              className={`transition-all hover:shadow-md ${
                !buyBox.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                  buyBox.isActive ? "bg-primary/10" : "bg-muted"
                }`}>
                  <Target className={`h-5 w-5 ${buyBox.isActive ? "text-primary" : "text-muted-foreground"}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{buyBox.name}</h3>
                    <Badge variant={buyBox.isActive ? "default" : "secondary"} className="text-xs shrink-0">
                      {buyBox.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {buyBox.description || "No description"}
                  </p>
                </div>

                {/* Criteria Summary */}
                <div className="hidden lg:flex items-center gap-2 shrink-0">
                  {buyBox.criteria.states && buyBox.criteria.states.length > 0 && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <MapPin className="h-3 w-3" />
                      {buyBox.criteria.states.slice(0, 2).join(", ")}
                    </Badge>
                  )}
                  {(buyBox.criteria.minPrice || buyBox.criteria.maxPrice) && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatPrice(buyBox.criteria.minPrice) || "$0"} - {formatPrice(buyBox.criteria.maxPrice) || "Any"}
                    </Badge>
                  )}
                </div>

                {/* Match Count */}
                <div className="flex items-center gap-1.5 text-sm shrink-0 min-w-[80px] justify-end">
                  <span className="text-muted-foreground">Matches:</span>
                  <span className="font-semibold text-primary">{buyBox.matchCount || 0}</span>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-white z-[100]">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingBuyBox(buyBox);
                        setShowCreateDialog(true);
                      }}
                      className="gap-2 cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDuplicate(buyBox)}
                      className="gap-2 cursor-pointer"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleActive(buyBox.id)}
                      className="gap-2 cursor-pointer"
                    >
                      {buyBox.isActive ? (
                        <>
                          <ToggleLeft className="h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleRight className="h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(buyBox.id)}
                      className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          )
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
        <DialogContent size="lg" className="max-h-[85vh] overflow-y-auto">
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
