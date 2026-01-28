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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AddPhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onUploadComplete: (
    images: Array<{
      original_image_url: string;
      original_image_key: string;
      room_type: string;
      area_label?: string;
    }>
  ) => void;
}

interface FileWithMeta {
  file: File;
  preview: string;
  roomType: string;
  areaLabel: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

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

export function AddPhotoModal({
  open,
  onOpenChange,
  projectId,
  onUploadComplete,
}: AddPhotoModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      );
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    const filesWithMeta: FileWithMeta[] = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      roomType: "Living Room",
      areaLabel: "",
      uploading: false,
      uploaded: false,
    }));

    setFiles((prev) => [...prev, ...filesWithMeta]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateFileMeta = (
    index: number,
    updates: Partial<Pick<FileWithMeta, "roomType" | "areaLabel">>
  ) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const handleUpload = async () => {
    if (!user) return;

    setIsUploading(true);
    const uploadedImages: Array<{
      original_image_url: string;
      original_image_key: string;
      room_type: string;
      area_label?: string;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, uploading: true } : f))
      );
      setUploadProgress(Math.round((i / files.length) * 100));

      try {
        const fileExt = file.file.name.split(".").pop();
        // Use user.id as first folder to match RLS policy, then projectId for organization
        const filePath = `${user?.id}/${projectId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("renovation-originals")
          .upload(filePath, file.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("renovation-originals")
          .getPublicUrl(filePath);

        uploadedImages.push({
          original_image_url: urlData.publicUrl,
          original_image_key: filePath,
          room_type: file.roomType,
          area_label: file.areaLabel || undefined,
        });

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, uploading: false, uploaded: true } : f
          )
        );
      } catch (error: any) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, uploading: false, error: error.message }
              : f
          )
        );
      }
    }

    setUploadProgress(100);
    setIsUploading(false);

    if (uploadedImages.length > 0) {
      onUploadComplete(uploadedImages);
      handleClose();
    }
  };

  const handleClose = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setStep(1);
    setUploadProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isUploading && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Upload Photos" : "Categorize Photos"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-4">
              {/* Drop Zone */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
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
                  id="file-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileInput}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="p-4 rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Drag and drop photos here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP (max 10MB each)
                  </p>
                </label>
              </div>

              {/* Preview Grid */}
              {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                    >
                      <img
                        src={file.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-3 rounded-lg bg-muted/50 border"
                >
                  <img
                    src={file.preview}
                    alt={`Photo ${index + 1}`}
                    className="w-20 h-20 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Room Type</Label>
                      <Select
                        value={file.roomType}
                        onValueChange={(val) =>
                          updateFileMeta(index, { roomType: val })
                        }
                        disabled={file.uploading || file.uploaded}
                      >
                        <SelectTrigger className="h-9">
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
                    <div className="space-y-1.5">
                      <Label className="text-xs">Custom Label (optional)</Label>
                      <Input
                        value={file.areaLabel}
                        onChange={(e) =>
                          updateFileMeta(index, { areaLabel: e.target.value })
                        }
                        placeholder="Master Bedroom or Backyard Patio"
                        className="h-9"
                        disabled={file.uploading || file.uploaded}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center">
                    {file.uploading && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    {file.uploaded && (
                      <Check className="h-5 w-5 text-emerald-500" />
                    )}
                    {file.error && (
                      <span className="text-xs text-destructive">
                        {file.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Uploading photos...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={files.length === 0}
              >
                Continue ({files.length} photo{files.length !== 1 ? "s" : ""})
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isUploading}
              >
                Back
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || files.length === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {files.length} Photo{files.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
