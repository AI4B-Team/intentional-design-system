import { cn } from "@/lib/utils";
import { Plus, ImageIcon } from "lucide-react";
import { GeneratedImage } from "@/hooks/useRenovationProjects";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ThumbnailStripProps {
  originalImage: string;
  variations: GeneratedImage[];
  selectedId?: string;
  onSelect: (variationId: string | null) => void;
  onGenerateNew: () => void;
  disabled?: boolean;
}

export function ThumbnailStrip({
  originalImage,
  variations,
  selectedId,
  onSelect,
  onGenerateNew,
  disabled = false,
}: ThumbnailStripProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 p-1">
        {/* Original thumbnail - not selectable in strip, just for reference */}
        
        {/* Generated variations */}
        {variations.map((variation) => {
          const isSelected = selectedId === variation.id;
          
          return (
            <button
              key={variation.id}
              type="button"
              onClick={() => !disabled && onSelect(variation.id)}
              disabled={disabled}
              className={cn(
                "relative flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <img
                src={variation.url}
                alt="Variation"
                className="w-full h-full object-cover"
              />
            </button>
          );
        })}

        {/* Generate new button */}
        <button
          type="button"
          onClick={() => !disabled && onGenerateNew()}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 w-20 h-14 rounded-md border-2 border-dashed border-muted-foreground/30",
            "flex flex-col items-center justify-center gap-0.5",
            "transition-all hover:border-primary hover:bg-primary/5",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed hover:border-muted-foreground/30 hover:bg-transparent"
          )}
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">New</span>
        </button>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
