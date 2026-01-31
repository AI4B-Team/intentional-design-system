import * as React from "react";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MailOpen,
  Archive,
  Trash2,
  Tag,
  Clock,
  MoreHorizontal,
  Star,
  Forward,
  Reply,
  Bell,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionsBarProps {
  selectedCount: number;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onStar: () => void;
  onSnooze: (duration: string) => void;
  onClearSelection: () => void;
  isProcessing?: boolean;
}

const SNOOZE_OPTIONS = [
  { label: "1 hour", value: "1h" },
  { label: "4 hours", value: "4h" },
  { label: "Tomorrow morning", value: "tomorrow-9am" },
  { label: "Tomorrow afternoon", value: "tomorrow-2pm" },
  { label: "Next week", value: "1w" },
];

export function BulkActionsBar({
  selectedCount,
  onMarkRead,
  onMarkUnread,
  onArchive,
  onDelete,
  onStar,
  onSnooze,
  onClearSelection,
  isProcessing,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 bg-brand/5 border-b border-brand/20",
      "animate-in slide-in-from-top-1 duration-200"
    )}>
      <Badge variant="default" size="sm" className="font-semibold">
        {selectedCount} selected
      </Badge>

      <div className="flex items-center gap-1 ml-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkRead}
              disabled={isProcessing}
            >
              <MailOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mark as read</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onStar}
              disabled={isProcessing}
            >
              <Star className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Star selected</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onArchive}
              disabled={isProcessing}
            >
              <Archive className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Archive</TooltipContent>
        </Tooltip>

        {/* Snooze Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isProcessing}>
                  <Clock className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="center" side="bottom" sideOffset={4} className="z-[100]">
            {SNOOZE_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSnooze(option.value)}
              >
                <Clock className="h-4 w-4 mr-2" />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isProcessing}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isProcessing}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="bottom" sideOffset={4} className="z-[100]">
            <DropdownMenuItem onClick={onMarkUnread}>
              <Bell className="h-4 w-4 mr-2" />
              Mark as unread
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Tag className="h-4 w-4 mr-2" />
              Add label
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Forward className="h-4 w-4 mr-2" />
              Forward all
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <BellOff className="h-4 w-4 mr-2" />
              Mute thread
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        Clear selection
      </Button>
    </div>
  );
}
