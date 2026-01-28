import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, MapPin, Calendar, ArrowRight } from "lucide-react";
import { RenovationProject } from "@/hooks/useRenovationProjects";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: RenovationProject;
}

const statusColors = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  archived: "bg-muted text-muted-foreground border-muted",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const status = project.status as keyof typeof statusColors;

  return (
    <Link to={`/renovations/${project.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
        {/* Cover Image */}
        <div className="relative aspect-[16/10] bg-muted overflow-hidden">
          {project.cover_image_url ? (
            <img
              src={project.cover_image_url}
              alt={project.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}

          {/* Status Badge */}
          <Badge
            variant="outline"
            className={cn(
              "absolute top-3 right-3 capitalize",
              statusColors[status]
            )}
          >
            {status}
          </Badge>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" size="sm" className="gap-2">
              Open <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {project.name}
            </h3>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">
                {project.property?.address || "Unlinked"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>{project.total_images || 0} images</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(project.updated_at), "MMM d, yyyy")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
