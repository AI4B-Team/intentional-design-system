import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  useMailTemplate, 
  useCreateMailTemplate, 
  useUpdateMailTemplate 
} from "@/hooks/useMailCampaigns";
import { RichTextEditor, TemplatePreview } from "@/components/mail/template-editor";
import { DEFAULT_TEMPLATES } from "@/lib/default-templates";
import { 
  ArrowLeft, 
  Save, 
  ChevronDown,
  Settings,
  Send,
} from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_TYPES = [
  { value: "postcard_4x6", label: "Postcard 4×6", dimensions: '4" × 6"' },
  { value: "postcard_6x9", label: "Postcard 6×9", dimensions: '6" × 9"' },
  { value: "postcard_6x11", label: "Postcard 6×11", dimensions: '6" × 11"' },
  { value: "letter", label: "Letter", dimensions: '8.5" × 11"' },
  { value: "yellow_letter", label: "Yellow Letter", dimensions: '8.5" × 11"' },
];

const MERGE_FIELDS = [
  "{owner_name}",
  "{owner_first_name}",
  "{property_address}",
  "{property_street}",
  "{property_city}",
  "{property_state}",
  "{property_zip}",
  "{your_name}",
  "{your_company}",
  "{your_phone}",
  "{tracking_phone}",
  "{offer_amount}",
  "{current_date}",
];

