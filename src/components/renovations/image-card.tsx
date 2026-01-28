import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Download, Trash2, Edit, ImageIcon } from "lucide-react";
import { RenovationImage } from "@/hooks/useRenovationProjects";

interface ImageCardProps {
  image: RenovationImage;
  onClick: () => void;
  onDelete: () => void;
  onRename?: () => void;
  onDownload?: () => void;
}

export function ImageCard({
  image,
  onClick,
  onDelete,
  onRename,
  onDownload,
}: ImageCardProps) {
  const generatedCount = image.generated_images?.length || 0;
  const afterImage = image.selected_after_url || image.generated_images?.[0]?.url;
  const label = image.area_label || image.room_type || "Untitled";

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Default download behavior
    const link = document.createElement("a");
    link.href = image.original_image_url;
    link.download = `${label}-original.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      className="group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
      onClick={onClick}
    >
      {/* Side-by-side thumbnails */}
      <div className="flex aspect-[2/1]">
        {/* Before */}
        <div className="relative flex-1 bg-muted overflow-hidden">
          <img
            src={image.original_image_url}
            alt="Before"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/60 text-white">
            Before
          </span>
        </div>

        {/* After */}
        <div className="relative flex-1 bg-muted overflow-hidden border-l border-border">
          {afterImage ? (
            <img
              src={afterImage}
              alt="After"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          <span className="absolute bottom-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/60 text-white">
            After
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{label}</p>
          <p className="text-sm text-muted-foreground">
            {generatedCount} variation{generatedCount !== 1 ? "s" : ""}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRename && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRename();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
