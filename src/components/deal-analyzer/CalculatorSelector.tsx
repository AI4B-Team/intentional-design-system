import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Hammer,
  Handshake,
  Building,
  RefreshCw,
  Plane,
  Check,
} from "lucide-react";
import { CalculatorType, CALCULATOR_OPTIONS } from "./types";

const iconMap = {
  Hammer,
  Handshake,
  Building,
  RefreshCw,
  Plane,
};

interface CalculatorSelectorProps {
  selected: CalculatorType;
  onSelect: (type: CalculatorType) => void;
}

export function CalculatorSelector({ selected, onSelect }: CalculatorSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {CALCULATOR_OPTIONS.map((calc) => {
        const Icon = iconMap[calc.icon as keyof typeof iconMap];
        const isSelected = selected === calc.id;
        
        return (
          <Card
            key={calc.id}
            onClick={() => onSelect(calc.id)}
            className={cn(
              "relative p-4 cursor-pointer transition-all hover:shadow-md",
              isSelected
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-surface-secondary/50"
            )}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            
            <div
              className={cn(
                "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3",
                calc.color
              )}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
            
            <h3 className="font-semibold text-foreground text-sm mb-1">
              {calc.name}
            </h3>
            <p className="text-tiny text-muted-foreground line-clamp-2 mb-2">
              {calc.description}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {calc.metrics.slice(0, 2).map((metric) => (
                <Badge key={metric} variant="secondary" size="sm" className="text-tiny">
                  {metric}
                </Badge>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
