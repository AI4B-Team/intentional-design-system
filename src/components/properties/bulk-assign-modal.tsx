import * as React from "react";
import { useOrganization, type OrganizationMember } from "@/contexts/OrganizationContext";
import { useBulkAssignProperties } from "@/hooks/usePropertyAssignment";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Users, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface BulkAssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyIds: string[];
  onComplete?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function BulkAssignModal({
  open,
  onOpenChange,
  propertyIds,
  onComplete,
}: BulkAssignModalProps) {
  const { members } = useOrganization();
  const bulkAssign = useBulkAssignProperties();
  
  const [search, setSearch] = React.useState("");
  const [selectedMember, setSelectedMember] = React.useState<OrganizationMember | null>(null);

  // Filter members by search
  const filteredMembers = React.useMemo(() => {
    const activeMembers = members.filter((m) => m.status === "active");
    if (!search) return activeMembers;
    const query = search.toLowerCase();
    return activeMembers.filter(
      (m) =>
        m.user?.email?.toLowerCase().includes(query) ||
        m.user?.full_name?.toLowerCase().includes(query)
    );
  }, [members, search]);

  const handleAssign = async () => {
    if (!selectedMember) return;

    await bulkAssign.mutateAsync({
      propertyIds,
      assigneeId: selectedMember.user_id,
      assigneeName: selectedMember.user?.full_name || selectedMember.user?.email || "Unknown",
    });
    
    setSelectedMember(null);
    setSearch("");
    onOpenChange(false);
    onComplete?.();
  };

  const handleClose = () => {
    setSelectedMember(null);
    setSearch("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-accent" />
            Assign Properties
          </DialogTitle>
          <DialogDescription>
            Assign {propertyIds.length} selected properties to a team member
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Team Member</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
              <Input
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-[240px] overflow-y-auto border border-border rounded-medium">
            {filteredMembers.map((member) => {
              const isSelected = selectedMember?.id === member.id;
              
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left transition-colors border-b border-border last:border-b-0",
                    isSelected ? "bg-brand-accent/10" : "hover:bg-surface-secondary"
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-brand-accent/10 text-brand-accent">
                      {getInitials(member.user?.full_name || member.user?.email || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-small font-medium text-content truncate">
                      {member.user?.full_name || member.user?.email || "Unknown"}
                    </p>
                    <p className="text-tiny text-content-tertiary capitalize">
                      {member.role}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-brand-accent flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}

            {filteredMembers.length === 0 && (
              <div className="p-6 text-center">
                <Users className="h-10 w-10 mx-auto mb-2 text-content-tertiary opacity-50" />
                <p className="text-small text-content-tertiary">No team members found</p>
              </div>
            )}
          </div>

          {selectedMember && (
            <div className="p-3 rounded-medium bg-brand-accent/5 border border-brand-accent/20">
              <p className="text-small text-content">
                Assign <strong>{propertyIds.length} properties</strong> to{" "}
                <strong>{selectedMember.user?.full_name || selectedMember.user?.email}</strong>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={!selectedMember || bulkAssign.isPending}
          >
            {bulkAssign.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Assigning...
              </>
            ) : (
              `Assign ${propertyIds.length} Properties`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
