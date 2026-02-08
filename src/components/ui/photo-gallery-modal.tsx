import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoGalleryModalProps {
  photos: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialIndex?: number;
  title?: string;
}

export function PhotoGalleryModal({
  photos,
  open,
  onOpenChange,
  initialIndex = 0,
  title,
}: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  // Reset to initial index when opening
  React.useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, photos.length, onOpenChange]);

  if (photos.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title if provided */}
        {title && (
          <div className="absolute top-4 left-4 z-50 px-4 py-2 rounded-lg bg-black/60 text-white text-sm font-medium max-w-[70%] truncate">
            {title}
          </div>
        )}

        {/* Main image container */}
        <div className="relative flex items-center justify-center min-h-[80vh]">
          <img
            src={photos[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain"
          />

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Photo counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto px-4 py-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  "flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                  index === currentIndex 
                    ? "border-white opacity-100" 
                    : "border-transparent opacity-50 hover:opacity-75"
                )}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
