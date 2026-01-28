import { useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ArrowLeft, Plus, Star } from "lucide-react";
import {
  useMaterialLibrary,
  MATERIAL_CATEGORIES,
  MaterialItem,
} from "@/hooks/useMaterialLibrary";
import { MaterialCard } from "@/components/renovations/material-card";
import { AddMaterialModal } from "@/components/renovations/add-material-modal";

export default function MaterialLibrary() {
  const {
    materials,
    isLoading,
    createMaterial,
    deleteMaterial,
    toggleFavorite,
  } = useMaterialLibrary();

  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<MaterialItem | null>(
    null
  );

  const filteredMaterials = materials.filter((m) => {
    if (filter === "all") return true;
    if (filter === "favorites") return m.is_favorite;
    if (filter === "exterior") {
      return ["roofing", "siding", "windows", "landscaping"].includes(
        m.category
      );
    }
    return m.category === filter;
  });

  const handleDeleteConfirm = async () => {
    if (materialToDelete) {
      await deleteMaterial.mutateAsync(materialToDelete.id);
      setMaterialToDelete(null);
    }
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="space-y-1">
          <Link
            to="/renovations"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="text-2xl font-bold">Material Library</h1>
          <p className="text-muted-foreground">
            Save and organize materials for quick reuse in renovations
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all">All</TabsTrigger>
          {MATERIAL_CATEGORIES.slice(0, 5).map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </TabsTrigger>
          ))}
          <TabsTrigger value="exterior">🏠 Exterior</TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="h-3 w-3 mr-1" />
            Favorites
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-semibold mb-1">No materials yet</h3>
          <p className="text-muted-foreground mb-4">
            {filter === "favorites"
              ? "Star your favorite materials to see them here"
              : "Add materials to your library for quick reuse"}
          </p>
          {filter !== "favorites" && (
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onToggleFavorite={() =>
                toggleFavorite.mutate({
                  id: material.id,
                  isFavorite: !material.is_favorite,
                })
              }
              onDelete={() => setMaterialToDelete(material)}
            />
          ))}
        </div>
      )}

      {/* Add Material Modal */}
      <AddMaterialModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={(data) => createMaterial.mutateAsync(data)}
        isSubmitting={createMaterial.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!materialToDelete}
        onOpenChange={(open) => !open && setMaterialToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{materialToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
