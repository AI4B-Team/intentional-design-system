import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2,
  Zap,
  Coins,
  ChevronDown,
  Upload,
  X,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { MaterialTypeSelector } from "./material-type-selector";
import { MaterialCard } from "./material-card";
import {
  MaterialCategory,
  MATERIAL_PLACEHOLDERS,
  MaterialItem,
  useMaterialLibrary,
} from "@/hooks/useMaterialLibrary";
import { useCredits } from "@/hooks/useCredits";
import { cn } from "@/lib/utils";
import { AddMaterialModal } from "./add-material-modal";

const SWAP_COST = 0.75;

interface MaterialSwapPanelProps {
  onGenerate: (params: {
    materialType: MaterialCategory;
    description: string;
    referenceImageUrl?: string;
    materialId?: string;
  }) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function MaterialSwapPanel({
  onGenerate,
  isGenerating,
  disabled = false,
}: MaterialSwapPanelProps) {
  const { balance } = useCredits();
  const { materials, createMaterial } = useMaterialLibrary();

  const [materialType, setMaterialType] = useState<MaterialCategory | null>(null);
  const [inputMode, setInputMode] = useState<"describe" | "reference">("describe");
  const [description, setDescription] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const filteredMaterials = materials.filter(
    (m) => !materialType || m.category === materialType
  );

  const placeholder = materialType
    ? MATERIAL_PLACEHOLDERS[materialType]
    : "Select a material type first";

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;
    setReferenceImage(file);
    setReferencePreview(URL.createObjectURL(file));
  };

  const handleGenerate = () => {
    if (!materialType) return;
    
    if (inputMode === "describe" && !description.trim()) return;
    if (inputMode === "reference" && !referencePreview) return;

    onGenerate({
      materialType,
      description: description.trim() || `${materialType} as shown in reference image`,
      referenceImageUrl: referencePreview || undefined,
    });
  };

  const handleSelectFromLibrary = (material: MaterialItem) => {
    setMaterialType(material.category as MaterialCategory);
    setInputMode("describe");
    setDescription(material.material_description);
    
    onGenerate({
      materialType: material.category as MaterialCategory,
      description: material.material_description,
      materialId: material.id,
    });
  };

  const noCredits = balance < SWAP_COST;
  const canGenerate =
    materialType &&
    ((inputMode === "describe" && description.trim()) ||
      (inputMode === "reference" && referencePreview));

  return (
    <div className="space-y-4">
      {/* Material Type Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">What do you want to change?</CardTitle>
        </CardHeader>
        <CardContent>
          <MaterialTypeSelector
            value={materialType}
            onChange={setMaterialType}
            disabled={isGenerating || disabled}
          />
        </CardContent>
      </Card>

      {/* Choose Material */}
      {materialType && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Choose Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input mode tabs */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={inputMode === "describe" ? "default" : "outline"}
                size="sm"
                onClick={() => setInputMode("describe")}
                disabled={isGenerating}
                className="flex-1"
              >
                Describe It
              </Button>
              <Button
                type="button"
                variant={inputMode === "reference" ? "default" : "outline"}
                size="sm"
                onClick={() => setInputMode("reference")}
                disabled={isGenerating}
                className="flex-1"
              >
                Use Reference
              </Button>
            </div>

            {inputMode === "describe" ? (
              <div className="space-y-2">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  disabled={isGenerating || disabled}
                  className="resize-none"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {referencePreview ? (
                  <div className="relative">
                    <img
                      src={referencePreview}
                      alt="Reference"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setReferenceImage(null);
                        setReferencePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background"
                      disabled={isGenerating}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="reference-upload"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFile(e.target.files[0]);
                      }}
                      disabled={isGenerating}
                    />
                    <label htmlFor="reference-upload" className="cursor-pointer">
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                      <p className="text-sm font-medium">Upload Material Photo</p>
                      <p className="text-xs text-muted-foreground">
                        From Lowe's, Home Depot, or your own
                      </p>
                    </label>
                  </div>
                )}

                {referencePreview && (
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional: Add details about the material..."
                    rows={2}
                    disabled={isGenerating}
                    className="resize-none"
                  />
                )}
              </div>
            )}

            {/* Save to library */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="save-to-library"
                checked={saveToLibrary}
                onCheckedChange={(checked) =>
                  setSaveToLibrary(checked === true)
                }
                disabled={isGenerating}
              />
              <Label htmlFor="save-to-library" className="text-sm cursor-pointer">
                Save to My Materials
              </Label>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating || noCredits || disabled}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying material...
                </>
              ) : (
                <>
                  Apply{" "}
                  {materialType &&
                    materialType.charAt(0).toUpperCase() + materialType.slice(1)}{" "}
                  (${SWAP_COST.toFixed(2)})
                </>
              )}
            </Button>

            {/* Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                <span>Takes 20-40 seconds</span>
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
                  Add more
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Material Library */}
      <Collapsible open={libraryOpen} onOpenChange={setLibraryOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  My Material Library ({filteredMaterials.length})
                </CardTitle>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    libraryOpen && "rotate-180"
                  )}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              {filteredMaterials.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredMaterials.slice(0, 4).map((material) => (
                      <MaterialCard
                        key={material.id}
                        material={material}
                        compact
                        selectable
                        onSelect={() => handleSelectFromLibrary(material)}
                      />
                    ))}
                  </div>
                  {filteredMaterials.length > 4 && (
                    <Link
                      to="/renovations/materials"
                      className="flex items-center justify-center gap-1 text-sm text-primary hover:underline"
                    >
                      Manage Library ({filteredMaterials.length} materials)
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <p>No saved materials yet</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowAddMaterial(true)}
                    className="mt-1"
                  >
                    Add your first material
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Tips Card */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Tips for Material Swaps
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use well-lit, straight-on photos</li>
            <li>• Higher resolution = better results</li>
            <li>• For flooring, capture the full floor area</li>
            <li>• Describe materials in detail for best AI results</li>
            <li>• Generate 2-3 variations to find the best one</li>
          </ul>
        </CardContent>
      </Card>

      {/* Add Material Modal */}
      <AddMaterialModal
        open={showAddMaterial}
        onOpenChange={setShowAddMaterial}
        onSubmit={(data) => createMaterial.mutateAsync(data)}
        isSubmitting={createMaterial.isPending}
        defaultCategory={materialType || undefined}
      />
    </div>
  );
}
