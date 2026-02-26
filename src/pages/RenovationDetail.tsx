import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ArrowLeft,
  Plus,
  Download,
  MoreVertical,
  Trash2,
  ExternalLink,
  Upload,
  ImageIcon,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { CreditsBadge, AddPhotoModal, ImageCard } from "@/components/renovations";
import {
  useRenovationProject,
  useRenovationProjects,
  RenovationProject,
} from "@/hooks/useRenovationProjects";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCredits } from "@/hooks/useCredits";

const statusColors = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  archived: "bg-muted text-muted-foreground border-muted",
};

export default function RenovationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, images, isLoading, addImages, deleteImage } =
    useRenovationProject(id);
  const { updateProject, deleteProject } = useRenovationProjects();
  const { balance } = useCredits();

  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleNameEdit = () => {
    if (project) {
      setNewName(project.name);
      setEditingName(true);
    }
  };

  const handleNameSave = async () => {
    if (!project || !newName.trim()) return;
    await updateProject.mutateAsync({ id: project.id, name: newName.trim() });
    setEditingName(false);
  };

  const handleStatusChange = async (status: RenovationProject["status"]) => {
    if (!project) return;
    await updateProject.mutateAsync({ id: project.id, status });
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    await deleteProject.mutateAsync(project.id);
    navigate("/renovations");
  };

  const handleUploadComplete = async (
    uploadedImages: Array<{
      original_image_url: string;
      original_image_key: string;
      room_type: string;
      area_label?: string;
    }>
  ) => {
    await addImages.mutateAsync(uploadedImages);
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;
    await deleteImage.mutateAsync(imageToDelete);
    setImageToDelete(null);
  };

  const handleDownloadAll = useCallback(async () => {
    if (!project || !reportRef.current) return;

    const toastId = toast.loading("Generating report...");

    // Make the hidden div temporarily visible for html2canvas
    const el = reportRef.current;
    el.style.display = "block";

    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      el.style.display = "none";

      canvas.toBlob((blob) => {
        toast.dismiss(toastId);
        if (!blob) {
          toast.error("Failed to generate report");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const addr = (project.property?.address || project.name || "project").replace(/[^a-zA-Z0-9]/g, "-");
        const date = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `renovation-report-${addr}-${date}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Report downloaded");
      }, "image/png");
    } catch (err) {
      el.style.display = "none";
      toast.dismiss(toastId);
      console.error("Report generation error:", err);

      // Fallback: open print window
      const printWin = window.open("", "_blank");
      if (printWin) {
        printWin.document.write(`
          <html><head><title>Renovation Report</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            h2 { font-size: 16px; margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            .meta { color: #666; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
            th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eee; }
            th { font-weight: 600; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
            .active { background: #d1fae5; color: #065f46; }
            .completed { background: #dbeafe; color: #1e40af; }
            .archived { background: #f3f4f6; color: #6b7280; }
            @media print { body { padding: 20px; } }
          </style></head><body>
          <h1>${project.name}</h1>
          <p class="meta">${project.property?.address || "No address"}</p>
          <p><span class="badge ${project.status}">${project.status}</span></p>
          <h2>Images (${images.length})</h2>
          <table>
            <tr><th>Room</th><th>Label</th><th>Variations</th></tr>
            ${images.map(img => `<tr><td>${img.room_type || "—"}</td><td>${img.area_label || "—"}</td><td>${(img.generated_images || []).length}</td></tr>`).join("")}
          </table>
          <h2>Project Details</h2>
          <p class="meta">Created: ${new Date(project.created_at).toLocaleDateString()}</p>
          <p class="meta">Total Images: ${images.length}</p>
          <p class="meta">Generated on ${new Date().toLocaleString()}</p>
          </body></html>
        `);
        printWin.document.close();
        printWin.print();
      }
      toast.info("Opened print dialog as fallback");
    }
  }, [project, images]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/1]" />
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!project) {
    return (
      <PageLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">
            This project may have been deleted or you don't have access.
          </p>
          <Button asChild>
            <Link to="/renovations">Back to Projects</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const status = project.status as keyof typeof statusColors;
  const isLowCredits = balance < 1;
  const noCredits = balance === 0;

  return (
    <PageLayout>
      {/* Low/No Credits Warning */}
      {noCredits && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-between">
          <p className="text-destructive font-medium">
            No credits remaining. Add more to continue generating.
          </p>
          <Button variant="default" size="sm" asChild>
            <Link to="/settings/credits">Add Credits</Link>
          </Button>
        </div>
      )}

      {isLowCredits && !noCredits && (
        <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <p className="text-amber-600 dark:text-amber-400 font-medium">
            Low credits! Add more to continue generating.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings/credits">Add Credits</Link>
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="space-y-2">
          <Link
            to="/renovations"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Projects
          </Link>

          <div className="flex items-center gap-3">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 text-2xl font-bold w-64"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSave();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                />
                <Button size="icon" variant="ghost" onClick={handleNameSave}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingName(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors inline-flex items-center gap-2 group"
                onClick={handleNameEdit}
              >
                {project.name}
                <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h1>
            )}

            {project.property?.address && (
              <Link
                to={`/properties/${(project as any).property?.id}`}
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View Property
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadAll}>
                <Download className="mr-2 h-4 w-4" />
                Download All
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddPhotoModal(true)}
            className="gap-2"
            disabled={noCredits}
          >
            <Plus className="h-4 w-4" />
            Add Photo
          </Button>

          {images.length > 0 && (
            <Button variant="outline" onClick={handleDownloadAll} className="gap-2">
              <Download className="h-4 w-4" />
              Download All
            </Button>
          )}
        </div>

        <CreditsBadge showWarning={false} />
      </div>

      {/* Images */}
      {images.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              Upload your first photo
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Drag and drop photos here, or click the button below to get
              started
            </p>
            <Button onClick={() => setShowAddPhotoModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onClick={() => {
                navigate(`/renovations/${project.id}/images/${image.id}`);
              }}
              onDelete={() => setImageToDelete(image.id)}
            />
          ))}
        </div>
      )}

      {/* Add Photo Modal */}
      <AddPhotoModal
        open={showAddPhotoModal}
        onOpenChange={setShowAddPhotoModal}
        projectId={project.id}
        onUploadComplete={handleUploadComplete}
      />

      {/* Delete Project Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This will
              permanently delete all images and generated content. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Image Dialog */}
      <AlertDialog
        open={!!imageToDelete}
        onOpenChange={(open) => !open && setImageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image and all its generated
              variations? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteImage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden Report Div for html2canvas */}
      <div
        ref={reportRef}
        style={{ display: "none", position: "absolute", left: "-9999px", top: 0, width: "800px", background: "#fff", padding: "40px", fontFamily: "sans-serif", color: "#111" }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>
          Renovation Summary Report
        </h1>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "2px" }}>
          {project?.property?.address || project?.name || "Project"}
        </p>
        <p style={{ color: "#999", fontSize: "12px", marginBottom: "20px" }}>
          Generated {new Date().toLocaleString()}
        </p>

        <div style={{ display: "flex", gap: "24px", marginBottom: "20px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "#999", textTransform: "uppercase" as const }}>Status</span>
            <p style={{ fontWeight: 600, textTransform: "capitalize" as const }}>{project?.status}</p>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#999", textTransform: "uppercase" as const }}>Created</span>
            <p style={{ fontWeight: 600 }}>{project ? new Date(project.created_at).toLocaleDateString() : ""}</p>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#999", textTransform: "uppercase" as const }}>Total Images</span>
            <p style={{ fontWeight: 600 }}>{images.length}</p>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#999", textTransform: "uppercase" as const }}>Variations</span>
            <p style={{ fontWeight: 600 }}>{images.reduce((s, img) => s + (img.generated_images || []).length, 0)}</p>
          </div>
        </div>

        {/* Progress bar */}
        {(() => {
          const totalVariations = images.reduce((s, img) => s + (img.generated_images || []).length, 0);
          const pct = images.length > 0 ? Math.round((images.filter(i => (i.generated_images || []).length > 0).length / images.length) * 100) : 0;
          return (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span>{pct}% of images staged</span>
                <span>{images.filter(i => (i.generated_images || []).length > 0).length}/{images.length}</span>
              </div>
              <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "#22c55e", borderRadius: "4px" }} />
              </div>
            </div>
          );
        })()}

        <h2 style={{ fontSize: "15px", fontWeight: 600, borderBottom: "1px solid #e5e7eb", paddingBottom: "4px", marginBottom: "8px" }}>
          Room-By-Room Breakdown
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: "13px", marginBottom: "24px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ textAlign: "left" as const, padding: "6px 8px" }}>Room / Area</th>
              <th style={{ textAlign: "left" as const, padding: "6px 8px" }}>Type</th>
              <th style={{ textAlign: "left" as const, padding: "6px 8px" }}>Variations</th>
              <th style={{ textAlign: "left" as const, padding: "6px 8px" }}>Styles</th>
            </tr>
          </thead>
          <tbody>
            {images.map((img) => (
              <tr key={img.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "6px 8px", fontWeight: 500 }}>{img.area_label || "—"}</td>
                <td style={{ padding: "6px 8px" }}>{img.room_type || "—"}</td>
                <td style={{ padding: "6px 8px" }}>{(img.generated_images || []).length}</td>
                <td style={{ padding: "6px 8px", color: "#666" }}>
                  {(img.generated_images || []).map(g => g.style).filter(Boolean).join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ fontSize: "11px", color: "#aaa", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
          This report was auto-generated. All images and data are subject to the project's current state.
        </p>
      </div>

    </PageLayout>
  );
}
