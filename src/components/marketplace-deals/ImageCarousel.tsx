import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  children?: React.ReactNode;
}

export function ImageCarousel({ images, alt, className, children }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const hasMultipleImages = images.length > 1;
  
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={images[currentIndex]}
        alt={alt}
        className="w-full h-full object-cover"
      />
      
      {/* Navigation Arrows - Only show on hover when multiple images */}
      {hasMultipleImages && isHovered && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all"
          >
            <ChevronRight className="h-4 w-4 text-slate-700" />
          </button>
        </>
      )}
      
      {/* Image Indicators - Only show when multiple images */}
      {hasMultipleImages && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.slice(0, 5).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === currentIndex % 5 ? "w-3 bg-white" : "w-1.5 bg-white/60"
              )}
            />
          ))}
          {images.length > 5 && (
            <div className="text-[8px] text-white/80 ml-1">+{images.length - 5}</div>
          )}
        </div>
      )}
      
      {/* Children overlay (badges, buttons, etc.) */}
      {children}
    </div>
  );
}
