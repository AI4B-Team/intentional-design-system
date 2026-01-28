import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Utensils,
  PaintBucket,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";

// Demo images - we'll use placeholders that work
import livingRoomBefore from "@/assets/demo-living-before.jpg";
import livingRoomAfter from "@/assets/demo-living-after.jpg";
import kitchenBefore from "@/assets/demo-kitchen-before.jpg";
import kitchenAfter from "@/assets/demo-kitchen-after.jpg";
import exteriorBefore from "@/assets/demo-exterior-before.jpg";
import exteriorAfter from "@/assets/demo-exterior-after.jpg";
import materialBefore from "@/assets/demo-material-before.jpg";
import materialAfter from "@/assets/demo-material-after.jpg";

const demos = [
  {
    id: "living-room",
    label: "Living Room",
    icon: Home,
    before: livingRoomBefore,
    after: livingRoomAfter,
    description: "Empty to elegantly staged",
  },
  {
    id: "kitchen",
    label: "Kitchen",
    icon: Utensils,
    before: kitchenBefore,
    after: kitchenAfter,
    description: "Outdated to modern design",
  },
  {
    id: "exterior",
    label: "Exterior",
    icon: Building2,
    before: exteriorBefore,
    after: exteriorAfter,
    description: "Curb appeal transformation",
  },
  {
    id: "materials",
    label: "Material Swap",
    icon: PaintBucket,
    before: materialBefore,
    after: materialAfter,
    description: "New finishes visualization",
  },
];

const features = [
  "Stage empty rooms in seconds",
  "Swap flooring, countertops, backsplash",
  "Visualize exterior renovations",
  "Show sellers the potential",
  "Create stunning marketing photos",
];

interface DemoSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  animateOnLoad?: boolean;
}

function DemoSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  animateOnLoad = true,
}: DemoSliderProps) {
  const [position, setPosition] = useState(animateOnLoad ? 85 : 50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate on load with easing
  useEffect(() => {
    if (animateOnLoad && !hasAnimated) {
      const timer = setTimeout(() => {
        setPosition(50);
        setHasAnimated(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [animateOnLoad, hasAnimated]);

  // Hide pulse after first interaction
  useEffect(() => {
    if (isDragging) {
      setShowPulse(false);
    }
  }, [isDragging]);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 2), 98);
    setPosition(percentage);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

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
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
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
      setPosition((p) => Math.max(2, p - step));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition((p) => Math.min(98, p + step));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-muted select-none shadow-2xl",
        isDragging ? "cursor-ew-resize" : "cursor-pointer"
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
        {/* After label */}
        <span
          className={cn(
            "absolute bottom-4 right-4 text-sm font-semibold px-3 py-1.5 rounded-full bg-success/90 text-success-foreground shadow-lg transition-opacity duration-300",
            position > 75 && "opacity-0"
          )}
        >
          {afterLabel}
        </span>
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          width: `${position}%`,
          transition: isDragging ? "none" : "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="h-full object-cover"
          style={{
            width: containerRef.current
              ? `${containerRef.current.offsetWidth}px`
              : "100vw",
            maxWidth: "none",
          }}
          draggable={false}
        />
        {/* Before label */}
        <span
          className={cn(
            "absolute bottom-4 left-4 text-sm font-semibold px-3 py-1.5 rounded-full bg-background/90 text-foreground shadow-lg transition-opacity duration-300",
            position < 25 && "opacity-0"
          )}
        >
          {beforeLabel}
        </span>
      </div>

      {/* Slider line and handle */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
          transition: isDragging ? "none" : "left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Vertical line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.3)]" />

        {/* Handle */}
        <button
          type="button"
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-12 h-12 rounded-full bg-white shadow-xl",
            "flex items-center justify-center gap-0.5",
            "border-2 border-accent",
            "transition-all duration-200",
            "hover:scale-110 hover:shadow-2xl",
            "focus:outline-none focus:ring-4 focus:ring-accent/30",
            isDragging && "scale-110 shadow-2xl",
            showPulse && "animate-pulse"
          )}
          onKeyDown={handleKeyDown}
          aria-label="Drag to compare before and after images"
          tabIndex={0}
        >
          <ChevronLeft className="h-4 w-4 text-accent -mr-1" />
          <ChevronRight className="h-4 w-4 text-accent -ml-1" />
        </button>
      </div>

      {/* Drag hint overlay on first load */}
      {showPulse && !isDragging && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 text-white text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm animate-fade-in">
            ← Drag to compare →
          </div>
        </div>
      )}
    </div>
  );
}

export function RenovationDemo() {
  const [activeDemo, setActiveDemo] = useState(demos[0]);
  const [sliderKey, setSliderKey] = useState(0);

  const handleDemoChange = (demo: typeof demos[0]) => {
    setActiveDemo(demo);
    setSliderKey((k) => k + 1); // Force re-mount for animation
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-background-secondary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="order-2 lg:order-1 animate-fade-in">
            <Badge
              variant="secondary"
              className="mb-4 px-3 py-1.5 text-sm font-medium bg-accent/10 text-accent border-0"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI-Powered
            </Badge>

            <h2 className="text-display text-foreground mb-4">
              See What's Possible
            </h2>

            <p className="text-body text-muted-foreground mb-8 max-w-lg">
              Transform any property with AI-powered virtual staging and
              renovation visualization. Drag the slider to see the magic.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-success" />
                  </div>
                  <span className="text-body text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="font-semibold">
                <Link to="/renovations">Try It Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/settings/billing">See Pricing</Link>
              </Button>
            </div>
          </div>

          {/* Right: Interactive Demo */}
          <div className="order-1 lg:order-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
            {/* Demo slider */}
            <DemoSlider
              key={sliderKey}
              beforeImage={activeDemo.before}
              afterImage={activeDemo.after}
              animateOnLoad={true}
            />

            {/* Demo selector tabs */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {demos.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.id}
                    onClick={() => handleDemoChange(demo)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      activeDemo.id === demo.id
                        ? "bg-accent text-accent-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{demo.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Description */}
            <p className="text-center text-sm text-muted-foreground mt-3">
              {activeDemo.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
