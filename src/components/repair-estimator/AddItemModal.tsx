import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, type RepairItem, type RepairCategory } from "./types";

interface LibraryItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  default_cost: number;
  cost_low?: number;
  cost_high?: number;
  is_system?: boolean;
}

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  library: LibraryItem[];
  onAddItem: (item: Omit<RepairItem, "id" | "total">) => void;
  onSaveToLibrary?: (item: Omit<LibraryItem, "id">) => void;
}

const POPULAR_ITEMS = [
  "Interior Paint",
  "LVP/Vinyl Plank",
  "Full Bath Remodel",
  "Kitchen Cabinets - Paint",
  "Roof Replace",
  "HVAC - Full System",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function AddItemModal({
  open,
  onOpenChange,
  library,
  onAddItem,
  onSaveToLibrary,
}: AddItemModalProps) {
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<LibraryItem | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [unitCost, setUnitCost] = React.useState(0);
  const [notes, setNotes] = React.useState("");

  // Custom item state
  const [customCategory, setCustomCategory] = React.useState<RepairCategory>("Miscellaneous");
  const [customName, setCustomName] = React.useState("");
  const [customUnit, setCustomUnit] = React.useState("each");
  const [customUnitCost, setCustomUnitCost] = React.useState(0);
  const [customQuantity, setCustomQuantity] = React.useState(1);
  const [customNotes, setCustomNotes] = React.useState("");
  const [saveToLibrary, setSaveToLibrary] = React.useState(false);

  // Filter library
  const filteredLibrary = React.useMemo(() => {
    let items = library;
    if (search) {
      const lower = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          item.category.toLowerCase().includes(lower)
      );
    }
    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }
    return items;
  }, [library, search, selectedCategory]);

  // Group by category
  const groupedLibrary = React.useMemo(() => {
    return filteredLibrary.reduce((acc: Record<string, LibraryItem[]>, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filteredLibrary]);

  const handleSelectItem = (item: LibraryItem) => {
    setSelectedItem(item);
    setUnitCost(Number(item.default_cost));
    setQuantity(1);
    setNotes("");
  };

  const handleAddFromLibrary = () => {
    if (!selectedItem) return;
    onAddItem({
      category: selectedItem.category,
      name: selectedItem.name,
      unit: selectedItem.unit,
      unitCost,
      quantity,
      notes,
    });
    setSelectedItem(null);
    onOpenChange(false);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    
    onAddItem({
      category: customCategory,
      name: customName,
      unit: customUnit,
      unitCost: customUnitCost,
      quantity: customQuantity,
      notes: customNotes,
    });

    if (saveToLibrary && onSaveToLibrary) {
      onSaveToLibrary({
        category: customCategory,
        name: customName,
        unit: customUnit,
        default_cost: customUnitCost,
      });
    }

    // Reset
    setCustomName("");
    setCustomUnitCost(0);
    setCustomQuantity(1);
    setCustomNotes("");
    setSaveToLibrary(false);
    onOpenChange(false);
  };

  const handleQuickAdd = (itemName: string) => {
    const item = library.find((i) => i.name === itemName);
    if (item) {
      onAddItem({
        category: item.category,
        name: item.name,
        unit: item.unit,
        unitCost: Number(item.default_cost),
        quantity: 1,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Repair Item</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="library">From Library</TabsTrigger>
            <TabsTrigger value="custom">Custom Item</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Popular quick-add */}
            <div className="mb-4">
              <div className="text-tiny text-muted-foreground mb-2">Popular:</div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_ITEMS.map((name) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(name)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <Badge
                variant={selectedCategory === null ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto border rounded-lg">
              {Object.entries(groupedLibrary).map(([category, items]) => (
                <div key={category}>
                  <div className="px-3 py-2 bg-surface-secondary text-tiny font-medium uppercase tracking-wide text-muted-foreground sticky top-0">
                    {category}
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={cn(
                        "w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors",
                        selectedItem?.id === item.id && "bg-primary/10"
                      )}
                    >
                      <span className="text-small">{item.name}</span>
                      <span className="text-small text-muted-foreground">
                        ${Number(item.default_cost).toFixed(0)}/{item.unit}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Selected item form */}
            {selectedItem && (
              <div className="mt-4 p-4 border rounded-lg bg-surface-secondary/30">
                <div className="font-medium mb-3">{selectedItem.name}</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-tiny">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-tiny">Unit Cost</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={unitCost}
                        onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-tiny">Total</Label>
                    <div className="mt-1 h-9 px-3 flex items-center bg-surface-secondary rounded-md font-medium">
                      {formatCurrency(quantity * unitCost)}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-tiny">Notes (optional)</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Brand, color, specifications"
                    className="mt-1"
                  />
                </div>
                <Button className="w-full mt-4" onClick={handleAddFromLibrary}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Item
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select
                  value={customCategory}
                  onValueChange={(v) => setCustomCategory(v as RepairCategory)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Item Name</Label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Custom Cabinet Install"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={customUnit} onValueChange={setCustomUnit}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="each">each</SelectItem>
                    <SelectItem value="sqft">sqft</SelectItem>
                    <SelectItem value="lf">lf (linear ft)</SelectItem>
                    <SelectItem value="unit">unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>$/Unit</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customUnitCost}
                    onChange={(e) => setCustomUnitCost(parseFloat(e.target.value) || 0)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Additional details..."
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="save-library"
                checked={saveToLibrary}
                onCheckedChange={(c) => setSaveToLibrary(c as boolean)}
              />
              <label htmlFor="save-library" className="text-small cursor-pointer">
                Save to my library for future use
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-small text-muted-foreground">
                Total: {formatCurrency(customQuantity * customUnitCost)}
              </div>
              <Button onClick={handleAddCustom} disabled={!customName.trim()}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Custom Item
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
