import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface StylePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  examplePrompt: string;
}

export const STAGING_STYLES: StylePreset[] = [
  {
    id: "modern",
    name: "Modern Minimalist",
    icon: "🪴",
    description: "Clean lines, neutral tones, sleek furniture",
    examplePrompt: "modern minimalist style with clean lines, neutral color palette, sleek contemporary furniture, minimal decor",
  },
  {
    id: "farmhouse",
    name: "Farmhouse Chic",
    icon: "🏠",
    description: "Rustic warmth with modern comfort",
    examplePrompt: "farmhouse chic style with rustic wood elements, shiplap accents, cozy textiles, vintage-inspired decor",
  },
  {
    id: "luxury",
    name: "Luxury Contemporary",
    icon: "✨",
    description: "High-end finishes and elegant details",
    examplePrompt: "luxury contemporary style with high-end finishes, elegant furniture, marble accents, designer lighting",
  },
  {
    id: "coastal",
    name: "Coastal Retreat",
    icon: "🌊",
    description: "Beach-inspired, light and airy",
    examplePrompt: "coastal style with light colors, natural textures, beach-inspired decor, airy and relaxed atmosphere",
  },
  {
    id: "industrial",
    name: "Industrial Loft",
    icon: "🏭",
    description: "Exposed elements, urban edge",
    examplePrompt: "industrial loft style with exposed brick, metal accents, raw materials, urban warehouse aesthetic",
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    icon: "❄️",
    description: "Light, functional, hygge-inspired",
    examplePrompt: "scandinavian style with light wood, white walls, functional furniture, cozy textiles, hygge atmosphere",
  },
  {
    id: "traditional",
    name: "Traditional",
    icon: "🏛️",
    description: "Classic elegance and timeless appeal",
    examplePrompt: "traditional style with classic furniture, rich colors, ornate details, timeless elegant decor",
  },
];

interface StylePresetSelectorProps {
  value: string;
  onChange: (styleId: string) => void;
  disabled?: boolean;
}

export function StylePresetSelector({
  value,
  onChange,
  disabled = false,
}: StylePresetSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
      {STAGING_STYLES.map((style) => {
        const isSelected = value === style.id;
        
        return (
          <Tooltip key={style.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => !disabled && onChange(style.id)}
                disabled={disabled}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                  "hover:border-primary/50 hover:bg-accent/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card",
                  disabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-card"
                )}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <span className="text-2xl">{style.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">
                  {style.name}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px]">
              <p className="font-medium">{style.name}</p>
              <p className="text-xs text-muted-foreground">{style.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
