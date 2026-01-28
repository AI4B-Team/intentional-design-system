import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import {
  useRenovationProject,
  RenovationImage,
  GeneratedImage,
} from "@/hooks/useRenovationProjects";
import { BeforeAfterSlider } from "@/components/renovations/before-after-slider";
import { StylePresetSelector, STAGING_STYLES } from "@/components/renovations/style-preset-selector";
import { ThumbnailStrip } from "@/components/renovations/thumbnail-strip";
import { VariationsGrid } from "@/components/renovations/variations-grid";
import { CreditsBadge } from "@/components/renovations/credits-badge";
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

export default function ImageEditor() {
  const { projectId, imageId } = useParams<{ projectId: string; imageId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, refreshBalance } = useCredits();
  const { project, images, updateImage } = useRenovationProject(projectId);

  const [activeTab, setActiveTab] = useState<"compare" | "before" | "after">("compare");
  const [selectedStyle, setSelectedStyle] = useState("modern");
  const [customInstructions, setCustomInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [variationsOpen, setVariationsOpen] = useState(true);

  // Find the current image
  const currentImage = useMemo(() => {
    return images.find((img) => img.id === imageId);
  }, [images, imageId]);

  // Get generated variations
  const variations = useMemo(() => {
    return (currentImage?.generated_images || []).filter(
      (img) => img.type === "staging"
    );
  }, [currentImage]);

  // Selected after image
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  
  const selectedVariation = useMemo(() => {
    if (!selectedVariationId && variations.length > 0) {
      return variations[0];
    }
    return variations.find((v) => v.id === selectedVariationId) || variations[0];
  }, [variations, selectedVariationId]);

  // Room type from image
  const [roomType, setRoomType] = useState(currentImage?.room_type || "Living Room");

  useEffect(() => {
    if (currentImage?.room_type) {
      setRoomType(currentImage.room_type);
    }
  }, [currentImage?.room_type]);

  // Auto-select first variation or use selected_after
  useEffect(() => {
    if (currentImage?.selected_after_id) {
      setSelectedVariationId(currentImage.selected_after_id);
    } else if (variations.length > 0 && !selectedVariationId) {
      setSelectedVariationId(variations[0].id);
    }
  }, [currentImage?.selected_after_id, variations, selectedVariationId]);

  const handleGenerate = async () => {
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

      // Add the new variation to the image
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
      setActiveTab("compare");
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
    
    await updateImage.mutateAsync({
      id: currentImage.id,
      generated_images: updatedVariations,
      ...(wasSelected && updatedVariations.length > 0
        ? {
            selected_after_url: updatedVariations[0].url,
            selected_after_id: updatedVariations[0].id,
          }
        : wasSelected
        ? { selected_after_url: null, selected_after_id: null }
        : {}),
    });

    if (wasSelected && updatedVariations.length > 0) {
      setSelectedVariationId(updatedVariations[0].id);
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
      link.download = `${currentImage.area_label || currentImage.room_type || "room"}-${selectedStyle}-after.jpg`;
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

  const hasAfterImage = selectedVariation?.url;
  const noCredits = balance < STAGING_COST;

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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
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
                    After - {STAGING_STYLES.find((s) => s.id === selectedVariation.style)?.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-muted aspect-video rounded-lg">
                  <p className="text-muted-foreground">No staged version yet</p>
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
                      Generate a staged version to compare
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
                onClick={handleGenerate}
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
                      Generated Variations ({variations.length})
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
