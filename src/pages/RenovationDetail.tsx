import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

  const handleDownloadAll = () => {
    toast.info("Download feature coming soon!");
    // TODO: Implement zip download
  };

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
                // TODO: Navigate to image detail/editor
                toast.info("Image editor coming soon!");
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
    </PageLayout>
  );
}
