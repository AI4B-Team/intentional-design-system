import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, MoreVertical, ExternalLink, Trash2, Edit } from "lucide-react";
import { MaterialItem, MATERIAL_CATEGORIES } from "@/hooks/useMaterialLibrary";
import { cn } from "@/lib/utils";

interface MaterialCardProps {
  material: MaterialItem;
  onSelect?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  selectable?: boolean;
  compact?: boolean;
}

export function MaterialCard({
  material,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  selectable = false,
  compact = false,
}: MaterialCardProps) {
  const category = MATERIAL_CATEGORIES.find((c) => c.id === material.category);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-2 rounded-lg border transition-all",
          selectable && "cursor-pointer hover:border-primary hover:bg-accent/50"
        )}
        onClick={selectable ? onSelect : undefined}
      >
        <img
          src={material.image_url}
          alt={material.name}
          className="w-12 h-12 rounded object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{material.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {category?.name}
          </p>
        </div>
        {selectable && (
          <Button size="sm" variant="secondary" onClick={onSelect}>
            Use
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-square">
        <img
          src={material.image_url}
          alt={material.name}
          className="w-full h-full object-cover"
        />

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={cn(
              "absolute top-2 left-2 p-1.5 rounded-full transition-all",
              material.is_favorite
                ? "bg-primary text-primary-foreground"
                : "bg-background/80 text-muted-foreground hover:text-primary"
            )}
          >
            <Star
              className={cn(
                "h-4 w-4",
                material.is_favorite && "fill-current"
              )}
            />
          </button>
        )}

        {/* Actions menu */}
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {material.source_url && (
                <DropdownMenuItem asChild>
                  <a
                    href={material.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Source
                  </a>
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Select overlay */}
        {selectable && (
          <div
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
            onClick={onSelect}
          >
            <Button variant="secondary">Use This</Button>
          </div>
        )}
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm line-clamp-1">{material.name}</h3>
          <Badge variant="secondary" className="text-[10px] flex-shrink-0">
            {category?.icon} {category?.name}
          </Badge>
        </div>

        {material.source_name && (
          <p className="text-xs text-muted-foreground">{material.source_name}</p>
        )}

        {(material.brand || material.product_name) && (
          <p className="text-xs text-muted-foreground truncate">
            {[material.brand, material.product_name].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          {material.price_per_unit && material.unit ? (
            <span>
              ${material.price_per_unit.toFixed(2)}/{material.unit}
            </span>
          ) : (
            <span />
          )}
          <span>Used {material.use_count}×</span>
        </div>
      </div>
    </Card>
  );
}
