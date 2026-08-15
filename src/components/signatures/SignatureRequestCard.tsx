import * as React from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PenTool,
  MoreVertical,
  Eye,
  Mail,
  Download,
  Trash2,
  FileText,
  Users,
  RefreshCw,
  Link2,
  UserPlus,
  Ban,
  ArrowRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInHours } from "date-fns";
import {
  AI_MODE_CONFIG,
  AIActionMode,
  SignatureRequest,
  formatTimeAgo,
  getNextAction,
  statusConfig,
} from "./signature-request-types";

interface SignatureRequestCardProps {
  request: SignatureRequest;
  onSelect: (request: SignatureRequest) => void;
  onResend: (id: string, e?: React.MouseEvent) => void;
  onCopyLink: (id: string, e?: React.MouseEvent) => void;
  onVoid: (id: string, e?: React.MouseEvent) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
  onRunAiReview: (request: SignatureRequest) => void;
  onChangeAiMode: (id: string, mode: AIActionMode) => void;
}

export function SignatureRequestCard({
  request,
  onSelect,
  onResend,
  onCopyLink,
  onVoid,
  onDelete,
  onRunAiReview,
  onChangeAiMode,
}: SignatureRequestCardProps) {
  const statusInfo = statusConfig[request.status];
  const StatusIcon = statusInfo.icon;
  const nextAction = getNextAction(request);

  return (
    <Card padding="md" className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(request)}>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <PenTool className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-foreground truncate">{request.documentName}</h3>
            <Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
            {nextAction && (
              <Badge variant="outline" className={cn("text-xs gap-1", nextAction.color)}>
                <nextAction.icon className="h-3 w-3" />
                {nextAction.label}
              </Badge>
            )}
          </div>
          {/* Deal context line */}
          {(request.dealId || request.propertyAddress) && (
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-brand/60" />
              {request.dealId ? (
                <>
                  <span>Linked Deal: {request.propertyAddress || "—"}</span>
                  {request.dealStatus && (
                    <span className="text-brand/80 font-medium">· {request.dealStatus.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                  )}
                </>
              ) : (
                <span>{request.propertyAddress}</span>
              )}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {request.recipientName}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {request.recipientEmail}
            </span>
          </div>

          {/* Status Timeline */}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>
              {request.sentAt ? `Sent ${formatTimeAgo(request.sentAt)}` : `Created ${formatTimeAgo(request.createdAt)}`}
            </span>
            {request.viewedAt && (
              <>
                <ArrowRight className="h-3 w-3" />
                <span>Viewed {formatTimeAgo(request.viewedAt)}</span>
              </>
            )}
            {request.signedAt && (
              <>
                <ArrowRight className="h-3 w-3" />
                <span className="text-success">Signed {formatTimeAgo(request.signedAt)}</span>
              </>
            )}
            {request.viewCount !== undefined && request.viewCount > 0 && (
              <span className="ml-2 flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {request.viewCount}×
              </span>
            )}
            {/* AI Mode Status — visible, not hidden */}
            {request.aiMode && request.aiMode !== "manual" && request.aiStatus && (
              <span className={cn(
                "ml-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand/5 border border-brand/15",
                AI_MODE_CONFIG[request.aiMode].color
              )}>
                <Sparkles className="h-2.5 w-2.5" />
                <span className="font-medium">{request.aiStatus}</span>
              </span>
            )}
            {request.aiMode === "manual" && request.status !== "signed" && request.status !== "draft" && (
              <span className="ml-2 flex items-center gap-1 text-muted-foreground/60">
                <span className="text-[10px]">🧍</span>
                <span>Manual</span>
              </span>
            )}
          </div>
        </div>

        <div className="text-right hidden sm:flex flex-col items-end gap-1">
          {request.expiresAt && request.status === "pending" && (
            <p className={cn(
              "text-xs",
              differenceInHours(request.expiresAt, new Date()) <= 48
                ? "text-destructive font-medium"
                : "text-muted-foreground"
            )}>
              Expires {format(request.expiresAt, "MMM d")}
            </p>
          )}
          {request.lastActivity && (
            <p className="text-xs text-muted-foreground">{request.lastActivity}</p>
          )}
        </div>

        {/* Quick Actions */}
        <TooltipProvider delayDuration={0}>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {request.status === "pending" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => onResend(request.id, e)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]">Send Reminder</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => onCopyLink(request.id, e)}>
                  <Link2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-[200]">Copy Link</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onSelect(request); }}>
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {request.status === "pending" && (
              <>
                <DropdownMenuItem className="gap-2" onClick={(e) => onResend(request.id, e as any)}>
                  <RefreshCw className="h-4 w-4" />
                  Send Reminder
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={(e) => onCopyLink(request.id, e as any)}>
                  <Link2 className="h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Signer
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={(e) => onVoid(request.id, e as any)}>
                  <Ban className="h-4 w-4" />
                  Void
                </DropdownMenuItem>
              </>
            )}
            {request.status === "signed" && (
              <DropdownMenuItem className="gap-2">
                <Download className="h-4 w-4" />
                Download Signed
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="gap-2">
              <FileText className="h-4 w-4" />
              View Audit Trail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* AI Actions Section */}
            <div className="px-2 py-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Actions</p>
            </div>
            <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onRunAiReview(request); }}>
              <Sparkles className="h-4 w-4" />
              Run AI Review
            </DropdownMenuItem>
            {request.aiMode !== "manual" && (
              <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onChangeAiMode(request.id, "manual"); }}>
                <Ban className="h-4 w-4" />
                Pause AI
              </DropdownMenuItem>
            )}
            {request.aiMode === "manual" && request.status === "pending" && (
              <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); onChangeAiMode(request.id, "ai_assist"); }}>
                <Sparkles className="h-4 w-4" />
                Enable AI Assist
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={(e) => onDelete(request.id, e as any)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
