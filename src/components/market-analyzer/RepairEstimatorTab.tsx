import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Hammer,
  Plus,
  Trash2,
  Calculator,
  Save,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RepairItem {
  id: string;
  category: string;
  name: string;
  unit: string;
  unitCost: number;
  quantity: number;
  total: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const categories = [
  "Exterior",
  "Interior", 
  "Flooring",
  "Kitchen",
  "Bathroom",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Foundation",
  "Windows",
  "Landscaping",
  "Miscellaneous",
];

export function RepairEstimatorTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [items, setItems] = React.useState<RepairItem[]>([]);
  const [contingencyPct, setContingencyPct] = React.useState(10);
  const [sqft, setSqft] = React.useState("");
  const [estimateName, setEstimateName] = React.useState("");

  // Fetch repair items library
  const { data: library } = useQuery({
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

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const contingency = subtotal * (contingencyPct / 100);
  const total = subtotal + contingency;
  const perSqft = sqft ? total / parseInt(sqft) : 0;

  const addItem = (libraryItem: any) => {
    const newItem: RepairItem = {
      id: crypto.randomUUID(),
      category: libraryItem.category,
      name: libraryItem.name,
      unit: libraryItem.unit,
      unitCost: Number(libraryItem.default_cost),
      quantity: 1,
      total: Number(libraryItem.default_cost),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: string, field: "quantity" | "unitCost", value: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          updated.total = updated.quantity * updated.unitCost;
          return updated;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const saveEstimate = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const lineItems = items.map((item) => ({
        category: item.category,
        name: item.name,
        unit: item.unit,
        unit_cost: item.unitCost,
        quantity: item.quantity,
        total: item.total,
      }));

      const categoryTotals: Record<string, number> = {};
      items.forEach((item) => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.total;
      });

      const { data, error } = await supabase
        .from("repair_estimates")
        .insert({
          user_id: user.id,
          name: estimateName || "Untitled Estimate",
          sqft: sqft ? parseInt(sqft) : null,
          method: "detailed",
          line_items: lineItems,
          category_totals: categoryTotals,
          subtotal,
          contingency_pct: contingencyPct,
          contingency_amount: contingency,
          total_estimate: total,
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

  const groupedLibrary = React.useMemo(() => {
    if (!library) return {};
    return library.reduce((acc: Record<string, any[]>, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [library]);

  const itemsByCategory = React.useMemo(() => {
    return items.reduce((acc: Record<string, RepairItem[]>, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [items]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Item Library */}
      <div className="lg:col-span-1">
        <Card className="p-4">
          <h3 className="text-h4 font-semibold mb-4 flex items-center gap-2">
            <Hammer className="h-4 w-4 text-primary" />
            Repair Items Library
          </h3>
          <p className="text-tiny text-muted-foreground mb-4">
            Click items to add them to your estimate
          </p>

          <Accordion type="multiple" className="space-y-1">
            {categories.map((category) => (
              <AccordionItem key={category} value={category} className="border-none">
                <AccordionTrigger className="py-2 px-3 bg-surface-secondary/50 rounded-md hover:bg-surface-secondary text-small font-medium">
                  {category}
                  <Badge variant="secondary" size="sm" className="ml-auto mr-2">
                    {groupedLibrary[category]?.length || 0}
                  </Badge>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-0">
                  <div className="space-y-1">
                    {groupedLibrary[category]?.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => addItem(item)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-surface-secondary/70 text-small flex items-center justify-between transition-colors"
                      >
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          ${Number(item.default_cost).toFixed(0)}/{item.unit}
                        </span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>

      {/* Right: Estimate Builder */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
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
            <div className="w-32">
              <Label htmlFor="sqft">Property SqFt</Label>
              <Input
                id="sqft"
                type="number"
                placeholder="1800"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Items List */}
        {items.length === 0 ? (
          <Card className="p-8 flex flex-col items-center justify-center text-center">
            <Calculator className="h-10 w-10 text-muted-foreground mb-3" />
            <h4 className="text-body font-medium mb-1">No items added</h4>
            <p className="text-small text-muted-foreground">
              Click items from the library to build your estimate
            </p>
          </Card>
        ) : (
          <Card padding="none">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-secondary/50">
                  <th className="text-left text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-2">Item</th>
                  <th className="text-center text-tiny uppercase tracking-wide text-muted-foreground font-medium px-2 py-2 w-24">Qty</th>
                  <th className="text-right text-tiny uppercase tracking-wide text-muted-foreground font-medium px-2 py-2 w-28">Unit Cost</th>
                  <th className="text-right text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-2 w-28">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) =>
                  itemsByCategory[category]?.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {idx === 0 && (
                        <tr className="bg-surface-secondary/30">
                          <td colSpan={5} className="px-4 py-1.5 text-tiny font-medium text-muted-foreground uppercase tracking-wide">
                            {category}
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-border-subtle">
                        <td className="px-4 py-2 text-small">{item.name}</td>
                        <td className="px-2 py-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                            className="h-8 text-center"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              type="number"
                              min="0"
                              value={item.unitCost}
                              onChange={(e) => updateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
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
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        )}

        {/* Totals */}
        {items.length > 0 && (
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-small">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-small">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Contingency</span>
                  <Select value={contingencyPct.toString()} onValueChange={(v) => setContingencyPct(parseInt(v))}>
                    <SelectTrigger className="h-7 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <span className="font-medium tabular-nums">{formatCurrency(contingency)}</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="font-semibold">Total Estimate</span>
                <span className="text-xl font-bold text-primary tabular-nums">{formatCurrency(total)}</span>
              </div>
              {sqft && (
                <div className="text-small text-muted-foreground text-right">
                  ${perSqft.toFixed(2)}/sqft
                </div>
              )}
            </div>

            <Button
              className="w-full mt-4"
              onClick={() => saveEstimate.mutate()}
              disabled={saveEstimate.isPending}
              icon={<Save />}
            >
              {saveEstimate.isPending ? "Saving..." : "Save Estimate"}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
