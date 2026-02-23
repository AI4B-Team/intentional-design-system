import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Send,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Layers,
  Upload,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SignatureTemplate, mockTemplates } from "@/types/signature-templates";

interface BulkRecipient {
  id: string;
  name: string;
  email: string;
  propertyAddress?: string;
  dealId?: string;
  selected: boolean;
}

interface BulkSendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (template: SignatureTemplate, recipients: BulkRecipient[]) => void;
}

// Mock recipients from pipeline
const mockPipelineRecipients: BulkRecipient[] = [
  { id: "br1", name: "John Smith", email: "john.smith@email.com", propertyAddress: "123 Main St, Austin, TX", dealId: "d1", selected: false },
  { id: "br2", name: "Sarah Johnson", email: "sarah.j@email.com", propertyAddress: "456 Oak Ave, Dallas, TX", dealId: "d2", selected: false },
  { id: "br3", name: "Mike Williams", email: "mike.w@email.com", propertyAddress: "789 Pine Rd, Houston, TX", dealId: "d3", selected: false },
  { id: "br4", name: "Emily Brown", email: "emily.brown@email.com", propertyAddress: "321 Elm St, San Antonio, TX", dealId: "d4", selected: false },
  { id: "br5", name: "David Lee", email: "david.lee@email.com", propertyAddress: "555 Cedar Ln, Fort Worth, TX", dealId: "d5", selected: false },
];

type BulkStep = "recipients" | "template" | "review";

export function BulkSendDialog({ isOpen, onClose, onSend }: BulkSendDialogProps) {
  const [step, setStep] = React.useState<BulkStep>("recipients");
  const [recipients, setRecipients] = React.useState<BulkRecipient[]>(mockPipelineRecipients);
  const [search, setSearch] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState<SignatureTemplate | null>(null);
  const [source, setSource] = React.useState<"pipeline" | "manual">("pipeline");

  const selectedCount = recipients.filter((r) => r.selected).length;

  const filtered = recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      (r.propertyAddress?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const toggleAll = () => {
    const allSelected = filtered.every((r) => r.selected);
    setRecipients((prev) =>
      prev.map((r) => (filtered.find((f) => f.id === r.id) ? { ...r, selected: !allSelected } : r))
    );
  };

  const toggleOne = (id: string) => {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));
  };

  const handleSend = () => {
    if (!selectedTemplate) return;
    const selected = recipients.filter((r) => r.selected);
    onSend(selectedTemplate, selected);
    handleClose();
  };

  const handleClose = () => {
    setStep("recipients");
    setRecipients(mockPipelineRecipients);
    setSearch("");
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[750px]">
        {/* Step: Select Recipients */}
        {step === "recipients" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand" />
                Bulk Send — Select Recipients
              </DialogTitle>
              <DialogDescription>
                Choose recipients from your pipeline or add manually.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="sm" variant="outline" onClick={toggleAll} className="whitespace-nowrap">
                {filtered.every((r) => r.selected) ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {filtered.map((recipient) => (
                <div
                  key={recipient.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors",
                    recipient.selected
                      ? "border-brand/30 bg-brand/5"
                      : "border-border-subtle hover:border-muted-foreground/30"
                  )}
                  onClick={() => toggleOne(recipient.id)}
                >
                  <Checkbox checked={recipient.selected} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{recipient.name}</p>
                    <p className="text-xs text-muted-foreground">{recipient.email}</p>
                  </div>
                  {recipient.propertyAddress && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[200px]">
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      {recipient.propertyAddress}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={() => setStep("template")}
                disabled={selectedCount === 0}
                className="gap-2"
              >
                {selectedCount} Selected — Choose Template
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step: Choose Template */}
        {step === "template" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep("recipients")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>Choose Template for {selectedCount} Recipients</DialogTitle>
                  <DialogDescription>Select a template to send to all recipients.</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto py-2">
              {mockTemplates.filter((t) => t.isActive).map((template) => (
                <Card
                  key={template.id}
                  padding="md"
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedTemplate?.id === template.id
                      ? "ring-2 ring-brand shadow-md"
                      : "hover:shadow-md"
                  )}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground truncate">{template.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Layers className="h-3 w-3" />
                    {template.variables.length} fields
                    {template.completionRate && (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-3 w-3" />
                        {template.completionRate}%
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("recipients")}>Back</Button>
              <Button
                onClick={() => setStep("review")}
                disabled={!selectedTemplate}
                className="gap-2"
              >
                Review & Send
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step: Review & Send */}
        {step === "review" && selectedTemplate && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep("template")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>Review Bulk Send</DialogTitle>
                  <DialogDescription>Confirm details before sending.</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <Card padding="md" className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedCount}</p>
                  <p className="text-xs text-muted-foreground">Recipients</p>
                </Card>
                <Card padding="md" className="text-center">
                  <p className="text-sm font-semibold text-foreground">{selectedTemplate.name}</p>
                  <p className="text-xs text-muted-foreground">Template</p>
                </Card>
              </div>

              {/* Recipients list */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Recipients</Label>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {recipients.filter((r) => r.selected).map((r) => (
                    <div key={r.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary text-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                      <span className="font-medium text-foreground">{r.name}</span>
                      <span className="text-muted-foreground">{r.email}</span>
                      {r.propertyAddress && (
                        <span className="text-xs text-muted-foreground ml-auto truncate max-w-[180px]">
                          {r.propertyAddress}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="rounded-lg border border-warning/20 bg-warning/5 px-3 py-2 text-xs text-warning">
                Each recipient will receive a personalized copy with their deal data auto-filled.
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("template")}>Back</Button>
              <Button onClick={handleSend} className="gap-2">
                <Send className="h-4 w-4" />
                Send to {selectedCount} Recipients
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
