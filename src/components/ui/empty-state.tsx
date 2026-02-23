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
}

const variantConfig: Record<EmptyStateVariant, { icon: LucideIcon; color: string }> = {
  default: { icon: FileX, color: "text-content-tertiary" },
  search: { icon: Search, color: "text-content-tertiary" },
  error: { icon: AlertCircle, color: "text-destructive" },
  inbox: { icon: Inbox, color: "text-content-tertiary" },
  properties: { icon: Building2, color: "text-brand-accent" },
  contacts: { icon: Users, color: "text-brand-accent" },
  documents: { icon: FileText, color: "text-brand-accent" },
};

export function EmptyState({
  variant = "default",
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const ActionIcon = action?.icon || Plus;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div
          className={cn(
            "h-20 w-20 rounded-full flex items-center justify-center",
            variant === "error" ? "bg-destructive/10" : "bg-surface-tertiary"
          )}
        >
          {icon || <Icon className={cn("h-10 w-10", config.color)} />}
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 rounded-full border border-border-subtle scale-125 opacity-50" />
          <div className="absolute inset-0 rounded-full border border-border-subtle scale-150 opacity-25" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-h3 font-semibold text-content mb-2">{title}</h3>

      {/* Description */}
      <p className="text-body text-content-secondary max-w-sm mb-6">{description}</p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <Button
              variant="primary"
              onClick={action.onClick}
              icon={<ActionIcon className="h-4 w-4" />}
            >
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
      title={`No ${entityName} Yet`}
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
      title="No Properties Yet"
      description="Start building your pipeline by adding your first property."
      action={onAdd ? { label: "Add Property", onClick: onAdd, icon: Plus } : undefined}
    />
  );
}

export function EmptyContactsState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      variant="contacts"
      title="No Contacts Yet"
      description="Add your first contact to start building relationships."
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
