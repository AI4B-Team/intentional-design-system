import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AIWriterField } from "./AIWriterField";
import { AILogoWizard } from "./AILogoWizard";
import {
  Upload,
  X,
  Check,
  Sparkles,
  Loader2,
  Rocket,
  Zap,
  Star,
  Shield,
  Flame,
  Target,
  Crown,
  Diamond,
  Building2,
  Home,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Predefined Icons ──
const PREDEFINED_ICONS = [
  { id: "rocket", icon: Rocket, color: "#ef4444", bg: "#fef2f2" },
  { id: "zap", icon: Zap, color: "#f59e0b", bg: "#fffbeb" },
  { id: "star", icon: Star, color: "#8b5cf6", bg: "#f5f3ff" },
  { id: "shield", icon: Shield, color: "#06b6d4", bg: "#ecfeff" },
  { id: "flame", icon: Flame, color: "#f97316", bg: "#fff7ed" },
  { id: "target", icon: Target, color: "#ec4899", bg: "#fdf2f8" },
  { id: "crown", icon: Crown, color: "#eab308", bg: "#fefce8" },
  { id: "diamond", icon: Diamond, color: "#6366f1", bg: "#eef2ff" },
  { id: "building", icon: Building2, color: "#64748b", bg: "#f8fafc" },
  { id: "home", icon: Home, color: "#10b981", bg: "#ecfdf5" },
];

// ── Color Presets ──
const COLOR_PRESETS = [
  { name: "Ocean Blue", primary: "#2563EB", accent: "#10B981" },
  { name: "Bold Red", primary: "#DC2626", accent: "#F59E0B" },
  { name: "Forest Green", primary: "#16A34A", accent: "#0EA5E9" },
  { name: "Royal Purple", primary: "#7C3AED", accent: "#EC4899" },
  { name: "Slate Pro", primary: "#1E293B", accent: "#2563EB" },
  { name: "Warm Amber", primary: "#D97706", accent: "#10B981" },
  { name: "Crimson & Gold", primary: "#BE123C", accent: "#CA8A04" },
  { name: "Teal Modern", primary: "#0D9488", accent: "#6366F1" },
];

// ── Font Pairings ──
const FONT_PAIRINGS = [
  { id: "default", heading: "Inter", body: "Inter", label: "Clean & Modern" },
  { id: "serif", heading: "Georgia", body: "Inter", label: "Classic & Trustworthy" },
  { id: "bold", heading: "Impact", body: "Arial", label: "Bold & Direct" },
  { id: "elegant", heading: "Playfair Display", body: "Lato", label: "Elegant & Premium" },
  { id: "friendly", heading: "Nunito", body: "Open Sans", label: "Friendly & Approachable" },
  { id: "tech", heading: "Space Grotesk", body: "IBM Plex Sans", label: "Tech & Startup" },
];

interface BrandingStepProps {
  logoUrl: string;
  faviconUrl: string;
  selectedIcon: string;
  logoMode: "icon" | "upload";
  primaryColor: string;
  accentColor: string;
  fontPairing: string;
  companyName: string;
  siteType: string;
  onUpdate: (updates: Record<string, any>) => void;
  aiWriter: {
    loadingField: string | null;
    generateCopy: (fieldType: string, currentValue: string, context?: string) => Promise<string | null>;
  };
}

export function BrandingStep({
  logoUrl,
  faviconUrl,
  selectedIcon,
  logoMode,
  primaryColor,
  accentColor,
  fontPairing,
  companyName,
  siteType,
  onUpdate,
  aiWriter,
}: BrandingStepProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [showLogoWizard, setShowLogoWizard] = useState(false);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "faviconUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return; // 2MB limit
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ [field]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAISuggestBranding = async () => {
    setAiSuggesting(true);
    try {
      // Use AI writer to suggest a tagline/brand identity
      const result = await aiWriter.generateCopy(
        "generic",
        `Brand name: ${companyName}, Site type: ${siteType}`,
        "Suggest a 5-word brand tagline"
      );
      // We don't directly apply it, just trigger the suggestion
    } finally {
      setAiSuggesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Logo & Icon ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-brand/10">
            <Sparkles className="h-4 w-4 text-brand" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Logo & Icon</h3>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onUpdate({ logoMode: "icon" })}
            className={cn(
              "p-4 rounded-lg border-2 text-center transition-all",
              logoMode === "icon"
                ? "border-brand bg-brand/5"
                : "border-border hover:border-brand/50"
            )}
          >
            <div className="font-medium text-sm">Use Predefined Icons</div>
            <div className="text-xs text-muted-foreground mt-1">
              Choose from our icon library
            </div>
          </button>
          <button
            onClick={() => onUpdate({ logoMode: "upload" })}
            className={cn(
              "p-4 rounded-lg border-2 text-center transition-all",
              logoMode === "upload"
                ? "border-brand bg-brand/5"
                : "border-border hover:border-brand/50"
            )}
          >
            <div className="font-medium text-sm">Use Your Own Logo</div>
            <div className="text-xs text-muted-foreground mt-1">
              Upload custom artwork
            </div>
          </button>
        </div>

        {/* AI Logo Wizard Button */}
        <Button
          onClick={() => setShowLogoWizard(true)}
          className="w-full bg-brand hover:bg-brand/90 text-white py-5 text-sm font-semibold"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Create Logo With AI Wizard
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">Or Quick Generate</span>
          <div className="flex-1 border-t border-border" />
        </div>

        {logoMode === "icon" ? (
          <div>
            <Label className="text-xs mb-2 block">Select Icon</Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_ICONS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      onUpdate({ selectedIcon: item.id, logoUrl: "" })
                    }
                    className={cn(
                      "w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-brand ring-2 ring-brand/20"
                        : "border-border hover:border-brand/50"
                    )}
                    style={{ backgroundColor: item.bg }}
                  >
                    <Icon className="h-6 w-6" style={{ color: item.color }} />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Logo Upload */}
            <div>
              <Label className="text-xs mb-2 block">Logo</Label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "logoUrl")}
              />
              {logoUrl ? (
                <div className="relative border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center bg-muted/20">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="max-h-16 max-w-full object-contain"
                  />
                  <button
                    onClick={() => onUpdate({ logoUrl: "" })}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-brand/50 transition-colors"
                >
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Click To Upload Logo
                  </p>
                </button>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">
                Tip: Transparent PNGs with a square layout look best.
              </p>
            </div>

            {/* Favicon Upload */}
            <div>
              <Label className="text-xs mb-2 block">Favicon</Label>
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "faviconUrl")}
              />
              {faviconUrl ? (
                <div className="relative border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center bg-muted/20">
                  <img
                    src={faviconUrl}
                    alt="Favicon"
                    className="max-h-16 max-w-full object-contain"
                  />
                  <button
                    onClick={() => onUpdate({ faviconUrl: "" })}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => faviconInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-brand/50 transition-colors"
                >
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Click To Upload Favicon
                  </p>
                </button>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">
                We optimize the favicon automatically.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Colors & Theme ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-brand/10">
            <Sparkles className="h-4 w-4 text-brand" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Colors & Theme
          </h3>
        </div>

        <p className="text-xs text-muted-foreground">
          Pick an accent color and fine-tune it to match your brand personality.
        </p>

        {/* Presets */}
        <div>
          <Label className="text-xs mb-2 block">Quick Presets</Label>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PRESETS.map((preset) => {
              const isSelected =
                preset.primary === primaryColor &&
                preset.accent === accentColor;
              return (
                <button
                  key={preset.name}
                  onClick={() =>
                    onUpdate({
                      primaryColor: preset.primary,
                      accentColor: preset.accent,
                    })
                  }
                  className={cn(
                    "p-2 rounded-lg border-2 text-center transition-all",
                    isSelected
                      ? "border-brand ring-1 ring-brand/20"
                      : "border-border hover:border-brand/50"
                  )}
                >
                  <div className="flex justify-center gap-1 mb-1">
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>
                  <div className="text-[10px] font-medium truncate">
                    {preset.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryColor" className="text-xs">
              Primary Color
            </Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) =>
                  onUpdate({ primaryColor: e.target.value })
                }
                className="w-10 h-10 rounded cursor-pointer border border-border"
              />
              <Input
                id="primaryColor"
                value={primaryColor}
                onChange={(v) => onUpdate({ primaryColor: v })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="accentColor" className="text-xs">
              Accent Color
            </Label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={accentColor}
                onChange={(e) =>
                  onUpdate({ accentColor: e.target.value })
                }
                className="w-10 h-10 rounded cursor-pointer border border-border"
              />
              <Input
                id="accentColor"
                value={accentColor}
                onChange={(v) => onUpdate({ accentColor: v })}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Font Pairing ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-brand/10">
            <Sparkles className="h-4 w-4 text-brand" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Typography</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FONT_PAIRINGS.map((fp) => {
            const isSelected = fontPairing === fp.id;
            return (
              <button
                key={fp.id}
                onClick={() => onUpdate({ fontPairing: fp.id })}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all",
                  isSelected
                    ? "border-brand bg-brand/5"
                    : "border-border hover:border-brand/50"
                )}
              >
                <div
                  className="text-base font-bold leading-tight mb-0.5"
                  style={{ fontFamily: fp.heading }}
                >
                  {fp.heading}
                </div>
                <div
                  className="text-xs text-muted-foreground"
                  style={{ fontFamily: fp.body }}
                >
                  {fp.label}
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-brand mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── AI Branding Suggestions ── */}
      <div className="rounded-lg border border-brand/20 bg-brand/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-semibold text-foreground">
            AI Branding Assistant
          </h4>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Let AI suggest colors, fonts, and a tagline based on your business
          type and name.
        </p>
        <AIWriterField
          label="Brand Tagline"
          fieldType="brandTagline"
          value=""
          onChange={() => {}}
          placeholder={`e.g. "We Buy Houses — Fast, Fair, Simple"`}
          loadingField={aiWriter.loadingField}
          onGenerate={aiWriter.generateCopy}
          context={`Company: ${companyName}, Site type: ${siteType}`}
        />
      </div>

      {/* AI Logo Wizard Modal */}
      <AILogoWizard
        open={showLogoWizard}
        onOpenChange={setShowLogoWizard}
        companyName={companyName}
        onSelectLogo={(url) => {
          onUpdate({ logoUrl: url, logoMode: "upload" });
        }}
      />
    </div>
  );
}
