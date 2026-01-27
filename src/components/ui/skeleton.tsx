import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animate = true,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted",
        animate && "shimmer",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded h-4",
        variant === "rectangular" && "rounded-medium",
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
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
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton height={14} className="w-24" />
          <Skeleton height={28} className="w-32" />
        </div>
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <Skeleton height={48} className="w-full" />
    </div>
  );
}

function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-medium border border-border-subtle overflow-hidden bg-white">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-border-subtle bg-surface-secondary">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={14} className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex gap-4 px-4 py-3 border-b border-border-subtle last:border-0"
        >
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} height={14} className="flex-1" />
          ))}
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

function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
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

function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border-subtle last:border-0">
      <SkeletonAvatar />
      <div className="flex-1 space-y-2">
        <Skeleton height={14} className="w-3/4" />
        <Skeleton height={12} className="w-1/2" />
      </div>
      <Skeleton height={32} width={80} />
    </div>
  );
}

function SkeletonPropertyCard() {
  return (
    <div className="rounded-medium border border-border-subtle overflow-hidden bg-white">
      <Skeleton height={192} className="w-full rounded-none" />
      <div className="p-md space-y-3">
        <Skeleton height={20} className="w-3/4" />
        <Skeleton height={16} className="w-1/2" />
        <div className="flex gap-2">
          <Skeleton height={24} width={64} />
          <Skeleton height={24} width={64} />
          <Skeleton height={24} width={64} />
        </div>
        <div className="flex justify-between pt-2">
          <Skeleton height={24} width={96} />
          <Skeleton height={36} width={80} />
        </div>
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="rounded-medium border border-border-subtle p-md bg-white">
      <Skeleton height={20} className="w-40 mb-4" />
      <Skeleton height={256} className="w-full" />
    </div>
  );
}

function SkeletonForm() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height={14} className="w-24" />
          <Skeleton height={44} className="w-full" />
        </div>
      ))}
      <Skeleton height={44} className="w-32" />
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonStat,
  SkeletonStats,
  SkeletonAvatar,
  SkeletonText,
  SkeletonListItem,
  SkeletonPropertyCard,
  SkeletonChart,
  SkeletonForm,
};
