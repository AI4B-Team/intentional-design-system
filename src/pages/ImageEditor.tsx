import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  Loader2,
  Zap,
  Coins,
  ChevronDown,
  ImageIcon,
  Paintbrush,
  Sofa,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import {
  useRenovationProject,
  GeneratedImage,
} from "@/hooks/useRenovationProjects";
import { useMaterialLibrary, MaterialCategory, MATERIAL_CATEGORIES } from "@/hooks/useMaterialLibrary";
import { BeforeAfterSlider } from "@/components/renovations/before-after-slider";
import { StylePresetSelector, STAGING_STYLES } from "@/components/renovations/style-preset-selector";
import { ThumbnailStrip } from "@/components/renovations/thumbnail-strip";
import { VariationsGrid } from "@/components/renovations/variations-grid";
import { CreditsBadge } from "@/components/renovations/credits-badge";
import { MaterialSwapPanel } from "@/components/renovations/material-swap-panel";
import { cn } from "@/lib/utils";

const ROOM_TYPES = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dining Room",
  "Office",
  "Exterior - Front",
  "Exterior - Back",
  "Other",
];

const STAGING_COST = 0.50;
const SWAP_COST = 0.75;

export default function ImageEditor() {
  const { projectId, imageId } = useParams<{ projectId: string; imageId: string }>();
  const { user } = useAuth();
  const { balance, refreshBalance } = useCredits();
  const { project, images, updateImage } = useRenovationProject(projectId);
  const { incrementUseCount } = useMaterialLibrary();

  // View tabs (before/after/compare)
  const [viewTab, setViewTab] = useState<"compare" | "before" | "after">("compare");
  // Mode tabs (staging vs material swap)
  const [modeTab, setModeTab] = useState<"staging" | "materials">("staging");
  
  // Staging state
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [customInstructions, setCustomInstructions] = useState("");
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [variationsOpen, setVariationsOpen] = useState(true);

  // Find the current image
  const currentImage = useMemo(() => {
    return images.find((img) => img.id === imageId);
  }, [images, imageId]);

  // Get all generated variations
  const allVariations = useMemo(() => {
    return currentImage?.generated_images || [];
  }, [currentImage]);

  // Filter variations by current mode
  const variations = useMemo(() => {
    return allVariations.filter((img) =>
      modeTab === "staging" ? img.type === "staging" : img.type === "material_swap"
    );
  }, [allVariations, modeTab]);

  // Selected after image
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  
  const selectedVariation = useMemo(() => {
    // First try to find in current mode's variations
    const found = variations.find((v) => v.id === selectedVariationId);
    if (found) return found;
    // Fallback to first variation in current mode
    return variations[0] || null;
  }, [variations, selectedVariationId]);

  // Room type from image
  const [roomType, setRoomType] = useState(currentImage?.room_type || "Living Room");

  useEffect(() => {
    if (currentImage?.room_type) {
      setRoomType(currentImage.room_type);
    }
  }, [currentImage?.room_type]);

  // Auto-select variation when mode changes or variations update
  useEffect(() => {
    if (variations.length > 0) {
      // If current selection is not in this mode's variations, select the first one
      if (!variations.find((v) => v.id === selectedVariationId)) {
        setSelectedVariationId(variations[0].id);
      }
    } else {
      setSelectedVariationId(null);
    }
  }, [variations, modeTab]);

  const handleStagingGenerate = async () => {
    if (!user || !currentImage) return;

    if (balance < STAGING_COST) {
      toast.error("Insufficient credits. Please add more to continue.");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("virtual-staging", {
        body: {
          imageUrl: currentImage.original_image_url,
          roomType,
          style: selectedStyle,
          customInstructions: customInstructions.trim() || undefined,
          userId: user.id,
          imageId: currentImage.id,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Insufficient")) {
          toast.error("Insufficient credits. Please add more to continue.");
        } else {
          throw new Error(data.error);
        }
        return;
      }

      const newVariation: GeneratedImage = {
        id: data.variationId,
        url: data.imageUrl,
        type: "staging",
        style: selectedStyle,
        prompt: data.prompt,
        created_at: new Date().toISOString(),
      };

      const updatedVariations = [...(currentImage.generated_images || []), newVariation];

      await updateImage.mutateAsync({
        id: currentImage.id,
        generated_images: updatedVariations,
        selected_after_url: data.imageUrl,
        selected_after_id: data.variationId,
        total_credits_used: (currentImage.total_credits_used || 0) + STAGING_COST,
      });

      setSelectedVariationId(data.variationId);
      refreshBalance();
      toast.success("Staging complete! Swipe to compare.");
      setViewTab("compare");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMaterialSwapGenerate = async (params: {
    materialType: MaterialCategory;
    description: string;
    referenceImageUrl?: string;
    materialId?: string;
  }) => {
    if (!user || !currentImage) return;

    if (balance < SWAP_COST) {
      toast.error("Insufficient credits. Please add more to continue.");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-material-swap", {
        body: {
          imageUrl: currentImage.original_image_url,
          materialType: params.materialType,
          description: params.description,
          referenceImageUrl: params.referenceImageUrl,
          userId: user.id,
          imageId: currentImage.id,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Insufficient")) {
          toast.error("Insufficient credits. Please add more to continue.");
        } else {
          throw new Error(data.error);
        }
        return;
      }

      // Increment material use count if used from library
      if (params.materialId) {
        incrementUseCount.mutate(params.materialId);
      }

      const category = MATERIAL_CATEGORIES.find((c) => c.id === params.materialType);
      
      const newVariation: GeneratedImage = {
        id: data.variationId,
        url: data.imageUrl,
        type: "material_swap",
        style: params.materialType,
        prompt: params.description,
        created_at: new Date().toISOString(),
      };

      const updatedVariations = [...(currentImage.generated_images || []), newVariation];

      await updateImage.mutateAsync({
        id: currentImage.id,
        generated_images: updatedVariations,
        selected_after_url: data.imageUrl,
        selected_after_id: data.variationId,
        total_credits_used: (currentImage.total_credits_used || 0) + SWAP_COST,
      });

      setSelectedVariationId(data.variationId);
      refreshBalance();
      toast.success(`${category?.name || "Material"} swap complete! Check the comparison.`);
      setViewTab("compare");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariation = async (variation: GeneratedImage) => {
    if (!currentImage) return;
    
    setSelectedVariationId(variation.id);
    
    await updateImage.mutateAsync({
      id: currentImage.id,
      selected_after_url: variation.url,
      selected_after_id: variation.id,
    });
  };

  const handleDeleteVariation = async (variationId: string) => {
    if (!currentImage) return;

    const updatedVariations = (currentImage.generated_images || []).filter(
      (v) => v.id !== variationId
    );

    const wasSelected = selectedVariationId === variationId;
    const remainingInMode = updatedVariations.filter((v) =>
      modeTab === "staging" ? v.type === "staging" : v.type === "material_swap"
    );
    
    await updateImage.mutateAsync({
      id: currentImage.id,
      generated_images: updatedVariations,
      ...(wasSelected && remainingInMode.length > 0
        ? {
            selected_after_url: remainingInMode[0].url,
            selected_after_id: remainingInMode[0].id,
          }
        : wasSelected
        ? { selected_after_url: null, selected_after_id: null }
        : {}),
    });

    if (wasSelected && remainingInMode.length > 0) {
      setSelectedVariationId(remainingInMode[0].id);
    } else if (wasSelected) {
      setSelectedVariationId(null);
    }

    toast.success("Variation deleted");
  };

  const handleDownload = (type: "before" | "after" | "comparison") => {
    if (!currentImage) return;

    if (type === "before") {
      const link = document.createElement("a");
      link.href = currentImage.original_image_url;
      link.download = `${currentImage.area_label || currentImage.room_type || "room"}-before.jpg`;
      link.click();
    } else if (type === "after" && selectedVariation) {
      const link = document.createElement("a");
      link.href = selectedVariation.url;
      link.download = `${currentImage.area_label || currentImage.room_type || "room"}-${selectedVariation.style}-after.jpg`;
      link.click();
    } else if (type === "comparison") {
      toast.info("Side-by-side download coming soon!");
    }
  };

  if (!currentImage) {
    return (
      <PageLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Image not found</h2>
          <p className="text-muted-foreground mb-4">
            This image may have been deleted.
          </p>
          <Button asChild>
            <Link to={`/renovations/${projectId}`}>Back to Project</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const hasAfterImage = !!selectedVariation?.url;
  const noCredits = balance < (modeTab === "staging" ? STAGING_COST : SWAP_COST);

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <Link
            to={`/renovations/${projectId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {project?.name || "Project"}
          </Link>
          <h1 className="text-2xl font-bold">
            {currentImage.area_label || currentImage.room_type || "Image Editor"}
          </h1>
        </div>
        <CreditsBadge />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Image Preview */}
        <div className="lg:col-span-3 space-y-4">
          {/* View Tabs */}
          <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as typeof viewTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="before">Before</TabsTrigger>
              <TabsTrigger value="after" disabled={!hasAfterImage}>
                After
              </TabsTrigger>
              <TabsTrigger value="compare" disabled={!hasAfterImage}>
                Compare
              </TabsTrigger>
            </TabsList>

            <TabsContent value="before" className="mt-4">
              <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                <img
                  src={currentImage.original_image_url}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-4 left-4 text-xs font-medium px-2 py-1 rounded bg-background/80 backdrop-blur-sm">
                  Before
                </span>
              </div>
            </TabsContent>

            <TabsContent value="after" className="mt-4">
              {selectedVariation ? (
                <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                  <img
                    src={selectedVariation.url}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-4 right-4 text-xs font-medium px-2 py-1 rounded bg-background/80 backdrop-blur-sm">
                    After - {
                      selectedVariation.type === "staging"
                        ? STAGING_STYLES.find((s) => s.id === selectedVariation.style)?.name
                        : MATERIAL_CATEGORIES.find((c) => c.id === selectedVariation.style)?.name
                    }
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-muted aspect-video rounded-lg">
                  <p className="text-muted-foreground">No generated version yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="compare" className="mt-4">
              {selectedVariation ? (
                <BeforeAfterSlider
                  beforeImage={currentImage.original_image_url}
                  afterImage={selectedVariation.url}
                  className="aspect-video"
                />
              ) : (
                <div className="flex items-center justify-center bg-muted aspect-video rounded-lg">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Generate a version to compare
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Thumbnail Strip */}
          {variations.length > 0 && (
            <div className="pt-2">
              <ThumbnailStrip
                originalImage={currentImage.original_image_url}
                variations={variations}
                selectedId={selectedVariationId || undefined}
                onSelect={(id) => {
                  const variation = variations.find((v) => v.id === id);
                  if (variation) handleSelectVariation(variation);
                }}
                onGenerateNew={() => {
                  document.getElementById("generate-btn")?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={isGenerating}
              />
            </div>
          )}
        </div>

        {/* Right Column - Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Mode Tabs */}
          <Tabs value={modeTab} onValueChange={(v) => setModeTab(v as typeof modeTab)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="staging" disabled={isGenerating} className="gap-2">
                <Sofa className="h-4 w-4" />
                Stage Room
              </TabsTrigger>
              <TabsTrigger value="materials" disabled={isGenerating} className="gap-2">
                <Paintbrush className="h-4 w-4" />
                Swap Materials
              </TabsTrigger>
            </TabsList>

            <TabsContent value="staging" className="mt-4 space-y-4">
              {/* Virtual Staging Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Virtual Staging</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Room Type */}
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select
                      value={roomType}
                      onValueChange={setRoomType}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Style Preset */}
                  <div className="space-y-2">
                    <Label>Style Preset</Label>
                    <StylePresetSelector
                      value={selectedStyle}
                      onChange={setSelectedStyle}
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Custom Instructions */}
                  <div className="space-y-2">
                    <Label>Custom Instructions (optional)</Label>
                    <Textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value.slice(0, 200))}
                      placeholder="Include a sectional sofa, no TV, lots of plants..."
                      rows={3}
                      disabled={isGenerating}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {customInstructions.length}/200
                    </p>
                  </div>

                  {/* Generate Button */}
                  <Button
                    id="generate-btn"
                    onClick={handleStagingGenerate}
                    disabled={isGenerating || noCredits}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Staged Room (${STAGING_COST.toFixed(2)})
                      </>
                    )}
                  </Button>

                  {/* Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4" />
                      <span>Takes 15-30 seconds</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-4 w-4" />
                      <span>${balance.toFixed(2)}</span>
                    </div>
                  </div>

                  {noCredits && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                      Insufficient credits.{" "}
                      <Link to="/settings/credits" className="underline font-medium">
                        Add more credits
                      </Link>{" "}
                      to continue.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="mt-4">
              <MaterialSwapPanel
                onGenerate={handleMaterialSwapGenerate}
                isGenerating={isGenerating}
                disabled={false}
              />
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDownload("before")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Before
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDownload("after")}
                disabled={!hasAfterImage}
              >
                <Download className="mr-2 h-4 w-4" />
                Download After
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDownload("comparison")}
                disabled={!hasAfterImage}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Side-by-Side
              </Button>
            </CardContent>
          </Card>

          {/* Variations */}
          <Collapsible open={variationsOpen} onOpenChange={setVariationsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {modeTab === "staging" ? "Staging" : "Material"} Variations ({variations.length})
                    </CardTitle>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-transform",
                        variationsOpen && "rotate-180"
                      )}
                    />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <VariationsGrid
                    variations={variations}
                    selectedId={selectedVariationId || undefined}
                    onSelect={handleSelectVariation}
                    onDelete={handleDeleteVariation}
                    disabled={isGenerating}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </PageLayout>
  );
}
