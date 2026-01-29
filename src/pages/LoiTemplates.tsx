import * as React from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FileText,
  DollarSign,
  Sparkles,
  Percent,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Star,
  Clock,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useLoiTemplates,
  useCreateLoiTemplate,
  useUpdateLoiTemplate,
  useDeleteLoiTemplate,
  DEFAULT_LOI_TEMPLATES,
  type LoiTemplate,
  type LoiType,
} from "@/hooks/useAcquireFlow";

const LOI_TYPE_LABELS: Record<LoiType, { label: string; icon: React.ElementType; color: string }> = {
  cash: { label: "Cash", icon: DollarSign, color: "text-success" },
  creative: { label: "Creative", icon: Sparkles, color: "text-purple-500" },
  hybrid: { label: "Hybrid", icon: Percent, color: "text-info" },
};

function TemplateCard({
  template,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  template: LoiTemplate;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const typeInfo = LOI_TYPE_LABELS[template.loi_type];
  const TypeIcon = typeInfo.icon;

  return (
    <Card variant="default" padding="md" className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-medium", `bg-${typeInfo.color.replace("text-", "")}/10`)}>
            <TypeIcon className={cn("h-4 w-4", typeInfo.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-content">{template.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" size="sm">{typeInfo.label}</Badge>
              {template.is_default && (
                <Badge variant="primary" size="sm" className="gap-1">
                  <Star className="h-3 w-3" />
                  Default
                </Badge>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {template.description && (
        <p className="text-small text-content-secondary mb-4">{template.description}</p>
      )}

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2 bg-surface-secondary rounded-medium">
          <p className="text-h4 font-semibold">{template.offer_percentage || 70}%</p>
          <p className="text-tiny text-content-tertiary">Offer %</p>
        </div>
        <div className="p-2 bg-surface-secondary rounded-medium">
          <p className="text-h4 font-semibold">{template.earnest_money_percentage || 1}%</p>
          <p className="text-tiny text-content-tertiary">EMD</p>
        </div>
        <div className="p-2 bg-surface-secondary rounded-medium">
          <p className="text-h4 font-semibold">{template.closing_days || 14}d</p>
          <p className="text-tiny text-content-tertiary">Close</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle text-tiny text-content-tertiary">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Used {template.use_count} times
        </span>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit Template
        </Button>
      </div>
    </Card>
  );
}

export default function LoiTemplates() {
  const { data: templates, isLoading } = useLoiTemplates();
  const createTemplate = useCreateLoiTemplate();
  const updateTemplate = useUpdateLoiTemplate();
  const deleteTemplate = useDeleteLoiTemplate();

  const [activeTab, setActiveTab] = React.useState<LoiType | "all">("all");
  const [editingTemplate, setEditingTemplate] = React.useState<LoiTemplate | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    loi_type: "cash" as LoiType,
    description: "",
    offer_percentage: 70,
    earnest_money_percentage: 1,
    closing_days: 14,
    down_payment_percentage: 10,
    interest_rate: 6,
    term_months: 360,
    balloon_months: 60,
    subject_line: "",
    body_html: "",
  });

  const filteredTemplates = React.useMemo(() => {
    if (!templates) return [];
    if (activeTab === "all") return templates;
    return templates.filter((t) => t.loi_type === activeTab);
  }, [templates, activeTab]);

  const handleCreate = () => {
    setFormData({
      name: "",
      loi_type: "cash",
      description: "",
      offer_percentage: 70,
      earnest_money_percentage: 1,
      closing_days: 14,
      down_payment_percentage: 10,
      interest_rate: 6,
      term_months: 360,
      balloon_months: 60,
      subject_line: "",
      body_html: "",
    });
    setIsCreating(true);
  };

  const handleEdit = (template: LoiTemplate) => {
    setFormData({
      name: template.name,
      loi_type: template.loi_type,
      description: template.description || "",
      offer_percentage: template.offer_percentage || 70,
      earnest_money_percentage: template.earnest_money_percentage || 1,
      closing_days: template.closing_days || 14,
      down_payment_percentage: template.down_payment_percentage || 10,
      interest_rate: template.interest_rate || 6,
      term_months: template.term_months || 360,
      balloon_months: template.balloon_months || 60,
      subject_line: template.subject_line || "",
      body_html: template.body_html || "",
    });
    setEditingTemplate(template);
  };

  const handleDuplicate = (template: LoiTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      loi_type: template.loi_type,
      description: template.description || "",
      offer_percentage: template.offer_percentage || 70,
      earnest_money_percentage: template.earnest_money_percentage || 1,
      closing_days: template.closing_days || 14,
      down_payment_percentage: template.down_payment_percentage || 10,
      interest_rate: template.interest_rate || 6,
      term_months: template.term_months || 360,
      balloon_months: template.balloon_months || 60,
      subject_line: template.subject_line || "",
      body_html: template.body_html || "",
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (editingTemplate) {
      await updateTemplate.mutateAsync({
        id: editingTemplate.id,
        updates: formData,
      });
      setEditingTemplate(null);
    } else {
      await createTemplate.mutateAsync({
        ...formData,
        is_default: false,
      });
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTemplate.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const isDialogOpen = isCreating || editingTemplate !== null;

  return (
    <PageLayout>
      <PageHeader
        title="LOI Templates"
        description="Manage Letter of Intent templates for Cash, Creative, and Hybrid offers"
        actions={
          <Button variant="primary" icon={<Plus />} onClick={handleCreate}>
            New Template
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LoiType | "all")}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="cash" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Cash
          </TabsTrigger>
          <TabsTrigger value="creative" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Creative
          </TabsTrigger>
          <TabsTrigger value="hybrid" className="gap-2">
            <Percent className="h-4 w-4" />
            Hybrid
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} variant="default" padding="md">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-20" />
                </Card>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card variant="default" padding="lg" className="text-center">
              <FileText className="h-12 w-12 text-content-tertiary mx-auto mb-4" />
              <h3 className="text-h3 font-medium mb-2">No templates yet</h3>
              <p className="text-content-secondary mb-4">
                Create your first LOI template to get started
              </p>
              <Button variant="primary" icon={<Plus />} onClick={handleCreate}>
                Create Template
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => handleEdit(template)}
                  onDuplicate={() => handleDuplicate(template)}
                  onDelete={() => setDeleteId(template.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setEditingTemplate(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              Configure your LOI template with offer terms and messaging
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Cash Offer"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Offer Type</Label>
                <Select
                  value={formData.loi_type}
                  onValueChange={(v) => setFormData({ ...formData, loi_type: v as LoiType })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="creative">Creative / Seller Financing</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this template..."
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Offer %</Label>
                <Input
                  type="number"
                  value={formData.offer_percentage}
                  onChange={(e) => setFormData({ ...formData, offer_percentage: Number(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Earnest Money %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.earnest_money_percentage}
                  onChange={(e) => setFormData({ ...formData, earnest_money_percentage: Number(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Closing Days</Label>
                <Input
                  type="number"
                  value={formData.closing_days}
                  onChange={(e) => setFormData({ ...formData, closing_days: Number(e.target.value) })}
                  className="mt-2"
                />
              </div>
            </div>

            {formData.loi_type !== "cash" && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Down Payment %</Label>
                  <Input
                    type="number"
                    value={formData.down_payment_percentage}
                    onChange={(e) => setFormData({ ...formData, down_payment_percentage: Number(e.target.value) })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Interest Rate %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: Number(e.target.value) })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Term (months)</Label>
                  <Input
                    type="number"
                    value={formData.term_months}
                    onChange={(e) => setFormData({ ...formData, term_months: Number(e.target.value) })}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Email Subject Line</Label>
              <Input
                value={formData.subject_line}
                onChange={(e) => setFormData({ ...formData, subject_line: e.target.value })}
                placeholder="e.g., Cash Offer for {{property_address}}"
                className="mt-2"
              />
              <p className="text-tiny text-content-tertiary mt-1">
                Use {"{{property_address}}"}, {"{{offer_amount}}"}, {"{{contact_name}}"} for dynamic values
              </p>
            </div>

            <div>
              <Label>Email Body (HTML)</Label>
              <Textarea
                value={formData.body_html}
                onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                placeholder="<p>Dear {{contact_name}},</p>..."
                className="mt-2 min-h-40 font-mono text-small"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => {
              setIsCreating(false);
              setEditingTemplate(null);
            }}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!formData.name || createTemplate.isPending || updateTemplate.isPending}
            >
              {editingTemplate ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
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
    </PageLayout>
  );
}
