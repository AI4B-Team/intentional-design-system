import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Building,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addDays } from "date-fns";
import { POFDocument } from "./types";

interface POFManagerProps {
  documents: POFDocument[];
  selectedPOFId: string | null;
  includePOF: boolean;
  isRequired: boolean;
  onTogglePOF: (include: boolean) => void;
  onSelectPOF: (id: string | null) => void;
  onUploadPOF: (file: File, metadata: Partial<POFDocument>) => Promise<void>;
  onDeletePOF: (id: string) => Promise<void>;
}

export function POFManager({
  documents,
  selectedPOFId,
  includePOF,
  isRequired,
  onTogglePOF,
  onSelectPOF,
  onUploadPOF,
  onDeletePOF,
}: POFManagerProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    amount: "",
    lenderName: "",
    expirationDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm((prev) => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      await onUploadPOF(uploadForm.file, {
        amount: Number(uploadForm.amount),
        lenderName: uploadForm.lenderName,
        expirationDate: uploadForm.expirationDate,
      });
      setUploadProgress(100);
      setIsUploadOpen(false);
      setUploadForm({
        file: null,
        amount: "",
        lenderName: "",
        expirationDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      });
    } finally {
      clearInterval(interval);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await onDeletePOF(deleteId);
    setDeleteId(null);
  };

  const getExpirationStatus = (expirationDate: string) => {
    const daysUntilExpiry = differenceInDays(
      new Date(expirationDate),
      new Date()
    );

    if (daysUntilExpiry < 0) {
      return { label: "Expired", variant: "error" as const, days: daysUntilExpiry };
    }
    if (daysUntilExpiry <= 5) {
      return { label: "Expiring Soon", variant: "warning" as const, days: daysUntilExpiry };
    }
    return { label: "Active", variant: "success" as const, days: daysUntilExpiry };
  };

  return (
    <div className="space-y-4">
      {/* Toggle Section */}
      <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-info" />
          <div>
            <Label className="text-foreground">Include Proof of Funds</Label>
            <p className="text-tiny text-muted-foreground">
              {isRequired
                ? "Required for on-market (MLS) offers"
                : "Optional for off-market offers"}
            </p>
          </div>
        </div>
        <Switch
          checked={includePOF}
          onCheckedChange={onTogglePOF}
          disabled={isRequired}
        />
      </div>

      {includePOF && (
        <>
          {/* Document List */}
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => {
                const status = getExpirationStatus(doc.expirationDate);
                const isSelected = selectedPOFId === doc.id;

                return (
                  <Card
                    key={doc.id}
                    variant="default"
                    padding="md"
                    className={cn(
                      "cursor-pointer transition-all hover:border-accent/50",
                      isSelected && "ring-2 ring-accent border-accent"
                    )}
                    onClick={() => onSelectPOF(isSelected ? null : doc.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            status.variant === "error" && "bg-destructive/10",
                            status.variant === "warning" && "bg-warning/10",
                            status.variant === "success" && "bg-success/10"
                          )}
                        >
                          <FileText
                            className={cn(
                              "h-5 w-5",
                              status.variant === "error" && "text-destructive",
                              status.variant === "warning" && "text-warning",
                              status.variant === "success" && "text-success"
                            )}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {doc.fileName}
                            </p>
                            <Badge variant={status.variant} size="sm">
                              {status.label}
                            </Badge>
                            {isSelected && (
                              <Badge variant="default" size="sm">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-tiny text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {doc.lenderName}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />$
                              {doc.amount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {status.days > 0
                                ? `Expires in ${status.days} days`
                                : `Expired ${Math.abs(status.days)} days ago`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(doc.fileUrl, "_blank");
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(doc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {status.variant === "warning" && (
                      <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded-md flex items-center gap-2 text-warning text-small">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          This POF expires in {status.days} day
                          {status.days !== 1 ? "s" : ""}. Please upload a new
                          one.
                        </span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card variant="default" padding="lg" className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h4 className="font-semibold text-foreground mb-1">
                No Proof of Funds Uploaded
              </h4>
              <p className="text-small text-muted-foreground mb-4">
                Upload your POF letter to include with offers
              </p>
            </Card>
          )}

          <Button
            variant="secondary"
            icon={<Plus />}
            onClick={() => setIsUploadOpen(true)}
            className="w-full"
          >
            Upload New POF
          </Button>
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Proof of Funds</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>POF Document</Label>
              <div className="mt-2">
                {uploadForm.file ? (
                  <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-info" />
                      <span className="text-small">{uploadForm.file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setUploadForm((prev) => ({ ...prev, file: null }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-small text-muted-foreground">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-tiny text-muted-foreground mt-1">
                      PDF, JPG, or PNG (max 10MB)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Funding Amount</Label>
                <Input
                  type="number"
                  value={uploadForm.amount}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="$500,000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Lender / Bank Name</Label>
                <Input
                  value={uploadForm.lenderName}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      lenderName: e.target.value,
                    }))
                  }
                  placeholder="XYZ Capital"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={uploadForm.expirationDate}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    expirationDate: e.target.value,
                  }))
                }
                className="mt-2"
              />
              <p className="text-tiny text-muted-foreground mt-1">
                You'll be notified 5 days before expiration
              </p>
            </div>

            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-tiny text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!uploadForm.file || uploading}
            >
              {uploading ? "Uploading..." : "Upload POF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proof of Funds?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The POF document will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
