import * as React from "react";

import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  PenTool,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Mail,
  Download,
  Trash2,
  FileText,
  Users,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

type SignatureStatus = "draft" | "pending" | "signed" | "declined" | "expired";

interface SignatureRequest {
  id: string;
  documentName: string;
  recipientName: string;
  recipientEmail: string;
  status: SignatureStatus;
  createdAt: Date;
  sentAt?: Date;
  signedAt?: Date;
  expiresAt?: Date;
  propertyAddress?: string;
}

const mockRequests: SignatureRequest[] = [
  {
    id: "1",
    documentName: "Purchase Agreement - 123 Main St",
    recipientName: "John Smith",
    recipientEmail: "john.smith@email.com",
    status: "pending",
    createdAt: new Date("2024-01-20"),
    sentAt: new Date("2024-01-20"),
    expiresAt: new Date("2024-02-20"),
    propertyAddress: "123 Main St, Austin, TX",
  },
  {
    id: "2",
    documentName: "Assignment Contract - 456 Oak Ave",
    recipientName: "Sarah Johnson",
    recipientEmail: "sarah.j@email.com",
    status: "signed",
    createdAt: new Date("2024-01-18"),
    sentAt: new Date("2024-01-18"),
    signedAt: new Date("2024-01-19"),
    propertyAddress: "456 Oak Ave, Dallas, TX",
  },
  {
    id: "3",
    documentName: "Lead Paint Disclosure",
    recipientName: "Mike Williams",
    recipientEmail: "mike.w@email.com",
    status: "declined",
    createdAt: new Date("2024-01-15"),
    sentAt: new Date("2024-01-15"),
    propertyAddress: "789 Pine Rd, Houston, TX",
  },
  {
    id: "4",
    documentName: "Seller Financing Agreement",
    recipientName: "Emily Brown",
    recipientEmail: "emily.brown@email.com",
    status: "draft",
    createdAt: new Date("2024-01-22"),
  },
];

const statusConfig: Record<SignatureStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  signed: { label: "Signed", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  declined: { label: "Declined", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

export default function Signatures() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [requests, setRequests] = React.useState<SignatureRequest[]>(mockRequests);
  const [activeTab, setActiveTab] = React.useState("all");
  const [isNewRequestOpen, setIsNewRequestOpen] = React.useState(!!templateId);
  const [newRequest, setNewRequest] = React.useState({
    documentName: "",
    recipientName: "",
    recipientEmail: "",
    propertyAddress: "",
  });

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && req.status === activeTab;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    signed: requests.filter((r) => r.status === "signed").length,
    declined: requests.filter((r) => r.status === "declined").length,
  };

  const handleSendRequest = () => {
    if (!newRequest.documentName.trim() || !newRequest.recipientEmail.trim()) {
      toast.error("Please fill in required fields");
      return;
    }

    const request: SignatureRequest = {
      id: Date.now().toString(),
      documentName: newRequest.documentName,
      recipientName: newRequest.recipientName || "Unknown",
      recipientEmail: newRequest.recipientEmail,
      propertyAddress: newRequest.propertyAddress,
      status: "pending",
      createdAt: new Date(),
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    setRequests([request, ...requests]);
    setNewRequest({ documentName: "", recipientName: "", recipientEmail: "", propertyAddress: "" });
    setIsNewRequestOpen(false);
    toast.success("Signature request sent!");
  };

  const handleResend = (id: string) => {
    toast.success("Reminder sent to recipient");
  };

  const handleDelete = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
    toast.success("Request deleted");
  };

  return (
    <>
      <PageLayout>
        <PageHeader
          title="Digital Signatures"
          description="Send documents for electronic signature and track signing status"
        >
          <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Send for Signature</DialogTitle>
                <DialogDescription>
                  Send a document to a recipient for electronic signature.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="documentName">Document Name *</Label>
                  <Input
                    id="documentName"
                    placeholder="e.g., Purchase Agreement - 123 Main St"
                    value={newRequest.documentName}
                    onChange={(e) => setNewRequest({ ...newRequest, documentName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      placeholder="John Smith"
                      value={newRequest.recipientName}
                      onChange={(e) => setNewRequest({ ...newRequest, recipientName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipientEmail">Recipient Email *</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      placeholder="john@email.com"
                      value={newRequest.recipientEmail}
                      onChange={(e) => setNewRequest({ ...newRequest, recipientEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyAddress">Property Address (Optional)</Label>
                  <Input
                    id="propertyAddress"
                    placeholder="123 Main St, City, State"
                    value={newRequest.propertyAddress}
                    onChange={(e) => setNewRequest({ ...newRequest, propertyAddress: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendRequest} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-success">{stats.signed}</p>
            <p className="text-sm text-muted-foreground">Signed</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold text-destructive">{stats.declined}</p>
            <p className="text-sm text-muted-foreground">Declined</p>
          </Card>
        </div>

        {/* Tabs and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "signed", label: "Signed" },
              { value: "declined", label: "Declined" },
              { value: "draft", label: "Drafts" },
            ].map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={activeTab === tab.value ? "default" : "outline"}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const statusInfo = statusConfig[request.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={request.id} padding="md" className="group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <PenTool className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{request.documentName}</h3>
                      <Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {request.recipientName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {request.recipientEmail}
                      </span>
                      {request.propertyAddress && (
                        <span className="hidden md:flex items-center gap-1 truncate">
                          {request.propertyAddress}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground capitalize">
                      {request.signedAt
                        ? `Signed ${formatDistanceToNow(request.signedAt, { addSuffix: true })}`
                        : request.sentAt
                        ? `Sent ${formatDistanceToNow(request.sentAt, { addSuffix: true })}`
                        : `Created ${formatDistanceToNow(request.createdAt, { addSuffix: true })}`}
                    </p>
                    {request.expiresAt && request.status === "pending" && (
                      <p className="text-xs text-muted-foreground">
                        Expires {format(request.expiresAt, "MMM d")}
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Document
                      </DropdownMenuItem>
                      {request.status === "pending" && (
                        <DropdownMenuItem className="gap-2" onClick={() => handleResend(request.id)}>
                          <RefreshCw className="h-4 w-4" />
                          Send Reminder
                        </DropdownMenuItem>
                      )}
                      {request.status === "signed" && (
                        <DropdownMenuItem className="gap-2">
                          <Download className="h-4 w-4" />
                          Download Signed
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={() => handleDelete(request.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}

          {filteredRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PenTool className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-foreground mb-1">No Signature Requests</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Send your first document for signature"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsNewRequestOpen(true)} className="gap-2">
                  <Send className="h-4 w-4" />
                  New Request
                </Button>
              )}
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
}
