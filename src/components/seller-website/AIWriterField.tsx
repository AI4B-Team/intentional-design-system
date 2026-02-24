import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";

interface AIWriterFieldProps {
  label: string;
  fieldType: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  loadingField: string | null;
  onGenerate: (fieldType: string, currentValue: string, context?: string) => Promise<string | null>;
  context?: string;
  required?: boolean;
}

export function AIWriterField({
  label,
  fieldType,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 2,
  loadingField,
  onGenerate,
  context,
  required,
}: AIWriterFieldProps) {
  const isLoading = loadingField === fieldType;

  const handleGenerate = async () => {
    const result = await onGenerate(fieldType, value, context);
    if (result) onChange(result);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label htmlFor={fieldType}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerate}
          disabled={isLoading}
          className="h-7 text-xs gap-1 text-brand hover:text-brand"
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {isLoading ? "Writing..." : "AI Write"}
        </Button>
      </div>
      {multiline ? (
        <Textarea
          id={fieldType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <Input
          id={fieldType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
