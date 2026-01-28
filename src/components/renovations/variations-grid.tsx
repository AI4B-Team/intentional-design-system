import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Check } from "lucide-react";
import { GeneratedImage } from "@/hooks/useRenovationProjects";
import { STAGING_STYLES } from "./style-preset-selector";
import { cn } from "@/lib/utils";

interface VariationsGridProps {
  variations: GeneratedImage[];
  selectedId?: string;
  onSelect: (variation: GeneratedImage) => void;
  onDelete: (variationId: string) => void;
  disabled?: boolean;
}

export function VariationsGrid({
  variations,
  selectedId,
  onSelect,
  onDelete,
  disabled = false,
}: VariationsGridProps) {
  if (variations.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No variations generated yet. Use the controls above to create your first staged room.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      {variations.map((variation) => {
        const isSelected = selectedId === variation.id;
        const style = STAGING_STYLES.find((s) => s.id === variation.style);
        
        return (
          <div
            key={variation.id}
            className={cn(
              "relative group rounded-lg overflow-hidden border-2 transition-all",
              isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
              !disabled && "hover:border-primary/50"
            )}
          >
            <img
              src={variation.url}
              alt={`${style?.name || "Staged"} variation`}
              className="w-full aspect-video object-cover"
            />
            
            {/* Info overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {style?.name || variation.type}
                  </p>
                  <p className="text-[10px] text-white/70">
                    {format(new Date(variation.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
                
                {isSelected && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    <Check className="h-3 w-3 mr-0.5" />
                    Selected
                  </Badge>
                )}
              </div>
            </div>

            {/* Hover actions */}
            <div className={cn(
              "absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity",
              disabled ? "hidden" : "opacity-0 group-hover:opacity-100"
            )}>
              {!isSelected && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onSelect(variation)}
                >
                  Use This
                </Button>
              )}
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(variation.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
