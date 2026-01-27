import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-brand-accent", sizeClasses[size], className)}
    />
  );
}

interface LoadingOverlayProps {
  className?: string;
  message?: string;
}

export function LoadingOverlay({
  className,
  message,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50 rounded-medium",
        className
      )}
    >
      <Spinner size="lg" />
      {message && (
        <p className="mt-3 text-small text-content-secondary">{message}</p>
      )}
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="h-2 w-2 rounded-full bg-brand-accent animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 rounded-full bg-brand-accent animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 rounded-full bg-brand-accent animate-bounce" />
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <Spinner size="xl" />
      <p className="text-body text-content-secondary mt-4">{message}</p>
    </div>
  );
}

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export function LoadingButtonContent({ loading, children }: LoadingButtonProps) {
  return (
    <>
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </>
  );
}
