import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FolderOpen, ImageIcon, CalendarDays } from "lucide-react";
import {
  CreditsBadge,
  NewProjectModal,
  ProjectCard,
  EmptyState,
} from "@/components/renovations";
import { useRenovationProjects } from "@/hooks/useRenovationProjects";

export default function Renovations() {
  const navigate = useNavigate();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const { projects, stats, isLoading, createProject } = useRenovationProjects();

  const handleCreateProject = async (data: {
    name: string;
    property_id: string | null;
    description: string | null;
  }) => {
    const result = await createProject.mutateAsync(data);
    if (result?.id) {
      navigate(`/renovations/${result.id}`);
    }
    setShowNewProjectModal(false);
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Virtual Renovation Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            Transform properties with AI-powered staging and renovation
            visualization
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CreditsBadge />
          <Button
            onClick={() => setShowNewProjectModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {!isLoading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalProjects || 0}</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <ImageIcon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalImages || 0}</p>
                <p className="text-sm text-muted-foreground">Images Generated</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 rounded-lg bg-secondary">
                <CalendarDays className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.thisMonth || 0}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[16/10]" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onCreateProject={() => setShowNewProjectModal(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        open={showNewProjectModal}
        onOpenChange={setShowNewProjectModal}
        onSubmit={handleCreateProject}
        isSubmitting={createProject.isPending}
      />
    </PageLayout>
  );
}
