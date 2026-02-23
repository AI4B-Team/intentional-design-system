import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  ArrowDown,
  Send,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Signer, SigningWorkflow, signerStatusConfig } from "@/types/signing-workflow";
import { format } from "date-fns";

interface WorkflowVisualizerProps {
  workflow: SigningWorkflow;
  compact?: boolean;
}

const roleIcons: Record<string, React.ElementType> = {
  signer: Send,
  approver: ShieldCheck,
  cc: Eye,
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  sent: Send,
  viewed: Eye,
  signed: CheckCircle,
  declined: XCircle,
};

export function WorkflowVisualizer({ workflow, compact = false }: WorkflowVisualizerProps) {
  const isSequential = workflow.signingOrder === "sequential";

  // Group signers by order for sequential display
  const groups: Signer[][] = [];
  if (isSequential) {
    const orderMap = new Map<number, Signer[]>();
    workflow.signers.forEach((s) => {
      const existing = orderMap.get(s.order) || [];
      existing.push(s);
      orderMap.set(s.order, existing);
    });
    Array.from(orderMap.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([, signers]) => groups.push(signers));
  } else {
    groups.push([...workflow.signers]);
  }

  // Find current active step in sequential
  const activeStepIndex = isSequential
    ? groups.findIndex((group) => group.some((s) => s.status !== "signed" && s.status !== "declined"))
    : -1;

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="text-xs capitalize gap-1">
          {isSequential ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <UserCheck className="h-3 w-3" />
          )}
          {workflow.signingOrder} signing
        </Badge>
        <span className="text-xs text-muted-foreground">
          {workflow.signers.filter((s) => s.status === "signed").length}/{workflow.signers.length} completed
        </span>
      </div>

      {/* Flow visualization */}
      <div className="space-y-0">
        {groups.map((group, groupIndex) => {
          const isActive = groupIndex === activeStepIndex;
          const isCompleted = group.every((s) => s.status === "signed");
          const isPending = isSequential && groupIndex > activeStepIndex && activeStepIndex >= 0;

          return (
            <React.Fragment key={groupIndex}>
              {/* Connector arrow for sequential */}
              {isSequential && groupIndex > 0 && (
                <div className="flex justify-center py-1">
                  <div className={cn(
                    "w-0.5 h-4 rounded-full",
                    isCompleted || isActive ? "bg-brand" : "bg-border-subtle"
                  )} />
                </div>
              )}

              {/* Step */}
              <div
                className={cn(
                  "rounded-lg border px-3 py-2.5 transition-colors",
                  isActive && "border-brand bg-brand/5 shadow-sm",
                  isCompleted && "border-success/30 bg-success/5",
                  isPending && "border-border-subtle opacity-50",
                  !isActive && !isCompleted && !isPending && "border-border-subtle"
                )}
              >
                {isSequential && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={cn(
                      "w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold",
                      isActive ? "bg-brand text-white" :
                      isCompleted ? "bg-success text-white" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? "✓" : groupIndex + 1}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Step {groupIndex + 1}
                      {isActive && " — Active"}
                      {isCompleted && " — Done"}
                      {isPending && " — Waiting"}
                    </span>
                  </div>
                )}

                {group.map((signer) => {
                  const statusInfo = signerStatusConfig[signer.status];
                  const StatusIcon = statusIcons[signer.status] || Clock;
                  const RoleIcon = roleIcons[signer.role] || Send;

                  return (
                    <div key={signer.id} className="flex items-center gap-2 py-1">
                      <StatusIcon className={cn("h-3.5 w-3.5 flex-shrink-0",
                        signer.status === "signed" ? "text-success" :
                        signer.status === "viewed" ? "text-warning" :
                        signer.status === "declined" ? "text-destructive" :
                        signer.status === "sent" ? "text-brand" :
                        "text-muted-foreground"
                      )} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">{signer.name}</span>
                        {!compact && (
                          <span className="text-xs text-muted-foreground ml-1.5">{signer.email}</span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] h-4 capitalize gap-0.5">
                        <RoleIcon className="h-2.5 w-2.5" />
                        {signer.role}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px] h-4", statusInfo.color)}>
                        {statusInfo.label}
                      </Badge>
                      {signer.signedAt && !compact && (
                        <span className="text-[10px] text-muted-foreground">
                          {format(signer.signedAt, "MMM d")}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Counter-signature info */}
      {isSequential && workflow.signers.some((s) => s.role === "approver") && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-surface-secondary text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          <span>
            Approvers must complete their step before the next signer is notified.
          </span>
        </div>
      )}
    </div>
  );
}
