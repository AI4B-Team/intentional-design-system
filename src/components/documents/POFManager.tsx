import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Check,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Landmark,
  MoreVertical,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  AlertCircle,
  Bell,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addDays, isPast, isBefore } from "date-fns";
import { toast } from "sonner";

export interface POFDocument {
  id: string;
  lenderName: string;
  amount: number;
  issueDate: Date;
  expirationDate: Date;
  fileUrl?: string;
  fileName: string;
  isDefault: boolean;
  lastVerified?: Date;
  notes?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface POFManagerProps {
  onBack: () => void;
}

const initialPOFs: POFDocument[] = [
  {
    id: "1",
    lenderName: "First National Bank",
    amount: 500000,
    issueDate: new Date("2026-01-15"),
    expirationDate: new Date("2026-02-20"),
    fileName: "POF_FirstNational_500k.pdf",
    isDefault: true,
    lastVerified: new Date("2026-02-01"),
    contactEmail: "loans@firstnational.com",
    contactPhone: "(555) 123-4567",
  },
  {
    id: "2",
    lenderName: "Private Money Lender LLC",
    amount: 250000,
    issueDate: new Date("2026-01-20"),
    expirationDate: new Date("2026-03-20"),
    fileName: "POF_PrivateMoney_250k.pdf",
    isDefault: false,
    lastVerified: new Date("2026-01-25"),
    contactEmail: "info@privatemoney.com",
  },
  {
    id: "3",
    lenderName: "Hard Money Capital",
    amount: 750000,
    issueDate: new Date("2025-12-01"),
    expirationDate: new Date("2026-02-01"),
    fileName: "POF_HardMoney_750k.pdf",
    isDefault: false,
    notes: "Expired - needs renewal",
    contactPhone: "(555) 987-6543",
  },
];

type ExpirationStatus = "expired" | "critical" | "warning" | "valid";

function getExpirationStatus(expirationDate: Date): ExpirationStatus {
  const today = new Date();
  const daysUntilExpiry = differenceInDays(expirationDate, today);

  if (isPast(expirationDate)) return "expired";
  if (daysUntilExpiry <= 7) return "critical";
  if (daysUntilExpiry <= 30) return "warning";
  return "valid";
}

function getStatusBadge(status: ExpirationStatus, daysLeft: number) {
  switch (status) {
    case "expired":
      return (
        <Badge variant="destructive" className="gap-1">
          <ShieldAlert className="h-3 w-3" />
          Expired
        </Badge>
      );
    case "critical":
      return (
        <Badge className="gap-1 bg-destructive/90 text-destructive-foreground animate-pulse">
          <AlertTriangle className="h-3 w-3" />
          Expires In {daysLeft} Days
        </Badge>
      );
    case "warning":
      return (
        <Badge variant="outline" className="gap-1 border-warning text-warning bg-warning/10">
          <Clock className="h-3 w-3" />
          Expires In {daysLeft} Days
        </Badge>
      );
    case "valid":
      return (
        <Badge variant="outline" className="gap-1 border-success text-success bg-success/10">
          <ShieldCheck className="h-3 w-3" />
          Valid
        </Badge>
      );
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function POFManager({ onBack }: POFManagerProps) {
  const [pofs, setPofs] = React.useState<POFDocument[]>(initialPOFs);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = React.useState(false);
  const [selectedPof, setSelectedPof] = React.useState<POFDocument | null>(null);
  const [newPof, setNewPof] = React.useState({
    lenderName: "",
    amount: "",
    expirationDate: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
  });

  // Auto-set default if only one POF
  React.useEffect(() => {
    const validPofs = pofs.filter((p) => getExpirationStatus(p.expirationDate) !== "expired");
    if (validPofs.length === 1 && !validPofs[0].isDefault) {
      setPofs(pofs.map((p) => ({ ...p, isDefault: p.id === validPofs[0].id })));
      toast.info(`"${validPofs[0].lenderName}" set as default POF (only valid document)`);
    }
  }, [pofs]);

  // Check for expiring POFs on load
  React.useEffect(() => {
    const expiringPofs = pofs.filter((p) => {
      const status = getExpirationStatus(p.expirationDate);
      return status === "critical" || status === "warning";
    });

    const expiredPofs = pofs.filter((p) => getExpirationStatus(p.expirationDate) === "expired");

    if (expiredPofs.length > 0) {
      toast.error(
        `${expiredPofs.length} POF document(s) have expired and need renewal`,
        {
          duration: 5000,
          action: {
            label: "View",
            onClick: () => {},
          },
        }
      );
    } else if (expiringPofs.length > 0) {
      toast.warning(
        `${expiringPofs.length} POF document(s) expiring soon`,
        {
          duration: 5000,
        }
      );
    }
  }, []);

  const defaultPof = pofs.find((p) => p.isDefault);
  const validPofs = pofs.filter((p) => getExpirationStatus(p.expirationDate) !== "expired");
  const expiredPofs = pofs.filter((p) => getExpirationStatus(p.expirationDate) === "expired");
  const warningPofs = pofs.filter((p) => {
    const status = getExpirationStatus(p.expirationDate);
    return status === "critical" || status === "warning";
  });

  const handleSetDefault = (id: string) => {
    const pof = pofs.find((p) => p.id === id);
    if (pof && getExpirationStatus(pof.expirationDate) === "expired") {
      toast.error("Cannot set an expired POF as default");
      return;
    }
    setPofs(pofs.map((p) => ({ ...p, isDefault: p.id === id })));
    toast.success(`"${pof?.lenderName}" set as default POF`);
  };

  const handleDelete = (id: string) => {
    const pof = pofs.find((p) => p.id === id);
    setPofs(pofs.filter((p) => p.id !== id));
    toast.success(`"${pof?.lenderName}" POF deleted`);
  };

  const handleRequestRenewal = (pof: POFDocument) => {
    setSelectedPof(pof);
    setIsRenewalDialogOpen(true);
  };

  const handleSendRenewalRequest = () => {
    if (selectedPof) {
      toast.success(`Renewal request sent to ${selectedPof.lenderName}`, {
        description: selectedPof.contactEmail || selectedPof.contactPhone || "Contact will be notified",
      });
      setIsRenewalDialogOpen(false);
      setSelectedPof(null);
    }
  };

  const handleAddPof = () => {
    if (!newPof.lenderName.trim() || !newPof.amount || !newPof.expirationDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const pof: POFDocument = {
      id: Date.now().toString(),
      lenderName: newPof.lenderName,
      amount: parseFloat(newPof.amount),
      issueDate: new Date(),
      expirationDate: new Date(newPof.expirationDate),
      fileName: `POF_${newPof.lenderName.replace(/\s+/g, "_")}.pdf`,
      isDefault: pofs.length === 0,
      contactEmail: newPof.contactEmail || undefined,
      contactPhone: newPof.contactPhone || undefined,
      notes: newPof.notes || undefined,
    };

    setPofs([...pofs, pof]);
    setNewPof({ lenderName: "", amount: "", expirationDate: "", contactEmail: "", contactPhone: "", notes: "" });
    setIsAddDialogOpen(false);
    toast.success("POF document added");
  };

  const handleDownload = (pof: POFDocument) => {
    toast.success(`Downloading "${pof.fileName}"...`);
  };

  const handleView = (pof: POFDocument) => {
    toast.info(`Opening "${pof.fileName}"...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Proof Of Funds</h2>
          <p className="text-muted-foreground">
            Manage your POF documents for transactions
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add POF
        </Button>
      </div>

      {/* Alerts Section */}
      {(expiredPofs.length > 0 || warningPofs.length > 0) && (
        <div className="space-y-3">
          {expiredPofs.length > 0 && (
            <Card className="p-4 border-destructive bg-destructive/5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive">
                    {expiredPofs.length} Expired POF Document{expiredPofs.length > 1 ? "s" : ""}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    These documents are no longer valid and cannot be used for transactions.
                    Request renewals from your lenders.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {expiredPofs.map((pof) => (
                      <Button
                        key={pof.id}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => handleRequestRenewal(pof)}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Renew {pof.lenderName}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {warningPofs.length > 0 && expiredPofs.length === 0 && (
            <Card className="p-4 border-warning bg-warning/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-warning">
                    {warningPofs.length} POF Document{warningPofs.length > 1 ? "s" : ""} Expiring Soon
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Consider requesting renewals before these documents expire.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Default POF Section */}
      {defaultPof && (
        <Card className="p-4 border-primary bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Star className="h-5 w-5 text-primary fill-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">Default POF</h4>
                {getStatusBadge(
                  getExpirationStatus(defaultPof.expirationDate),
                  differenceInDays(defaultPof.expirationDate, new Date())
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {defaultPof.lenderName} • {formatCurrency(defaultPof.amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Expires</p>
              <p className="text-sm text-muted-foreground">
                {format(defaultPof.expirationDate, "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{validPofs.length}</p>
              <p className="text-sm text-muted-foreground">Valid Documents</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{warningPofs.length}</p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(validPofs.reduce((sum, p) => sum + p.amount, 0))}
              </p>
              <p className="text-sm text-muted-foreground">Total Available</p>
            </div>
          </div>
        </Card>
      </div>

      {/* POF Documents List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">All Documents</h3>
        
        {pofs.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h4 className="font-medium text-foreground mb-2">No POF Documents</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first proof of funds document to get started.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add POF
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {pofs.map((pof) => {
              const status = getExpirationStatus(pof.expirationDate);
              const daysLeft = differenceInDays(pof.expirationDate, new Date());

              return (
                <Card
                  key={pof.id}
                  className={cn(
                    "p-4 transition-all hover:shadow-md",
                    status === "expired" && "opacity-75 bg-muted/30",
                    pof.isDefault && "ring-2 ring-primary/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-lg flex items-center justify-center",
                          status === "expired"
                            ? "bg-destructive/10"
                            : status === "critical"
                            ? "bg-destructive/10"
                            : status === "warning"
                            ? "bg-warning/10"
                            : "bg-success/10"
                        )}
                      >
                        <Landmark
                          className={cn(
                            "h-6 w-6",
                            status === "expired"
                              ? "text-destructive"
                              : status === "critical"
                              ? "text-destructive"
                              : status === "warning"
                              ? "text-warning"
                              : "text-success"
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">
                            {pof.lenderName}
                          </h4>
                          {pof.isDefault && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Default
                            </Badge>
                          )}
                          {getStatusBadge(status, daysLeft)}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-lg font-bold text-foreground">
                            {formatCurrency(pof.amount)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Expires: {format(pof.expirationDate, "MMM dd, yyyy")}
                          </span>
                          {pof.contactEmail && (
                            <span className="text-sm text-muted-foreground">
                              {pof.contactEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {status === "expired" || status === "critical" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 border-warning text-warning hover:bg-warning/10"
                          onClick={() => handleRequestRenewal(pof)}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Request Renewal
                        </Button>
                      ) : null}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-lg">
                          <DropdownMenuItem className="gap-2" onClick={() => handleView(pof)}>
                            <Eye className="h-4 w-4" />
                            View Document
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => handleDownload(pof)}>
                            <Download className="h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          {!pof.isDefault && status !== "expired" && (
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => handleSetDefault(pof.id)}
                            >
                              <Star className="h-4 w-4" />
                              Set As Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => handleRequestRenewal(pof)}
                          >
                            <RefreshCw className="h-4 w-4" />
                            Request Renewal
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleDelete(pof.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add POF Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Proof Of Funds</DialogTitle>
            <DialogDescription>
              Upload a new POF document from your lender.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lenderName">Lender Name *</Label>
              <Input
                id="lenderName"
                placeholder="e.g., First National Bank"
                value={newPof.lenderName}
                onChange={(e) => setNewPof({ ...newPof, lenderName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 500000"
                value={newPof.amount}
                onChange={(e) => setNewPof({ ...newPof, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date *</Label>
              <Input
                id="expirationDate"
                type="date"
                value={newPof.expirationDate}
                onChange={(e) => setNewPof({ ...newPof, expirationDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Lender Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="loans@lender.com"
                  value={newPof.contactEmail}
                  onChange={(e) => setNewPof({ ...newPof, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Lender Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="(555) 123-4567"
                  value={newPof.contactPhone}
                  onChange={(e) => setNewPof({ ...newPof, contactPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Any additional notes..."
                value={newPof.notes}
                onChange={(e) => setNewPof({ ...newPof, notes: e.target.value })}
              />
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag and drop your POF document here, or click to browse
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Choose File
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPof}>Add Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renewal Request Dialog */}
      <Dialog open={isRenewalDialogOpen} onOpenChange={setIsRenewalDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Request POF Renewal</DialogTitle>
            <DialogDescription>
              Send a renewal request to {selectedPof?.lenderName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center gap-3">
                <Landmark className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedPof?.lenderName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPof ? formatCurrency(selectedPof.amount) : ""} •{" "}
                    {selectedPof
                      ? getExpirationStatus(selectedPof.expirationDate) === "expired"
                        ? "Expired"
                        : `Expires ${format(selectedPof.expirationDate, "MMM dd, yyyy")}`
                      : ""}
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Label>Contact Method</Label>
              {selectedPof?.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success" />
                  Email: {selectedPof.contactEmail}
                </div>
              )}
              {selectedPof?.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success" />
                  Phone: {selectedPof.contactPhone}
                </div>
              )}
              {!selectedPof?.contactEmail && !selectedPof?.contactPhone && (
                <p className="text-sm text-muted-foreground">
                  No contact information available. Please contact your lender directly.
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-info/10 border border-info/20">
              <div className="flex gap-2">
                <Bell className="h-4 w-4 text-info mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-info">Automatic Reminder</p>
                  <p className="text-muted-foreground">
                    We'll remind you if we don't receive an updated POF within 7 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendRenewalRequest} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
