import { cn } from "@/lib/utils";
import { MATERIAL_CATEGORIES, MaterialCategory } from "@/hooks/useMaterialLibrary";

interface MaterialTypeSelectorProps {
  value: MaterialCategory | null;
  onChange: (type: MaterialCategory) => void;
  disabled?: boolean;
}

export function MaterialTypeSelector({
  value,
  onChange,
  disabled = false,
}: MaterialTypeSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {MATERIAL_CATEGORIES.map((category) => {
        const isSelected = value === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => !disabled && onChange(category.id)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
              "hover:border-primary/50 hover:bg-accent/50",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-card",
              disabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-card"
            )}
          >
            <span className="text-xl">{category.icon}</span>
            <span className="text-xs font-medium text-center leading-tight">
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
