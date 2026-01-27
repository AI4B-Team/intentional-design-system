import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  useSuppressionList,
  useAddToSuppressionList,
  useRemoveFromSuppressionList,
} from "@/hooks/useMailCampaigns";
import {
  Plus,
  Upload,
  Search,
  MoreHorizontal,
  Trash2,
  Ban,
  RotateCcw,
  AlertCircle,
  UserX,
  MapPinOff,
  Copy,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { NoDataState } from "@/components/ui/empty-state";

const REASON_CONFIG: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "warning" | "destructive" }> = {
  do_not_mail: { label: "Do Not Mail", icon: <Ban className="h-4 w-4" />, variant: "destructive" },
  returned: { label: "Returned", icon: <RotateCcw className="h-4 w-4" />, variant: "warning" },
  deceased: { label: "Deceased", icon: <UserX className="h-4 w-4" />, variant: "secondary" },
  invalid_address: { label: "Invalid Address", icon: <MapPinOff className="h-4 w-4" />, variant: "warning" },
  duplicate: { label: "Duplicate", icon: <Copy className="h-4 w-4" />, variant: "secondary" },
  import: { label: "Imported", icon: <FileText className="h-4 w-4" />, variant: "default" },
};

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  campaign_return: "Campaign Return",
  user_request: "User Request",
  import: "Import",
};

export default function MailSuppression() {
  const navigate = useNavigate();
  const { data: suppressionList, isLoading } = useSuppressionList();
  const addToSuppression = useAddToSuppressionList();
  const removeFromSuppression = useRemoveFromSuppressionList();

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // New entry form state
  const [newEntry, setNewEntry] = React.useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    reason: "do_not_mail",
    notes: "",
  });

  // Filter suppression list
  const filteredList = React.useMemo(() => {
    if (!suppressionList) return [];
    if (!searchQuery) return suppressionList;
    const q = searchQuery.toLowerCase();
    return suppressionList.filter(
      (entry: any) =>
        entry.address?.toLowerCase().includes(q) ||
        entry.city?.toLowerCase().includes(q) ||
        entry.state?.toLowerCase().includes(q)
    );
  }, [suppressionList, searchQuery]);

  const handleAddEntry = async () => {
    const fullAddress = `${newEntry.address}, ${newEntry.city}, ${newEntry.state} ${newEntry.zip}`.trim();
    if (!fullAddress || fullAddress === ", ") {
      toast.error("Please enter an address");
      return;
    }

    try {
      await addToSuppression.mutateAsync({
        address: fullAddress,
        reason: newEntry.reason,
        source: "manual",
      });
      setShowAddModal(false);
      setNewEntry({ address: "", city: "", state: "", zip: "", reason: "do_not_mail", notes: "" });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRemoveEntry = async () => {
    if (!deleteId) return;
    try {
      await removeFromSuppression.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const totalCount = suppressionList?.length || 0;

  return (
    <PageLayout>
      <PageHeader
        title="Suppression List"
        description="Addresses that won't receive mail"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowImportModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import List
            </Button>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Ban className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-display font-bold">{totalCount.toLocaleString()}</p>
              <p className="text-small text-content-secondary">Total Suppressed Addresses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
              <Input
                placeholder="Search by address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filteredList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.map((entry: any) => {
                  const reasonConfig = REASON_CONFIG[entry.reason] || REASON_CONFIG.do_not_mail;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.address}</TableCell>
                      <TableCell>
                        <Badge variant={reasonConfig.variant} className="gap-1">
                          {reasonConfig.icon}
                          {reasonConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-small text-content-secondary">
                        {SOURCE_LABELS[entry.source] || entry.source}
                      </TableCell>
                      <TableCell className="text-small text-content-secondary">
                        {entry.added_at
                          ? formatDistanceToNow(new Date(entry.added_at), { addSuffix: true })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(entry.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from List
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <NoDataState
              entityName="suppressed addresses"
              onAdd={() => setShowAddModal(true)}
              addLabel="Add Address"
            />
          )}
        </CardContent>
      </Card>

      {/* Add Address Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Suppression List</DialogTitle>
            <DialogDescription>
              This address will be excluded from all future mail campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Street Address *</Label>
              <Input
                value={newEntry.address}
                onChange={(e) => setNewEntry({ ...newEntry, address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid gap-4 grid-cols-3">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={newEntry.city}
                  onChange={(e) => setNewEntry({ ...newEntry, city: e.target.value })}
                  placeholder="Austin"
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input
                  value={newEntry.state}
                  onChange={(e) => setNewEntry({ ...newEntry, state: e.target.value })}
                  placeholder="TX"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP *</Label>
                <Input
                  value={newEntry.zip}
                  onChange={(e) => setNewEntry({ ...newEntry, zip: e.target.value })}
                  placeholder="78701"
                  maxLength={10}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select
                value={newEntry.reason}
                onValueChange={(v) => setNewEntry({ ...newEntry, reason: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="do_not_mail">Do Not Mail (user requested)</SelectItem>
                  <SelectItem value="returned">Returned (undeliverable)</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                  <SelectItem value="invalid_address">Invalid Address</SelectItem>
                  <SelectItem value="duplicate">Duplicate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddEntry}
              disabled={addToSuppression.isPending}
            >
              Add to Suppression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Suppression List</DialogTitle>
            <DialogDescription>
              Upload a CSV file of addresses to add to your suppression list.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-brand transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto text-content-tertiary mb-4" />
              <p className="font-medium">Drop your file here or click to browse</p>
              <p className="text-small text-content-secondary mt-1">
                Accepted formats: CSV (max 10,000 records)
              </p>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-small font-medium mb-2">Expected columns:</p>
              <ul className="text-tiny text-content-secondary space-y-1">
                <li>• Address (required)</li>
                <li>• City (optional)</li>
                <li>• State (optional)</li>
                <li>• ZIP (optional)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled>
              Import Addresses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Suppression List?</AlertDialogTitle>
            <AlertDialogDescription>
              This address will be eligible to receive mail in future campaigns again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveEntry}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
