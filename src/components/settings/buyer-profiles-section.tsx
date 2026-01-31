import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Plus, 
  Building2, 
  Mail, 
  Phone, 
  FileText,
  Star,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useBuyerProfiles, useDeleteBuyerProfile } from "@/hooks/useBuyerProfiles";
import { BuyerProfileModal } from "./buyer-profile-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { format, isPast, parseISO, differenceInDays } from "date-fns";

export function BuyerProfilesSection() {
  const { data: profiles, isLoading } = useBuyerProfiles();
  const deleteProfile = useDeleteBuyerProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingProfile(id);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProfile.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProfile(null);
  };

  const getPOFStatus = (expirationDate: string) => {
    const expDate = parseISO(expirationDate);
    if (isPast(expDate)) {
      return { status: 'expired', label: 'Expired', variant: 'destructive' as const };
    }
    const daysUntil = differenceInDays(expDate, new Date());
    if (daysUntil <= 5) {
      return { status: 'expiring', label: `Expires in ${daysUntil}d`, variant: 'warning' as const };
    }
    return { status: 'valid', label: `Exp: ${format(expDate, 'MMM d, yyyy')}`, variant: 'secondary' as const };
  };

  return (
    <>
      <Card variant="default" padding="none">
        <CardHeader className="border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                <User className="h-5 w-5 text-brand" />
              </div>
              <div>
                <CardTitle>Buyer Profiles</CardTitle>
                <CardDescription>
                  Manage buyer identities for sending offer campaigns
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !profiles?.length ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-content mb-1">No buyer profiles yet</h3>
              <p className="text-sm text-content-secondary mb-4">
                Create buyer profiles to send offers from different entities
              </p>
              <Button variant="primary" icon={<Plus />} onClick={() => setIsModalOpen(true)}>
                Create First Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-start justify-between p-4 bg-surface-secondary rounded-lg border border-border-subtle"
                >
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                      {profile.company_name ? (
                        <Building2 className="h-6 w-6 text-brand" />
                      ) : (
                        <User className="h-6 w-6 text-brand" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-content">{profile.profile_name}</h4>
                        {profile.is_default && (
                          <Badge variant="info" size="sm" className="gap-1">
                            <Star className="h-3 w-3" />
                            Default
                          </Badge>
                        )}
                        {!profile.is_active && (
                          <Badge variant="secondary" size="sm">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-content-secondary">
                        {profile.buyer_name}
                        {profile.company_name && ` • ${profile.company_name}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-content-tertiary">
                        {profile.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {profile.email}
                          </span>
                        )}
                        {profile.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {profile.phone}
                          </span>
                        )}
                      </div>
                      {profile.pof ? (
                        <div className="flex items-center gap-2 mt-2">
                          <FileText className="h-3.5 w-3.5 text-success" />
                          <span className="text-xs text-content-secondary">
                            POF: ${profile.pof.amount.toLocaleString()}
                          </span>
                          <Badge 
                            variant={getPOFStatus(profile.pof.expiration_date).variant} 
                            size="sm"
                          >
                            {getPOFStatus(profile.pof.expiration_date).label}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          <AlertCircle className="h-3.5 w-3.5 text-warning" />
                          <span className="text-xs text-warning">No POF linked</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(profile.id)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteId(profile.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BuyerProfileModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        editId={editingProfile}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Buyer Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this buyer profile? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
