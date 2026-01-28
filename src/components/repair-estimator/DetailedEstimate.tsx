import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, Calculator, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { RepairItem, EstimateSummary as EstimateSummaryType, CategoryTotal, RepairCategory } from "./types";
import { CATEGORIES } from "./types";
import { EstimateSummary } from "./EstimateSummary";
import { AddItemModal } from "./AddItemModal";
import { RepairTemplates } from "./RepairTemplates";

interface DetailedEstimateProps {
  initialSqft?: number;
  initialItems?: RepairItem[];
  onUseEstimate?: (total: number, items: RepairItem[]) => void;
  propertyId?: string;
  dealAnalysisId?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DetailedEstimate({
  initialSqft = 1850,
  initialItems = [],
  onUseEstimate,
  propertyId,
  dealAnalysisId,
}: DetailedEstimateProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [sqft, setSqft] = React.useState(initialSqft);
  const [estimateName, setEstimateName] = React.useState("");
  const [items, setItems] = React.useState<RepairItem[]>(initialItems);
  const [contingencyPct, setContingencyPct] = React.useState(10);
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Fetch library
  const { data: library = [] } = useQuery({
    queryKey: ["repair-items-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_items_library")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Group items by category
  const itemsByCategory = React.useMemo(() => {
    return items.reduce((acc: Record<string, RepairItem[]>, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [items]);

  // Calculate summary
  const summary: EstimateSummaryType = React.useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const contingencyAmount = subtotal * (contingencyPct / 100);
    const total = subtotal + contingencyAmount;
    const perSqft = sqft > 0 ? total / sqft : null;

    const categoryTotals: CategoryTotal[] = CATEGORIES.map((category) => {
      const catItems = itemsByCategory[category] || [];
      return {
        category: category as RepairCategory,
        total: catItems.reduce((sum, item) => sum + item.total, 0),
        itemCount: catItems.length,
      };
    });

    return {
      subtotal,
      contingencyPct,
      contingencyAmount,
      total,
      perSqft,
      categoryTotals,
    };
  }, [items, contingencyPct, sqft, itemsByCategory]);

  // Add item
  const addItem = (item: Omit<RepairItem, "id" | "total">) => {
    const newItem: RepairItem = {
      ...item,
      id: crypto.randomUUID(),
      total: item.quantity * item.unitCost,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Update item
  const updateItem = (id: string, field: keyof RepairItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitCost") {
            updated.total = updated.quantity * updated.unitCost;
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Remove item
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Apply template
  const applyTemplate = (templateItems: Omit<RepairItem, "id">[]) => {
    const newItems = templateItems.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    }));
    setItems(newItems);
    toast.success("Template applied!");
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const lineItems = items.map((item) => ({
        category: item.category,
        name: item.name,
        unit: item.unit,
        unit_cost: item.unitCost,
        quantity: item.quantity,
        total: item.total,
        notes: item.notes,
      }));

      const categoryTotals: Record<string, number> = {};
      items.forEach((item) => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.total;
      });

      const { data, error } = await supabase
        .from("repair_estimates")
        .insert({
          user_id: user.id,
          property_id: propertyId || null,
          deal_analysis_id: dealAnalysisId || null,
          name: estimateName || "Untitled Estimate",
          sqft: sqft || null,
          method: "detailed",
          line_items: lineItems,
          category_totals: categoryTotals,
          subtotal: summary.subtotal,
          contingency_pct: contingencyPct,
          contingency_amount: summary.contingencyAmount,
          total_estimate: summary.total,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Estimate saved!");
      queryClient.invalidateQueries({ queryKey: ["repair-estimates"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save estimate");
    },
  });

  // Save to library
  const saveToLibrary = async (item: { category: string; name: string; unit: string; default_cost: number }) => {
    if (!user?.id) return;

    const { error } = await supabase.from("repair_items_library").insert({
      user_id: user.id,
      category: item.category,
      name: item.name,
      unit: item.unit,
      default_cost: item.default_cost,
      is_system: false,
      is_active: true,
    });

    if (error) {
      toast.error("Failed to save to library");
    } else {
      toast.success("Item saved to library");
      queryClient.invalidateQueries({ queryKey: ["repair-items-library"] });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Main content */}
      <div className="lg:col-span-9 space-y-4">
        {/* Header */}
        <Card className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="estimate-name">Estimate Name</Label>
              <Input
                id="estimate-name"
                placeholder="e.g., 123 Main St Rehab"
                value={estimateName}
                onChange={(e) => setEstimateName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-full sm:w-32">
              <Label htmlFor="sqft">Property SqFt</Label>
              <Input
                id="sqft"
                type="number"
                placeholder="1850"
                value={sqft}
                onChange={(e) => setSqft(parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Item
            </Button>
          </div>
        </Card>

        {/* Templates */}
        <RepairTemplates sqft={sqft} onApplyTemplate={applyTemplate} />

        {/* Items by category */}
        {items.length === 0 ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-body font-medium mb-2">No items added</h4>
            <p className="text-small text-muted-foreground mb-4">
              Choose a template above or add items individually
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Item
            </Button>
          </Card>
        ) : (
          <Card padding="none">
            <Accordion
              type="multiple"
              defaultValue={CATEGORIES.filter((c) => itemsByCategory[c]?.length > 0)}
              className="divide-y"
            >
              {CATEGORIES.map((category) => {
                const catItems = itemsByCategory[category] || [];
                if (catItems.length === 0) return null;

                const catTotal = catItems.reduce((sum, item) => sum + item.total, 0);

                return (
                  <AccordionItem key={category} value={category} className="border-none">
                    <AccordionTrigger className="px-4 py-3 hover:bg-surface-secondary/50">
                      <div className="flex items-center justify-between flex-1 pr-4">
                        <span className="font-medium">{category}</span>
                        <span className="text-primary font-semibold tabular-nums">
                          {formatCurrency(catTotal)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border-subtle bg-surface-secondary/30">
                            <th className="text-left text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-2">
                              Item
                            </th>
                            <th className="text-center text-tiny uppercase tracking-wide text-muted-foreground font-medium px-2 py-2 w-20">
                              Qty
                            </th>
                            <th className="text-center text-tiny uppercase tracking-wide text-muted-foreground font-medium px-2 py-2 w-16">
                              Unit
                            </th>
                            <th className="text-right text-tiny uppercase tracking-wide text-muted-foreground font-medium px-2 py-2 w-24">
                              $/Unit
                            </th>
                            <th className="text-right text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-2 w-28">
                              Total
                            </th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {catItems.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-border-subtle last:border-0"
                            >
                              <td className="px-4 py-2 text-small">{item.name}</td>
                              <td className="px-2 py-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(item.id, "quantity", parseInt(e.target.value) || 0)
                                  }
                                  className="h-8 text-center"
                                />
                              </td>
                              <td className="px-2 py-2 text-center text-small text-muted-foreground">
                                {item.unit}
                              </td>
                              <td className="px-2 py-2">
                                <div className="relative">
                                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitCost}
                                    onChange={(e) =>
                                      updateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)
                                    }
                                    className="h-8 pl-6 text-right"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right text-small font-medium tabular-nums">
                                {formatCurrency(item.total)}
                              </td>
                              <td className="pr-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-4 py-2 bg-surface-secondary/20">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddModal(true)}
                          className="text-muted-foreground"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Item
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Card>
        )}
      </div>

      {/* Sidebar - Summary */}
      <div className="lg:col-span-3">
        <EstimateSummary
          summary={summary}
          sqft={sqft}
          onContingencyChange={setContingencyPct}
          onSave={() => saveMutation.mutate()}
          onUseInAnalysis={
            onUseEstimate ? () => onUseEstimate(summary.total, items) : undefined
          }
          isSaving={saveMutation.isPending}
        />
      </div>

      {/* Add item modal */}
      <AddItemModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        library={library}
        onAddItem={addItem}
        onSaveToLibrary={saveToLibrary}
      />
    </div>
  );
}