export default function MailTemplateEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== "new";
  
  const { data: existingTemplate, isLoading } = useMailTemplate(isEditing ? id : undefined);
  const createTemplate = useCreateMailTemplate();
  const updateTemplate = useUpdateMailTemplate();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState("postcard_6x9");
  const [frontHtml, setFrontHtml] = React.useState("");
  const [backHtml, setBackHtml] = React.useState("");
  const [activeEditorTab, setActiveEditorTab] = React.useState<"front" | "back">("front");
  const [settingsOpen, setSettingsOpen] = React.useState(true);

  // Load existing template data
  React.useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name);
      setDescription(existingTemplate.description || "");
      setType(existingTemplate.type);
      setFrontHtml(existingTemplate.front_html || "");
      setBackHtml(existingTemplate.back_html || "");
    }
  }, [existingTemplate]);

  // Set default content for new templates
  React.useEffect(() => {
    if (!isEditing && !frontHtml) {
      const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.type === type);
      if (defaultTemplate) {
        setFrontHtml(defaultTemplate.front_html);
        setBackHtml(defaultTemplate.back_html || "");
      } else {
        setFrontHtml(getDefaultContent(type, "front"));
        setBackHtml(getDefaultContent(type, "back"));
      }
    }
  }, [type, isEditing, frontHtml]);

  const isLetter = type === "letter" || type === "yellow_letter";
  const isYellowLetter = type === "yellow_letter";

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (!frontHtml.trim()) {
      toast.error("Template content cannot be empty");
      return;
    }

    try {
      if (isEditing) {
        await updateTemplate.mutateAsync({
          id,
          name,
          description,
          type,
          front_html: frontHtml,
          back_html: isLetter ? null : backHtml,
          merge_fields: MERGE_FIELDS,
        });
      } else {
        await createTemplate.mutateAsync({
          name,
          description,
          type,
          front_html: frontHtml,
          back_html: isLetter ? null : backHtml,
          merge_fields: MERGE_FIELDS,
        });
      }
      navigate("/mail/templates");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSaveAsNew = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: `${name} (Copy)`,
        description,
        type,
        front_html: frontHtml,
        back_html: isLetter ? null : backHtml,
        merge_fields: MERGE_FIELDS,
      });
      navigate("/mail/templates");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  if (isLoading && isEditing) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={isEditing ? "Edit Template" : "Create Template"}
        description="Design your direct mail template"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/mail/templates")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            {isEditing && (
              <Button variant="secondary" onClick={handleSaveAsNew} disabled={isSaving}>
                Save as New
              </Button>
            )}
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={!name.trim() || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column - Editor (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Settings Section */}
          <Card>
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-content-tertiary" />
                      <CardTitle>Settings</CardTitle>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Motivated Seller Postcard"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Template Type</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              <div className="flex items-center justify-between w-full">
                                <span>{t.label}</span>
                                <span className="text-content-tertiary text-xs ml-2">({t.dimensions})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this template..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Design Canvas */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Design Canvas</CardTitle>
                {!isLetter && (
                  <Tabs value={activeEditorTab} onValueChange={(v) => setActiveEditorTab(v as "front" | "back")}>
                    <TabsList>
                      <TabsTrigger value="front">Front</TabsTrigger>
                      <TabsTrigger value="back">Back</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>
              <CardDescription>
                {isLetter 
                  ? "Design your letter content. Use merge fields for personalization."
                  : `Design the ${activeEditorTab} of your postcard.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(activeEditorTab === "front" || isLetter) && (
                <RichTextEditor
                  content={frontHtml}
                  onChange={setFrontHtml}
                  placeholder={isLetter ? "Start writing your letter..." : "Design the front of your postcard..."}
                  isYellowLetter={isYellowLetter}
                />
              )}
              
              {activeEditorTab === "back" && !isLetter && (
                <div className="space-y-4">
                  <RichTextEditor
                    content={backHtml}
                    onChange={setBackHtml}
                    placeholder="Design the back of your postcard..."
                  />
                  
                  {/* Address Block Notice */}
                  <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
                    <p className="text-tiny text-content-secondary">
                      <strong>Note:</strong> The back of your postcard must include space for the recipient address. 
                      Lob will automatically place the address block in the required position.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview (40%) */}
        <div className="lg:col-span-2 space-y-6">
          <TemplatePreview
            type={type}
            frontHtml={frontHtml}
            backHtml={backHtml}
            className="sticky top-6"
          />
          
          {/* Send Test Print */}
          <Card>
            <CardContent className="pt-6">
              <Button variant="secondary" className="w-full" disabled>
                <Send className="h-4 w-4 mr-2" />
                Send Test Print ($1.50)
              </Button>
              <p className="text-tiny text-content-tertiary mt-2 text-center">
                Receive a real printed sample at your address
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

function getDefaultContent(type: string, side: "front" | "back"): string {
  if (type === "yellow_letter") {
    return `<div style="background: #FFF9C4; padding: 40px; font-family: 'Caveat', cursive;">
  <p style="font-size: 24px; line-height: 2; color: #1565C0;">
    Dear {owner_name},
  </p>
  <p style="font-size: 22px; line-height: 2; color: #1565C0; margin-top: 20px;">
    I'm interested in buying your house at {property_address}. Please call me at {your_phone}.
  </p>
  <p style="font-size: 24px; line-height: 2; color: #1565C0; margin-top: 40px;">
    Thanks,<br/>
    {your_name}
  </p>
</div>`;
  }
  
  if (type === "letter") {
    return `<div style="font-family: Georgia, serif; padding: 60px; max-width: 600px;">
  <p style="font-size: 16px; line-height: 1.8; color: #374151;">
    Dear {owner_name},
  </p>
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 20px;">
    I am writing to express my interest in purchasing your property at {property_address}.
  </p>
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 20px;">
    Please contact me at your earliest convenience.
  </p>
  <p style="font-size: 16px; line-height: 1.8; color: #374151; margin-top: 40px;">
    Sincerely,<br/><br/>
    {your_name}<br/>
    {your_phone}
  </p>
</div>`;
  }
  
  if (side === "front") {
    return `<div style="padding: 30px; text-align: center; font-family: Arial, sans-serif;">
  <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 20px;">
    We Buy Houses Cash!
  </h1>
  <p style="font-size: 16px; color: #374151;">
    Any condition. Fast closing. No fees.
  </p>
</div>`;
  }
  
  return `<div style="padding: 25px; font-family: Arial, sans-serif;">
  <p style="font-size: 16px; font-weight: bold; color: #1f2937; text-align: center; margin-bottom: 20px;">
    Call: {your_phone}
  </p>
  <p style="font-size: 14px; color: #374151;">
    Dear {owner_name},<br/><br/>
    We're interested in your property at {property_address}.
  </p>
  <p style="font-size: 12px; color: #6b7280; margin-top: 20px; text-align: center;">
    {your_company}
  </p>
</div>`;
}
