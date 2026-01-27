import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Circle, X } from "lucide-react";

export const COLOR_OPTIONS = [
  { id: "red", color: "bg-red-500", label: "Red" },
  { id: "orange", color: "bg-orange-500", label: "Orange" },
  { id: "yellow", color: "bg-yellow-500", label: "Yellow" },
  { id: "green", color: "bg-green-500", label: "Green" },
  { id: "blue", color: "bg-blue-500", label: "Blue" },
  { id: "purple", color: "bg-purple-500", label: "Purple" },
  { id: "pink", color: "bg-pink-500", label: "Pink" },
  { id: "gray", color: "bg-gray-500", label: "Gray" },
];

interface ColorLabelPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
  disabled?: boolean;
}

export function ColorLabelPicker({ value, onChange, disabled }: ColorLabelPickerProps) {
  const [open, setOpen] = React.useState(false);
  
  const selectedColor = COLOR_OPTIONS.find((c) => c.id === value);

  const handleSelect = (colorId: string | null) => {
    onChange(colorId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          className={cn(
            "h-6 w-6 rounded-full border-2 border-border flex items-center justify-center transition-all hover:scale-110",
            selectedColor?.color || "bg-transparent"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {!selectedColor && <Circle className="h-3 w-3 text-muted-foreground" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-background" align="start" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.id}
              className={cn(
                "h-8 w-8 rounded-full transition-all hover:scale-110 border-2",
                color.color,
                value === color.id ? "border-foreground ring-2 ring-offset-2 ring-foreground" : "border-transparent"
              )}
              onClick={() => handleSelect(color.id)}
              title={color.label}
            />
          ))}
        </div>
        {value && (
          <button
            className="flex items-center gap-1 w-full mt-2 pt-2 border-t text-sm text-muted-foreground hover:text-foreground justify-center"
            onClick={() => handleSelect(null)}
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function ColorLabelDot({ color }: { color: string | null }) {
  const colorOption = COLOR_OPTIONS.find((c) => c.id === color);
  
  if (!colorOption) return null;
  
  return (
    <span className={cn("inline-block h-3 w-3 rounded-full", colorOption.color)} />
  );
}
