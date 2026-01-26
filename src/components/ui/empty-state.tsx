import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileX, Search, Inbox, AlertCircle } from "lucide-react";

type EmptyStateVariant = "default" | "search" | "error" | "inbox";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantIcons: Record<EmptyStateVariant, React.ReactNode> = {
  default: <FileX className="h-12 w-12" />,
  search: <Search className="h-12 w-12" />,
  error: <AlertCircle className="h-12 w-12" />,
  inbox: <Inbox className="h-12 w-12" />,
};

export function EmptyState({
  variant = "default",
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const IconComponent = icon || variantIcons[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-xl px-md text-center",
        className
      )}
    >
      <div className="mb-4 text-muted-foreground/50">{IconComponent}</div>
      <h3 className="text-h3 font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-body text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
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
      action={onClear ? { label: "Clear search", onClick: onClear } : undefined}
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
      description={`Get started by adding your first ${entityName.slice(0, -1)}.`}
      action={
        onAdd
          ? { label: addLabel || `Add ${entityName.slice(0, -1)}`, onClick: onAdd }
          : undefined
      }
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
      action={onRetry ? { label: "Try again", onClick: onRetry } : undefined}
    />
  );
}
