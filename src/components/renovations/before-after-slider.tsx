import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  initialPosition?: number;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  initialPosition = 50,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, updatePosition]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPosition((p) => Math.max(0, p - step));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition((p) => Math.min(100, p + step));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video overflow-hidden rounded-lg bg-muted select-none",
        isDragging && "cursor-ew-resize",
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* After image (full width, underneath) */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <span className="absolute bottom-4 right-4 text-xs font-medium px-2 py-1 rounded bg-background/80 backdrop-blur-sm text-foreground">
          {afterLabel}
        </span>
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-cover"
          style={{
            width: containerRef.current
              ? `${containerRef.current.offsetWidth}px`
              : "100vw",
            maxWidth: "none",
          }}
          draggable={false}
        />
        <span className="absolute bottom-4 left-4 text-xs font-medium px-2 py-1 rounded bg-background/80 backdrop-blur-sm text-foreground">
          {beforeLabel}
        </span>
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        {/* Vertical line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-background shadow-lg" />
        
        {/* Handle */}
        <button
          type="button"
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-10 h-10 rounded-full bg-background shadow-lg",
            "flex items-center justify-center",
            "border-2 border-primary",
            "transition-transform hover:scale-110",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isDragging && "scale-110"
          )}
          onKeyDown={handleKeyDown}
          aria-label="Drag to compare before and after images"
          tabIndex={0}
        >
          <GripVertical className="h-5 w-5 text-primary" />
        </button>
      </div>
    </div>
  );
}
