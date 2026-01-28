import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paintbrush, Hammer, Wrench, HardHat, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RepairScope, RepairItem } from "./types";

interface RepairTemplatesProps {
  sqft: number;
  onApplyTemplate: (items: Omit<RepairItem, "id">[]) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  scope: RepairScope;
  icon: React.ReactNode;
  color: string;
  getItems: (sqft: number) => Omit<RepairItem, "id" | "total">[];
}

const templates: Template[] = [
  {
    id: "cosmetic",
    name: "Cosmetic Refresh",
    description: "Paint, flooring, minor updates",
    scope: "cosmetic",
    icon: <Paintbrush className="h-5 w-5" />,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    getItems: (sqft) => [
      { category: "Interior", name: "Interior Paint", unit: "sqft", unitCost: 2.0, quantity: sqft },
      { category: "Flooring", name: "LVP/Vinyl Plank", unit: "sqft", unitCost: 5.0, quantity: Math.round(sqft * 0.8) },
      { category: "Bathroom", name: "Vanity w/ Top", unit: "each", unitCost: 600, quantity: 2 },
      { category: "Kitchen", name: "Faucet", unit: "each", unitCost: 250, quantity: 1 },
      { category: "Electrical", name: "Light Fixture", unit: "each", unitCost: 150, quantity: 8 },
      { category: "Landscaping", name: "Basic Cleanup", unit: "each", unitCost: 1000, quantity: 1 },
      { category: "Miscellaneous", name: "Cleaning", unit: "each", unitCost: 500, quantity: 1 },
    ],
  },
  {
    id: "light",
    name: "Light Renovation",
    description: "Cosmetic + kitchen/bath updates",
    scope: "light",
    icon: <Hammer className="h-5 w-5" />,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    getItems: (sqft) => [
      { category: "Interior", name: "Interior Paint", unit: "sqft", unitCost: 2.0, quantity: sqft },
      { category: "Flooring", name: "LVP/Vinyl Plank", unit: "sqft", unitCost: 5.0, quantity: Math.round(sqft * 0.8) },
      { category: "Kitchen", name: "Cabinets - Paint", unit: "each", unitCost: 1500, quantity: 1 },
      { category: "Kitchen", name: "Countertops - Laminate", unit: "sqft", unitCost: 25, quantity: 40 },
      { category: "Kitchen", name: "Appliance Package", unit: "each", unitCost: 3000, quantity: 1 },
      { category: "Bathroom", name: "Full Bath Remodel", unit: "each", unitCost: 8000, quantity: 1 },
      { category: "Bathroom", name: "Half Bath Remodel", unit: "each", unitCost: 4000, quantity: 1 },
      { category: "Electrical", name: "Light Fixture", unit: "each", unitCost: 150, quantity: 10 },
      { category: "Exterior", name: "Exterior Paint", unit: "sqft", unitCost: 2.0, quantity: Math.round(sqft * 0.6) },
      { category: "Landscaping", name: "Basic Cleanup", unit: "each", unitCost: 1500, quantity: 1 },
    ],
  },
  {
    id: "medium",
    name: "Standard Flip",
    description: "Full update including mechanicals",
    scope: "medium",
    icon: <Wrench className="h-5 w-5" />,
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    getItems: (sqft) => [
      { category: "Interior", name: "Interior Paint", unit: "sqft", unitCost: 2.0, quantity: sqft },
      { category: "Interior", name: "Drywall - Repair", unit: "each", unitCost: 150, quantity: 10 },
      { category: "Flooring", name: "LVP/Vinyl Plank", unit: "sqft", unitCost: 5.0, quantity: Math.round(sqft * 0.85) },
      { category: "Kitchen", name: "Cabinets - Reface", unit: "each", unitCost: 4000, quantity: 1 },
      { category: "Kitchen", name: "Countertops - Granite", unit: "sqft", unitCost: 60, quantity: 45 },
      { category: "Kitchen", name: "Appliance Package", unit: "each", unitCost: 3500, quantity: 1 },
      { category: "Bathroom", name: "Full Bath Remodel", unit: "each", unitCost: 10000, quantity: 2 },
      { category: "HVAC", name: "Full System Replacement", unit: "each", unitCost: 8000, quantity: 1 },
      { category: "Electrical", name: "Panel Upgrade 200 amp", unit: "each", unitCost: 2500, quantity: 1 },
      { category: "Plumbing", name: "Water Heater - Tank", unit: "each", unitCost: 1500, quantity: 1 },
      { category: "Exterior", name: "Exterior Paint", unit: "sqft", unitCost: 2.0, quantity: Math.round(sqft * 0.6) },
      { category: "Exterior", name: "Gutters", unit: "lf", unitCost: 8, quantity: 150 },
      { category: "Windows/Doors", name: "Window Replacement", unit: "each", unitCost: 500, quantity: 8 },
      { category: "Landscaping", name: "Basic Cleanup", unit: "each", unitCost: 2000, quantity: 1 },
      { category: "Miscellaneous", name: "Permits", unit: "each", unitCost: 1500, quantity: 1 },
      { category: "Miscellaneous", name: "Dumpster Rental", unit: "each", unitCost: 500, quantity: 2 },
    ],
  },
  {
    id: "heavy",
    name: "Heavy Rehab",
    description: "Major renovation, structural",
    scope: "heavy",
    icon: <HardHat className="h-5 w-5" />,
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    getItems: (sqft) => [
      { category: "Interior", name: "Interior Paint", unit: "sqft", unitCost: 2.0, quantity: sqft },
      { category: "Interior", name: "Drywall - New", unit: "sqft", unitCost: 3.0, quantity: Math.round(sqft * 0.5) },
      { category: "Flooring", name: "LVP/Vinyl Plank", unit: "sqft", unitCost: 5.0, quantity: sqft },
      { category: "Kitchen", name: "Cabinets - Full Replacement", unit: "each", unitCost: 10000, quantity: 1 },
      { category: "Kitchen", name: "Countertops - Quartz", unit: "sqft", unitCost: 75, quantity: 50 },
      { category: "Kitchen", name: "Appliance Package", unit: "each", unitCost: 4500, quantity: 1 },
      { category: "Bathroom", name: "Full Bath Remodel", unit: "each", unitCost: 12000, quantity: 2 },
      { category: "Bathroom", name: "Half Bath Remodel", unit: "each", unitCost: 6000, quantity: 1 },
      { category: "HVAC", name: "Full System Replacement", unit: "each", unitCost: 10000, quantity: 1 },
      { category: "HVAC", name: "Ductwork", unit: "each", unitCost: 3000, quantity: 1 },
      { category: "Electrical", name: "Full Rewire", unit: "sqft", unitCost: 5.0, quantity: sqft },
      { category: "Plumbing", name: "Re-pipe PEX", unit: "sqft", unitCost: 4.0, quantity: sqft },
      { category: "Exterior", name: "Roof - Full Replacement", unit: "sqft", unitCost: 5.0, quantity: sqft },
      { category: "Exterior", name: "Siding - Vinyl", unit: "sqft", unitCost: 6.0, quantity: Math.round(sqft * 0.6) },
      { category: "Windows/Doors", name: "Window Replacement", unit: "each", unitCost: 500, quantity: 12 },
      { category: "Windows/Doors", name: "Entry Door", unit: "each", unitCost: 1200, quantity: 2 },
      { category: "Foundation", name: "Foundation Repair - Minor", unit: "each", unitCost: 3000, quantity: 1 },
      { category: "Landscaping", name: "Sod - Full Yard", unit: "sqft", unitCost: 1.5, quantity: 3000 },
      { category: "Miscellaneous", name: "Permits", unit: "each", unitCost: 3000, quantity: 1 },
      { category: "Miscellaneous", name: "Dumpster Rental", unit: "each", unitCost: 500, quantity: 4 },
    ],
  },
  {
    id: "gut",
    name: "Gut Renovation",
    description: "Complete rebuild to studs",
    scope: "gut",
    icon: <Building2 className="h-5 w-5" />,
    color: "bg-red-500/10 text-red-600 border-red-200",
    getItems: (sqft) => [
      { category: "Interior", name: "Drywall - New", unit: "sqft", unitCost: 3.0, quantity: sqft * 2 },
      { category: "Interior", name: "Interior Paint", unit: "sqft", unitCost: 2.0, quantity: sqft },
      { category: "Flooring", name: "Hardwood - New", unit: "sqft", unitCost: 10.0, quantity: sqft },
      { category: "Kitchen", name: "Cabinets - Full Replacement", unit: "each", unitCost: 15000, quantity: 1 },
      { category: "Kitchen", name: "Countertops - Quartz", unit: "sqft", unitCost: 75, quantity: 55 },
      { category: "Kitchen", name: "Appliance Package", unit: "each", unitCost: 5000, quantity: 1 },
      { category: "Bathroom", name: "Full Bath Remodel", unit: "each", unitCost: 15000, quantity: 2 },
      { category: "Bathroom", name: "Half Bath Remodel", unit: "each", unitCost: 7000, quantity: 1 },
      { category: "HVAC", name: "Full System Replacement", unit: "each", unitCost: 12000, quantity: 1 },
      { category: "HVAC", name: "Ductwork", unit: "each", unitCost: 4000, quantity: 1 },
      { category: "Electrical", name: "Full Rewire", unit: "sqft", unitCost: 6.0, quantity: sqft },
      { category: "Electrical", name: "Panel Upgrade 200 amp", unit: "each", unitCost: 3000, quantity: 1 },
      { category: "Plumbing", name: "Re-pipe PEX", unit: "sqft", unitCost: 5.0, quantity: sqft },
      { category: "Plumbing", name: "Sewer Line Repair", unit: "each", unitCost: 5000, quantity: 1 },
      { category: "Exterior", name: "Roof - Full Replacement", unit: "sqft", unitCost: 6.0, quantity: sqft },
      { category: "Exterior", name: "Siding - Vinyl", unit: "sqft", unitCost: 7.0, quantity: Math.round(sqft * 0.7) },
      { category: "Windows/Doors", name: "Window Replacement", unit: "each", unitCost: 600, quantity: 15 },
      { category: "Windows/Doors", name: "Entry Door", unit: "each", unitCost: 1500, quantity: 2 },
      { category: "Windows/Doors", name: "Garage Door", unit: "each", unitCost: 1500, quantity: 1 },
      { category: "Foundation", name: "Foundation Repair - Major", unit: "each", unitCost: 12000, quantity: 1 },
      { category: "Landscaping", name: "Sod - Full Yard", unit: "sqft", unitCost: 1.5, quantity: 4000 },
      { category: "Landscaping", name: "Tree Removal", unit: "each", unitCost: 800, quantity: 2 },
      { category: "Miscellaneous", name: "Permits", unit: "each", unitCost: 5000, quantity: 1 },
      { category: "Miscellaneous", name: "Dumpster Rental", unit: "each", unitCost: 500, quantity: 6 },
    ],
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function RepairTemplates({ sqft, onApplyTemplate }: RepairTemplatesProps) {
  const handleApply = (template: Template) => {
    const items = template.getItems(sqft).map((item) => ({
      ...item,
      total: item.quantity * item.unitCost,
    }));
    onApplyTemplate(items);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-small font-medium text-muted-foreground">
        Start from Template
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {templates.map((template) => {
          const items = template.getItems(sqft);
          const total = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
          const perSqft = sqft > 0 ? total / sqft : 0;

          return (
            <Card
              key={template.id}
              className={cn(
                "p-4 cursor-pointer hover:shadow-md transition-all border-2",
                template.color
              )}
              onClick={() => handleApply(template)}
            >
              <div className="flex items-center gap-2 mb-2">
                {template.icon}
                <span className="font-medium text-small">{template.name}</span>
              </div>
              <p className="text-tiny text-muted-foreground mb-3">
                {template.description}
              </p>
              <div className="text-small font-semibold">
                {formatCurrency(total)}
              </div>
              <div className="text-tiny text-muted-foreground">
                ~${perSqft.toFixed(0)}/sqft
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
