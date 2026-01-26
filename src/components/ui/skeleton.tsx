import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "shimmer",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded h-4",
        variant === "rectangular" && "rounded-medium",
        className
      )}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  );
}

// Pre-built skeleton patterns
function SkeletonCard() {
  return (
    <div className="rounded-medium border border-border-subtle p-md space-y-4 bg-white">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="space-y-2 flex-1">
          <Skeleton height={16} className="w-3/4" />
          <Skeleton height={12} className="w-1/2" />
        </div>
      </div>
      <Skeleton height={80} className="w-full" />
      <div className="flex justify-between">
        <Skeleton height={32} width={96} />
        <Skeleton height={32} width={96} />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-border">
        <Skeleton height={16} className="w-32" />
        <Skeleton height={16} className="w-24" />
        <Skeleton height={16} className="w-40 flex-1" />
        <Skeleton height={16} className="w-20" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton height={16} className="w-32" />
          <Skeleton height={16} className="w-24" />
          <Skeleton height={16} className="w-40 flex-1" />
          <Skeleton height={16} className="w-20" />
        </div>
      ))}
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="rounded-medium border border-border-subtle p-md space-y-2 bg-white">
      <Skeleton height={12} className="w-20" />
      <Skeleton height={32} className="w-24" />
      <Skeleton height={12} className="w-16" />
    </div>
  );
}

function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />;
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonStat,
  SkeletonAvatar,
  SkeletonText,
};
