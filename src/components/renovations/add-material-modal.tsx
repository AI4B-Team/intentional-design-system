import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  MATERIAL_CATEGORIES,
  MATERIAL_SOURCES,
  CreateMaterialInput,
} from "@/hooks/useMaterialLibrary";

interface AddMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateMaterialInput) => void;
  isSubmitting?: boolean;
  defaultCategory?: string;
}

export function AddMaterialModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  defaultCategory,
}: AddMaterialModalProps) {
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(defaultCategory || "");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [color, setColor] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [unit, setUnit] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setName("");
    setCategory(defaultCategory || "");
    setSourceName("");
    setSourceUrl("");
    setBrand("");
    setProductName("");
    setColor("");
    setPricePerUnit("");
    setUnit("");
    setMaterialDescription("");
  };

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
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !user || !name || !category || !materialDescription) return;

    setIsUploading(true);

    try {
      // Upload image
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("material-library")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("material-library")
        .getPublicUrl(filePath);

      onSubmit({
        name,
        category,
        image_url: urlData.publicUrl,
        image_key: filePath,
        source_name: sourceName || undefined,
        source_url: sourceUrl || undefined,
        brand: brand || undefined,
        product_name: productName || undefined,
        color: color || undefined,
        price_per_unit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
        unit: unit || undefined,
        material_description: materialDescription,
      });

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting && !isUploading) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const isValid = imageFile && name && category && materialDescription;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add to Material Library</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>
              Upload Image <span className="text-destructive">*</span>
            </Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
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
                  id="material-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInput}
                />
                <label htmlFor="material-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drag & drop or click to browse</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</p>
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Material Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Oak Hardwood"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={sourceName} onValueChange={setSourceName}>
                <SelectTrigger>
                  <SelectValue placeholder="Where from?" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_SOURCES.map((source) => (
                    <SelectItem key={source.id} value={source.name}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Source URL</Label>
              <Input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Shaw Floors"
              />
            </div>

            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Repel Waterproof"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Natural Oak"
              />
            </div>

            <div className="space-y-2">
              <Label>Price per unit</Label>
              <Input
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                placeholder="3.99"
                type="number"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sq ft">sq ft</SelectItem>
                  <SelectItem value="linear ft">linear ft</SelectItem>
                  <SelectItem value="each">each</SelectItem>
                  <SelectItem value="gallon">gallon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              AI Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={materialDescription}
              onChange={(e) => setMaterialDescription(e.target.value)}
              placeholder="Describe this material for the AI: white hexagon marble mosaic tile with gray veining and white grout"
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              Describe the material in detail for best AI results
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting || isUploading}
            >
              {(isSubmitting || isUploading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Material
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
