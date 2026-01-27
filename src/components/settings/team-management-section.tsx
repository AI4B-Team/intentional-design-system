import * as React from "react";
import { useOrganization, type OrgRole } from "@/contexts/OrganizationContext";
import { 
  useOrganizationInvites, 
  useInviteMember, 
  useRemoveMember, 
  useUpdateMemberRole 
} from "@/hooks/useOrganizationManagement";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Shield, 
  Crown, 
  UserCog 
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/AuthContext";

const ROLE_LABELS: Record<OrgRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  acquisitions: "Acquisitions",
  dispositions: "Dispositions",
  caller: "Caller",
  member: "Member",
};

const ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
  owner: "Full access, billing, can delete organization",
  admin: "Manage team & settings, all operational access",
  manager: "View all, assign properties, edit any deal",
  acquisitions: "Create/manage assigned properties, make offers",
  dispositions: "Manage buyers, send deal blasts",
  caller: "View assigned properties, log calls",
  member: "View assigned properties only",
};

function getRoleIcon(role: OrgRole) {
  switch (role) {
    case "owner":
      return <Crown className="h-4 w-4 text-amber-500" />;
    case "admin":
      return <Shield className="h-4 w-4 text-brand-accent" />;
    case "manager":
      return <UserCog className="h-4 w-4 text-blue-500" />;
    default:
      return <Users className="h-4 w-4 text-content-tertiary" />;
  }
}

export function TeamManagementSection() {
  const { user } = useAuth();
  const { organization, membership, members, canManageTeam, refetchMembers } = useOrganization();
  const { data: invites, isLoading: invitesLoading } = useOrganizationInvites();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const updateRole = useUpdateMemberRole();

  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<OrgRole>("member");

  if (!organization) {
    return null;
  }

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    await inviteMember.mutateAsync({ email: inviteEmail, role: inviteRole });
    setInviteEmail("");
    setInviteRole("member");
    setInviteDialogOpen(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeMember.mutateAsync(memberId);
    refetchMembers();
  };

  const handleUpdateRole = async (memberId: string, role: OrgRole) => {
    await updateRole.mutateAsync({ memberId, role });
  };

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingInvites = invites || [];

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-h2 font-semibold text-content">Team Members</h2>
          <p className="text-small text-content-secondary">
            {activeMembers.length} of {organization.max_users} seats used
          </p>
        </div>
        
        {canManageTeam && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="primary" size="sm" icon={<UserPlus className="h-4 w-4" />}>
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROLE_LABELS) as OrgRole[])
                        .filter((r) => r !== "owner")
                        .map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex flex-col">
                              <span>{ROLE_LABELS[role]}</span>
                              <span className="text-tiny text-content-tertiary">
                                {ROLE_DESCRIPTIONS[role]}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleInvite}
                  disabled={!inviteEmail || inviteMember.isPending}
                >
                  {inviteMember.isPending ? <Spinner size="sm" className="mr-2" /> : null}
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Active Members */}
      <div className="space-y-2">
        {activeMembers.map((member) => {
          const isCurrentUser = member.user_id === user?.id;
          const isOwner = member.role === "owner";
          const canEdit = canManageTeam && !isOwner && !isCurrentUser;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-medium bg-surface-secondary"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-accent/10 flex items-center justify-center">
                  {getRoleIcon(member.role)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-small font-medium text-content">
                      {isCurrentUser ? "You" : `User ${member.user_id.slice(0, 8)}...`}
                    </p>
                    <Badge variant={isOwner ? "default" : "secondary"}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </div>
                  <p className="text-tiny text-content-tertiary">
                    Joined {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>

              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(Object.keys(ROLE_LABELS) as OrgRole[])
                      .filter((r) => r !== "owner" && r !== member.role)
                      .map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleUpdateRole(member.id, role)}
                        >
                          Change to {ROLE_LABELS[role]}
                        </DropdownMenuItem>
                      ))}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove from team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="mt-6">
          <h3 className="text-h4 font-medium text-content mb-3">Pending Invitations</h3>
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 rounded-medium bg-surface-secondary border border-dashed border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-small font-medium text-content">{invite.email}</p>
                    <p className="text-tiny text-content-tertiary">
                      Invited as {ROLE_LABELS[invite.role as OrgRole]} • Expires{" "}
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {invitesLoading && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}
    </Card>
  );
}
