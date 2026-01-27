import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { useOrganization, type OrgRole } from "@/contexts/OrganizationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  useOrganizationInvites, 
  useInviteMember, 
  useRemoveMember, 
  useUpdateMemberRole,
  useCancelInvite,
  useResendInvite
} from "@/hooks/useOrganizationManagement";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { 
  UserPlus, 
  MoreVertical, 
  Crown, 
  Shield, 
  UserCog,
  Users,
  Mail,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  Trash2,
  Info,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const ROLE_CONFIG: Record<OrgRole, { label: string; description: string; color: string }> = {
  owner: { 
    label: "Owner", 
    description: "Full access including billing and organization deletion",
    color: "text-amber-500"
  },
  admin: { 
    label: "Admin", 
    description: "Full access except billing. Can manage team members and settings.",
    color: "text-brand-accent"
  },
  manager: { 
    label: "Manager", 
    description: "Can view all properties, assign to team, and edit any deal.",
    color: "text-blue-500"
  },
  acquisitions: { 
    label: "Acquisitions", 
    description: "Can create properties, make offers, use calculators. Edits assigned properties only.",
    color: "text-emerald-500"
  },
  dispositions: { 
    label: "Dispositions", 
    description: "Manages buyer database and sends deal blasts. Read-only property access.",
    color: "text-purple-500"
  },
  caller: { 
    label: "Caller", 
    description: "Can view assigned properties and log outreach activities.",
    color: "text-orange-500"
  },
  member: { 
    label: "Member", 
    description: "Basic access. Can view assigned properties only.",
    color: "text-content-tertiary"
  },
};

const PERMISSIONS_MATRIX = [
  { permission: "View all properties", owner: true, admin: true, manager: true, acquisitions: "read", dispositions: "read", caller: "assigned", member: "assigned" },
  { permission: "Create properties", owner: true, admin: true, manager: true, acquisitions: true, dispositions: false, caller: false, member: false },
  { permission: "Edit any property", owner: true, admin: true, manager: true, acquisitions: "assigned", dispositions: false, caller: "assigned", member: false },
  { permission: "Delete properties", owner: true, admin: true, manager: false, acquisitions: false, dispositions: false, caller: false, member: false },
  { permission: "Make offers", owner: true, admin: true, manager: true, acquisitions: true, dispositions: false, caller: false, member: false },
  { permission: "View financials", owner: true, admin: true, manager: true, acquisitions: true, dispositions: false, caller: false, member: false },
  { permission: "Manage buyers", owner: true, admin: true, manager: true, acquisitions: false, dispositions: true, caller: false, member: false },
  { permission: "Manage team", owner: true, admin: true, manager: false, acquisitions: false, dispositions: false, caller: false, member: false },
  { permission: "Manage settings", owner: true, admin: true, manager: false, acquisitions: false, dispositions: false, caller: false, member: false },
  { permission: "Manage billing", owner: true, admin: false, manager: false, acquisitions: false, dispositions: false, caller: false, member: false },
];

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

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>;
    case "invited":
      return <Badge variant="warning">Pending</Badge>;
    case "suspended":
      return <Badge variant="destructive">Suspended</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function TeamManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organization, membership, members, refetchMembers } = useOrganization();
  const { canManageTeam, canInviteMembers } = usePermissions();
  const { data: invites, isLoading: invitesLoading, refetch: refetchInvites } = useOrganizationInvites();
  
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const updateRole = useUpdateMemberRole();
  const cancelInvite = useCancelInvite();
  const resendInvite = useResendInvite();

  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<OrgRole>("member");
  const [inviteMessage, setInviteMessage] = React.useState("");
  
  // Confirmation dialogs
  const [roleChangeDialog, setRoleChangeDialog] = React.useState<{
    open: boolean;
    member: any;
    newRole: OrgRole | null;
  }>({ open: false, member: null, newRole: null });
  
  const [removeDialog, setRemoveDialog] = React.useState<{
    open: boolean;
    member: any;
  }>({ open: false, member: null });

  // Collapsible states
  const [pendingOpen, setPendingOpen] = React.useState(true);
  const [permissionsOpen, setPermissionsOpen] = React.useState(false);

  // Redirect if no permission
  React.useEffect(() => {
    if (!canManageTeam && membership) {
      navigate("/dashboard");
    }
  }, [canManageTeam, membership, navigate]);

  if (!organization || !canManageTeam) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const activeMembers = members.filter((m) => m.status === "active" || m.status === "suspended");
  const pendingInvites = invites || [];
  const seatsUsed = activeMembers.length;
  const atSeatLimit = seatsUsed >= organization.max_users;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    try {
      await inviteMember.mutateAsync({ 
        email: inviteEmail.trim(), 
        role: inviteRole 
      });
      setInviteEmail("");
      setInviteRole("member");
      setInviteMessage("");
      setInviteModalOpen(false);
      refetchInvites();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRoleChange = async () => {
    if (!roleChangeDialog.member || !roleChangeDialog.newRole) return;
    
    try {
      await updateRole.mutateAsync({ 
        memberId: roleChangeDialog.member.id, 
        role: roleChangeDialog.newRole 
      });
      setRoleChangeDialog({ open: false, member: null, newRole: null });
      refetchMembers();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemoveMember = async () => {
    if (!removeDialog.member) return;
    
    try {
      await removeMember.mutateAsync(removeDialog.member.id);
      setRemoveDialog({ open: false, member: null });
      refetchMembers();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInvite.mutateAsync(inviteId);
      refetchInvites();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      await resendInvite.mutateAsync(inviteId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h1 font-semibold text-content">Team Members</h1>
            <p className="text-body text-content-secondary mt-1">
              {organization.name} • {seatsUsed} of {organization.max_users} seats used
            </p>
          </div>
          
          {canInviteMembers && (
            <Button 
              variant="primary" 
              icon={<UserPlus className="h-4 w-4" />}
              onClick={() => setInviteModalOpen(true)}
            >
              Invite Member
            </Button>
          )}
        </div>

        {/* Team Members Table */}
        <Card variant="default" padding="none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeMembers.map((member) => {
                const isCurrentUser = member.user_id === user?.id;
                const isOwner = member.role === "owner";
                const canEdit = canManageTeam && !isOwner && !isCurrentUser;

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-accent/10 flex items-center justify-center">
                          {getRoleIcon(member.role)}
                        </div>
                        <div>
                          <p className="text-small font-medium text-content">
                            {isCurrentUser ? "You" : `User ${member.user_id.slice(0, 8)}...`}
                          </p>
                          <p className="text-tiny text-content-tertiary">
                            {member.user?.email || `${member.user_id.slice(0, 12)}...`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isOwner && <Crown className="h-4 w-4 text-amber-500" />}
                        <Badge variant={isOwner ? "default" : "secondary"}>
                          {ROLE_CONFIG[member.role]?.label || member.role}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(member.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-small text-content-secondary">
                        {member.last_active_at 
                          ? formatDistanceToNow(new Date(member.last_active_at), { addSuffix: true })
                          : "Never"
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <UserCog className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {(Object.keys(ROLE_CONFIG) as OrgRole[])
                                  .filter((r) => r !== "owner" && r !== member.role)
                                  .map((role) => (
                                    <DropdownMenuItem
                                      key={role}
                                      onClick={() => setRoleChangeDialog({ 
                                        open: true, 
                                        member, 
                                        newRole: role 
                                      })}
                                    >
                                      {ROLE_CONFIG[role].label}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            {member.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => updateRole.mutateAsync({ 
                                  memberId: member.id, 
                                  role: member.role 
                                })}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Suspend Member
                              </DropdownMenuItem>
                            ) : member.status === "suspended" ? (
                              <DropdownMenuItem
                                onClick={() => updateRole.mutateAsync({ 
                                  memberId: member.id, 
                                  role: member.role 
                                })}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Reactivate
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setRemoveDialog({ open: true, member })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <Collapsible open={pendingOpen} onOpenChange={setPendingOpen}>
            <Card variant="default" padding="none">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-surface-secondary transition-colors">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-content-tertiary" />
                    <span className="text-small font-medium text-content">
                      Pending Invitations ({pendingInvites.length})
                    </span>
                  </div>
                  {pendingOpen ? (
                    <ChevronDown className="h-4 w-4 text-content-tertiary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-content-tertiary" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingInvites.map((invite: any) => (
                        <TableRow key={invite.id}>
                          <TableCell>
                            <span className="text-small text-content">{invite.email}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {ROLE_CONFIG[invite.role as OrgRole]?.label || invite.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-small text-content-secondary">
                              {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-small text-content-secondary">
                              {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleResendInvite(invite.id)}
                                disabled={resendInvite.isPending}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCancelInvite(invite.id)}
                                disabled={cancelInvite.isPending}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Role Permissions Reference */}
        <Collapsible open={permissionsOpen} onOpenChange={setPermissionsOpen}>
          <Card variant="default" padding="none">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 hover:bg-surface-secondary transition-colors">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-content-tertiary" />
                  <span className="text-small font-medium text-content">
                    Role Permissions Reference
                  </span>
                </div>
                {permissionsOpen ? (
                  <ChevronDown className="h-4 w-4 text-content-tertiary" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-content-tertiary" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Permission</TableHead>
                      {(Object.keys(ROLE_CONFIG) as OrgRole[]).map((role) => (
                        <TableHead key={role} className="text-center min-w-[80px]">
                          {ROLE_CONFIG[role].label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PERMISSIONS_MATRIX.map((row) => (
                      <TableRow key={row.permission}>
                        <TableCell className="text-small text-content">
                          {row.permission}
                        </TableCell>
                        {(Object.keys(ROLE_CONFIG) as OrgRole[]).map((role) => {
                          const value = row[role as keyof typeof row];
                          return (
                            <TableCell key={role} className="text-center">
                              {value === true ? (
                                <Check className="h-4 w-4 text-status-success mx-auto" />
                              ) : value === false ? (
                                <X className="h-4 w-4 text-content-tertiary mx-auto" />
                              ) : (
                                <span className="text-tiny text-content-secondary">{value}</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join {organization.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {atSeatLimit && (
              <div className="flex items-start gap-3 p-3 rounded-medium bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-small font-medium text-content">
                    You've reached your plan limit of {organization.max_users} users.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={atSeatLimit}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select 
                value={inviteRole} 
                onValueChange={(v) => setInviteRole(v as OrgRole)}
                disabled={atSeatLimit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_CONFIG) as OrgRole[])
                    .filter((r) => r !== "owner")
                    .map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_CONFIG[role].label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-tiny text-content-secondary">
                {ROLE_CONFIG[inviteRole]?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-message">Personal Message (optional)</Label>
              <Textarea
                id="invite-message"
                placeholder="Add a note to include in the invitation email..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                disabled={atSeatLimit}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviteMember.isPending || atSeatLimit}
            >
              {inviteMember.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation */}
      <AlertDialog 
        open={roleChangeDialog.open} 
        onOpenChange={(open) => !open && setRoleChangeDialog({ open: false, member: null, newRole: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change this member's role to{" "}
              <strong>{roleChangeDialog.newRole && ROLE_CONFIG[roleChangeDialog.newRole]?.label}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {roleChangeDialog.newRole && (
            <div className="p-3 rounded-medium bg-surface-secondary text-small text-content-secondary">
              {ROLE_CONFIG[roleChangeDialog.newRole]?.description}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange} disabled={updateRole.isPending}>
              {updateRole.isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Change Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirmation */}
      <AlertDialog 
        open={removeDialog.open} 
        onOpenChange={(open) => !open && setRemoveDialog({ open: false, member: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Remove Team Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Remove this member from <strong>{organization.name}</strong>?
              They will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember} 
              disabled={removeMember.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMember.isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
