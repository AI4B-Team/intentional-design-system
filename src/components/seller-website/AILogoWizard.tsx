import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ArrowRight, X, Sparkles, Loader2, SkipForward, Check, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Step 1: Color Picker ──
const LOGO_COLORS = [
  { name: "Blue", gradient: "linear-gradient(135deg, #4F8EF7, #2563EB)", value: "blue" },
  { name: "Purple", gradient: "linear-gradient(135deg, #A855F7, #7C3AED)", value: "purple" },
  { name: "Pink", gradient: "linear-gradient(135deg, #F472B6, #EC4899)", value: "pink" },
  { name: "Red", gradient: "linear-gradient(135deg, #EF4444, #B91C1C)", value: "red" },
  { name: "Orange", gradient: "linear-gradient(135deg, #FB923C, #EA580C)", value: "orange" },
  { name: "Yellow", gradient: "linear-gradient(135deg, #FBBF24, #CA8A04)", value: "yellow" },
  { name: "Green", gradient: "linear-gradient(135deg, #4ADE80, #16A34A)", value: "green" },
  { name: "Teal", gradient: "linear-gradient(135deg, #2DD4BF, #0D9488)", value: "teal" },
  { name: "Cyan", gradient: "linear-gradient(135deg, #22D3EE, #0891B2)", value: "cyan" },
  { name: "White", gradient: "linear-gradient(135deg, #FAFAFA, #E5E5E5)", value: "white", dark: true },
  { name: "Black", gradient: "linear-gradient(135deg, #1E293B, #0F172A)", value: "black" },
  { name: "Greyscale", gradient: "linear-gradient(135deg, #94A3B8, #64748B)", value: "greyscale" },
];

const COLOR_EMOTIONS: Record<string, string> = {
  blue: "Trust, reliability, professionalism, and calm",
  purple: "Luxury, creativity, wisdom, and sophistication",
  pink: "Warmth, compassion, playfulness, and romance",
  red: "Power, energy, passion, desire, speed, strength, love, and intensity",
  orange: "Enthusiasm, creativity, warmth, and adventure",
  yellow: "Optimism, happiness, warmth, and attention",
  green: "Growth, health, nature, renewal, and prosperity",
  teal: "Sophistication, balance, calm, and creativity",
  cyan: "Innovation, technology, freshness, and modernity",
  white: "Purity, simplicity, cleanliness, minimalism, and elegance",
  black: "Power, sophistication, elegance, mystery, and authority",
  greyscale: "Power, elegance, reliability, intelligence, modesty, and maturity",
};

// ── Step 2: Logo Style ──
const LOGO_STYLES = [
  { id: "minimal", name: "Minimal", desc: "Clean, simple geometric shapes", preview: "AA" },
  { id: "modern", name: "Modern", desc: "Contemporary with sharp lines", preview: "Aa", font: "font-bold" },
  { id: "elegant", name: "Elegant", desc: "Sophisticated and refined", preview: "Aa", font: "italic" },
  { id: "bold", name: "Bold", desc: "Strong, impactful designs", preview: "AA", font: "font-black" },
  { id: "playful", name: "Playful", desc: "Fun and approachable", preview: "Aa", font: "font-medium" },
  { id: "tech", name: "Tech", desc: "Digital and futuristic", preview: "Aa", font: "font-light" },
];

// ── Step 3: Symbol Types ──
const SYMBOL_TYPES = [
  { id: "abstract", name: "Abstract Shapes", desc: "Geometric and non-representational" },
  { id: "arrows", name: "Arrows & Direction", desc: "Growth, movement, progress" },
  { id: "circles", name: "Circles & Rings", desc: "Unity, wholeness, infinity" },
  { id: "squares", name: "Squares & Diamonds", desc: "Stability, balance, structure" },
  { id: "lines", name: "Lines & Waves", desc: "Flow, connection, movement" },
  { id: "stars", name: "Stars & Sparks", desc: "Excellence, aspiration, energy" },
];

type WizardStep = "colors" | "style" | "symbols" | "generating" | "results";

interface AILogoWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  onSelectLogo: (logoUrl: string) => void;
}

