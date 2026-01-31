import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled?: boolean;
}

export function AddressInput({
  value,
  onChange,
  onAnalyze,
  isAnalyzing,
  disabled,
}: AddressInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim() && !disabled) {
      onAnalyze();
    }
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <div className="absolute left-4 z-10">
          <MapPin className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter property address (e.g., 123 Main St, Austin, TX 78701)"
          className={cn(
            "pl-12 pr-32 h-14 text-base rounded-xl border-2 transition-all",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "placeholder:text-muted-foreground/60"
          )}
          disabled={isAnalyzing}
        />
        <Button
          onClick={onAnalyze}
          disabled={!value.trim() || isAnalyzing || disabled}
          className={cn(
            "absolute right-2 h-10 px-4",
            "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          )}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </div>
      <p className="text-tiny text-muted-foreground mt-2 ml-1">
        Just enter an address and get instant AI-powered analysis
      </p>
    </div>
  );
}
