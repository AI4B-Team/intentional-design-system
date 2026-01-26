import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-accent", sizeClasses[size], className)}
    />
  );
}

interface LoadingOverlayProps {
  className?: string;
  message?: string;
}

export function LoadingOverlay({
  className,
  message = "Loading...",
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50",
        className
      )}
    >
      <Spinner size="lg" />
      <p className="mt-3 text-small text-muted-foreground">{message}</p>
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 rounded-full bg-accent animate-bounce" />
    </div>
  );
}
