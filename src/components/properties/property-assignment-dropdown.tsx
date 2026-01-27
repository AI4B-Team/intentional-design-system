import * as React from "react";
import { useOrganization, type OrganizationMember } from "@/contexts/OrganizationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useAssignProperty } from "@/hooks/usePropertyAssignment";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, Search, X, Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface PropertyAssignmentDropdownProps {
  propertyId: string;
  propertyAddress: string;
  currentAssigneeId: string | null;
  onAssigned?: () => void;
  compact?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PropertyAssignmentDropdown({
  propertyId,
  propertyAddress,
  currentAssigneeId,
  onAssigned,
  compact = false,
}: PropertyAssignmentDropdownProps) {
  const { members } = useOrganization();
  const { canAssignProperty } = usePermissions();
  const assignProperty = useAssignProperty();
  
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Get current assignee info
  const currentAssignee = members.find((m) => m.user_id === currentAssigneeId);

  // Filter members by search
  const filteredMembers = React.useMemo(() => {
    if (!search) return members.filter((m) => m.status === "active");
    const query = search.toLowerCase();
    return members.filter(
      (m) =>
        m.status === "active" &&
        (m.user?.email?.toLowerCase().includes(query) ||
          m.user?.full_name?.toLowerCase().includes(query))
    );
  }, [members, search]);

  // Get member workload (mock for now - would need real data)
  const getMemberWorkload = (memberId: string) => {
    return Math.floor(Math.random() * 30) + 5; // Mock workload
  };

  const handleAssign = async (member: OrganizationMember | null) => {
    await assignProperty.mutateAsync({
      propertyId,
      propertyAddress,
      assigneeId: member?.user_id || null,
      assigneeName: member?.user?.full_name || member?.user?.email || undefined,
    });
    setOpen(false);
    setSearch("");
    onAssigned?.();
  };

  if (!canAssignProperty) {
    // Read-only view
    return (
      <div className="flex items-center gap-2">
        {currentAssignee ? (
          <>
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-tiny bg-brand-accent/10 text-brand-accent">
                {getInitials(currentAssignee.user?.full_name || currentAssignee.user?.email || "?")}
              </AvatarFallback>
            </Avatar>
            <span className="text-small text-content">
              {currentAssignee.user?.full_name || currentAssignee.user?.email}
            </span>
          </>
        ) : (
          <span className="text-small text-content-tertiary">Unassigned</span>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className={cn(
            "justify-start gap-2",
            compact && "h-8 px-2"
          )}
        >
          {currentAssignee ? (
            <>
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-tiny bg-brand-accent/10 text-brand-accent">
                  {getInitials(currentAssignee.user?.full_name || currentAssignee.user?.email || "?")}
                </AvatarFallback>
              </Avatar>
              <span className={cn("text-content", compact && "text-small")}>
                {compact 
                  ? getInitials(currentAssignee.user?.full_name || currentAssignee.user?.email || "?")
                  : currentAssignee.user?.full_name || currentAssignee.user?.email
                }
              </span>
            </>
          ) : (
            <>
              <User className="h-4 w-4 text-content-tertiary" />
              <span className={cn("text-content-tertiary", compact && "text-small")}>
                {compact ? "—" : "Unassigned"}
              </span>
            </>
          )}
          {!compact && <ChevronDown className="h-3 w-3 text-content-tertiary ml-auto" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>

        <div className="max-h-[280px] overflow-y-auto p-1">
          {filteredMembers.map((member) => {
            const isSelected = member.user_id === currentAssigneeId;
            const workload = getMemberWorkload(member.user_id);
            
            return (
              <button
                key={member.id}
                onClick={() => handleAssign(member)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-medium text-left transition-colors",
                  isSelected ? "bg-brand-accent/10" : "hover:bg-surface-secondary"
                )}
                disabled={assignProperty.isPending}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-small bg-brand-accent/10 text-brand-accent">
                    {getInitials(member.user?.full_name || member.user?.email || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-small font-medium text-content truncate">
                    {member.user?.full_name || member.user?.email || "Unknown"}
                  </p>
                  <p className="text-tiny text-content-tertiary capitalize">
                    {member.role} • {workload} active
                  </p>
                </div>
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-brand-accent" />
                )}
              </button>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="p-4 text-center text-small text-content-tertiary">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No team members found
            </div>
          )}
        </div>

        {currentAssigneeId && (
          <div className="p-1 border-t border-border">
            <button
              onClick={() => handleAssign(null)}
              className="w-full flex items-center gap-2 p-2 rounded-medium text-left hover:bg-surface-secondary text-content-secondary"
              disabled={assignProperty.isPending}
            >
              <X className="h-4 w-4" />
              <span className="text-small">Unassign</span>
            </button>
          </div>
        )}

        {assignProperty.isPending && (
          <div className="absolute inset-0 bg-surface/80 flex items-center justify-center rounded-medium">
            <Spinner size="sm" />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
