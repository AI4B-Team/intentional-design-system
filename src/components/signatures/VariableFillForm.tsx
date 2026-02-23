import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateVariable, SignatureTemplate } from "@/types/signature-templates";

interface VariableFillFormProps {
  template: SignatureTemplate;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function VariableFillForm({ template, values, onChange }: VariableFillFormProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...values, key: value, [key]: value });
  };

  const filledCount = template.variables.filter((v) => values[v.key]?.trim()).length;
  const requiredCount = template.variables.filter((v) => v.required).length;
  const requiredFilled = template.variables.filter((v) => v.required && values[v.key]?.trim()).length;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {filledCount}/{template.variables.length} fields filled
        </span>
        <span className={cn(
          "font-medium",
          requiredFilled === requiredCount ? "text-success" : "text-warning"
        )}>
          {requiredFilled}/{requiredCount} required
        </span>
      </div>
      <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all"
          style={{ width: `${(filledCount / template.variables.length) * 100}%` }}
        />
      </div>

      {/* Auto-fill hint */}
      {template.variables.some((v) => v.source && v.source !== "manual") && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand/5 border border-brand/10 text-sm">
          <Sparkles className="h-4 w-4 text-brand flex-shrink-0" />
          <span className="text-brand">
            Fields marked with a source badge can be auto-filled from your deal data.
          </span>
        </div>
      )}

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {template.variables.map((variable) => {
          const isFilled = !!values[variable.key]?.trim();
          return (
            <div key={variable.key} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor={variable.key} className="text-sm">
                  {variable.label}
                  {variable.required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                {variable.source && variable.source !== "manual" && (
                  <Badge variant="outline" className="text-[10px] capitalize h-4">{variable.source}</Badge>
                )}
                {isFilled && <Check className="h-3 w-3 text-success" />}
              </div>
              <Input
                id={variable.key}
                type={variable.type === "email" ? "email" : variable.type === "number" ? "number" : "text"}
                placeholder={variable.placeholder}
                value={values[variable.key] || ""}
                onChange={(e) => handleChange(variable.key, e.target.value)}
                className={cn(
                  "text-sm",
                  isFilled && "border-success/30 bg-success/5"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