export function AILogoWizard({ open, onOpenChange, companyName, onSelectLogo }: AILogoWizardProps) {
  const [step, setStep] = useState<WizardStep>("colors");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("minimal");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [slogan, setSlogan] = useState("");
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const resetWizard = () => {
    setStep("colors");
    setSelectedColors([]);
    setSelectedStyle("minimal");
    setSelectedSymbols([]);
    setSlogan("");
    setGeneratedLogos([]);
    setHoveredColor(null);
  };

  const toggleColor = (value: string) => {
    setSelectedColors((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const toggleSymbol = (id: string) => {
    setSelectedSymbols((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const generateLogos = async () => {
    setStep("generating");
    try {
      const { data, error } = await supabase.functions.invoke("ai-logo-generator", {
        body: {
          colors: selectedColors,
          style: selectedStyle,
          symbols: selectedSymbols.map(id => SYMBOL_TYPES.find(s => s.id === id)?.name || id),
          slogan,
          companyName,
        },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setStep("symbols");
        return;
      }

      setGeneratedLogos(data.logos || []);
      setStep("results");
    } catch (err) {
      console.error("Logo generation failed:", err);
      toast.error("Failed to generate logos. Please try again.");
      setStep("symbols");
    }
  };

  const handleSelectLogo = (logoUrl: string) => {
    onSelectLogo(logoUrl);
    onOpenChange(false);
    resetWizard();
    toast.success("Logo applied to your branding!");
  };

  const handleClose = () => {
    onOpenChange(false);
    resetWizard();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] p-0 gap-0 max-h-[85vh] flex flex-col">
        {/* Header */}
        {step !== "generating" && (
          <div className="flex items-center justify-between px-6 pt-6 pb-2 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {step === "colors" && "Pick Some Colors You Like"}
                {step === "style" && "Choose A Logo Style"}
                {step === "symbols" && "Select Symbol Types"}
                {step === "results" && "Pick Your Favorite Logo"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {step === "colors" && "Colors help convey emotion in your logo"}
                {step === "style" && "This defines the overall aesthetic"}
                {step === "symbols" && "What kind of shapes represent your brand?"}
                {step === "results" && "Click a design to use it"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {step !== "results" && (
                <button
                  onClick={() => {
                    if (step === "colors") setStep("style");
                    else if (step === "style") setStep("symbols");
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  Skip <SkipForward className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={handleClose} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
          {/* Step 1: Colors */}
          {step === "colors" && (
            <div className="grid grid-cols-3 gap-3">
              {LOGO_COLORS.map((color) => {
                const isSelected = selectedColors.includes(color.value);
                const isHovered = hoveredColor === color.value;
                return (
                  <button
                    key={color.value}
                    onClick={() => toggleColor(color.value)}
                    onMouseEnter={() => setHoveredColor(color.value)}
                    onMouseLeave={() => setHoveredColor(null)}
                    className={cn(
                      "relative h-24 rounded-xl text-left p-3 flex flex-col justify-end transition-all",
                      color.dark ? "text-foreground" : "text-white",
                      isSelected ? "ring-2 ring-foreground ring-offset-2" : "hover:ring-1 hover:ring-foreground/30 hover:ring-offset-1"
                    )}
                    style={{ background: color.gradient }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-foreground/80 flex items-center justify-center">
                        <Check className="h-3 w-3 text-background" />
                      </div>
                    )}
                    <span className="text-sm font-bold">{color.name}</span>
                    {(isSelected || isHovered) && (
                      <span className="text-[10px] opacity-90 leading-tight mt-0.5">
                        {COLOR_EMOTIONS[color.value]?.split(",").slice(0, 4).join(",") || ""}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Style */}
          {step === "style" && (
            <div className="grid grid-cols-3 gap-3">
              {LOGO_STYLES.map((s) => {
                const isSelected = selectedStyle === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={cn(
                      "p-5 rounded-xl border-2 text-center transition-all",
                      isSelected ? "border-brand bg-brand/5" : "border-border hover:border-brand/50"
                    )}
                  >
                    <div className={cn("text-2xl mb-2", s.font)}>{s.preview}</div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3: Symbols */}
          {step === "symbols" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {SYMBOL_TYPES.map((sym) => {
                  const isSelected = selectedSymbols.includes(sym.id);
                  return (
                    <button
                      key={sym.id}
                      onClick={() => toggleSymbol(sym.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all",
                        isSelected ? "border-brand bg-brand/5" : "border-border hover:border-brand/50"
                      )}
                    >
                      <Checkbox checked={isSelected} className="mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold">{sym.name}</div>
                        <div className="text-[11px] text-muted-foreground">{sym.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4">
                <Label className="text-sm font-semibold">Add A Slogan (Optional)</Label>
                <Input
                  value={slogan}
                  onChange={(v) => setSlogan(typeof v === "string" ? v : (v as any).target?.value || "")}
                  placeholder="e.g., Innovate. Create. Scale."
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Generating */}
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <Loader2 className="h-12 w-12 animate-spin text-brand" />
                <Sparkles className="h-5 w-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">Creating Your Logos...</h2>
              <p className="text-sm text-muted-foreground">This may take a moment</p>
              <p className="text-xs text-muted-foreground mt-4">Creating unique logos for you...</p>
              <p className="text-xs text-muted-foreground">This usually takes 10-20 seconds</p>
            </div>
          )}

          {/* Results */}
          {step === "results" && (
            <div className="grid grid-cols-3 gap-3">
              {generatedLogos.map((logo, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectLogo(logo)}
                  className="rounded-xl overflow-hidden border-2 border-border hover:border-brand hover:ring-2 hover:ring-brand/20 transition-all aspect-square"
                >
                  <img src={logo} alt={`Logo option ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "generating" && (
          <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-border flex-shrink-0">
            {step === "results" ? (
              <>
                <Button variant="outline" onClick={resetWizard}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
                <Button onClick={generateLogos} className="bg-brand hover:bg-brand/90 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate More
                </Button>
              </>
            ) : step === "symbols" ? (
              <Button onClick={generateLogos} className="bg-brand hover:bg-brand/90 text-white px-8">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Logos
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (step === "colors") setStep("style");
                  else if (step === "style") setStep("symbols");
                }}
                className="bg-brand hover:bg-brand/90 text-white px-8"
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
