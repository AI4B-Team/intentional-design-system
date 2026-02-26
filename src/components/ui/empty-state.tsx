import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileX,
  Search,
  Inbox,
  AlertCircle,
  Building2,
  Users,
  FileText,
  Plus,
  RefreshCw,
  LucideIcon,
  Kanban,
  Phone,
} from "lucide-react";

type EmptyStateVariant =
  | "default"
  | "search"
  | "error"
  | "inbox"
  | "properties"
  | "contacts"
  | "documents";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

const variantConfig: Record<EmptyStateVariant, { icon: LucideIcon; color: string }> = {
  default: { icon: FileX, color: "text-muted-foreground" },
  search: { icon: Search, color: "text-muted-foreground" },
  error: { icon: AlertCircle, color: "text-destructive" },
  inbox: { icon: Inbox, color: "text-muted-foreground" },
  properties: { icon: Building2, color: "text-primary" },
  contacts: { icon: Users, color: "text-primary" },
  documents: { icon: FileText, color: "text-primary" },
};

const sizeConfig = {
  sm: {
    container: "py-8 px-4",
    iconOuter: "h-14 w-14",
    iconInner: "h-6 w-6",
    title: "text-sm font-semibold",
    description: "text-xs max-w-xs",
    gap: "mb-3",
  },
  md: {
    container: "py-16 px-6",
    iconOuter: "h-20 w-20",
    iconInner: "h-9 w-9",
    title: "text-h3 font-semibold",
    description: "text-body max-w-sm",
    gap: "mb-4",
  },
  lg: {
    container: "py-24 px-8",
    iconOuter: "h-28 w-28",
    iconInner: "h-12 w-12",
    title: "text-h2 font-semibold",
    description: "text-body max-w-md",
    gap: "mb-6",
  },
};

export function EmptyState({
  variant = "default",
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const ActionIcon = action?.icon || Plus;
  const s = sizeConfig[size];

  const isError = variant === "error";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        s.container,
        className
      )}
    >
      {/* Icon container with gradient background */}
      <div className={cn("relative", s.gap)}>
        <div
          className={cn(
            "rounded-2xl flex items-center justify-center",
            s.iconOuter,
            isError
              ? "bg-destructive/10"
              : "bg-gradient-to-b from-muted/80 to-muted/40 border border-border/50"
          )}
        >
          {icon || <Icon className={cn(s.iconInner, config.color, "opacity-70")} />}
        </div>

        {/* Subtle glow behind icon */}
        {!isError && (
          <div
            className="absolute inset-0 -z-10 rounded-2xl opacity-40 blur-xl"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)",
            }}
          />
        )}
      </div>

      {/* Title */}
      <h3 className={cn(s.title, "text-foreground", s.gap)}>{title}</h3>

      {/* Description */}
      <p className={cn(s.description, "text-muted-foreground mb-6 leading-relaxed")}>
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <Button
              variant="default"
              onClick={action.onClick}
              className="gap-2"
            >
              <ActionIcon className="h-4 w-4" />
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized empty states
export function NoResultsState({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try adjusting your search.`
          : "No results match your current filters."
      }
      action={
        onClear
          ? { label: "Clear search", onClick: onClear, icon: RefreshCw }
          : undefined
      }
    />
  );
}

export function NoDataState({
  entityName = "items",
  onAdd,
  addLabel,
}: {
  entityName?: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <EmptyState
      variant="inbox"
      title={`No ${entityName} yet`}
      description={`Get started by adding your first ${entityName.replace(/s$/, "")}.`}
      action={
        onAdd
          ? {
              label: addLabel || `Add ${entityName.replace(/s$/, "")}`,
              onClick: onAdd,
              icon: Plus,
            }
          : undefined
      }
    />
  );
}

export function EmptyPropertiesState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      variant="properties"
      title="No properties yet"
      description="Start building your portfolio by adding your first property or importing a list."
      action={onAdd ? { label: "Add Property", onClick: onAdd, icon: Plus } : undefined}
    />
  );
}

export function EmptyContactsState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      variant="contacts"
      title="No contacts yet"
      description="Import a list or add contacts manually to start building your database."
      action={onAdd ? { label: "Add Contact", onClick: onAdd, icon: Plus } : undefined}
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description || "We encountered an error. Please try again."}
      action={onRetry ? { label: "Try again", onClick: onRetry, icon: RefreshCw } : undefined}
    />
  );
}
