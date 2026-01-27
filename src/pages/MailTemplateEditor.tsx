import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateMailTemplate } from "@/hooks/useMailCampaigns";
import { ArrowLeft, Save, Eye, Code } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const TEMPLATE_TYPES = [
  { value: "postcard_4x6", label: "4×6 Postcard", description: "Standard postcard size" },
  { value: "postcard_6x9", label: "6×9 Postcard", description: "Large postcard" },
  { value: "postcard_6x11", label: "6×11 Postcard", description: "Jumbo postcard" },
  { value: "letter", label: "Letter", description: "Standard letter format" },
  { value: "yellow_letter", label: "Yellow Letter", description: "Handwritten style letter" },
];

const MERGE_FIELDS = [
  { field: "{owner_name}", label: "Owner Name" },
  { field: "{property_address}", label: "Property Address" },
  { field: "{property_city}", label: "City" },
  { field: "{property_state}", label: "State" },
  { field: "{property_zip}", label: "ZIP Code" },
  { field: "{your_name}", label: "Your Name" },
  { field: "{your_phone}", label: "Your Phone" },
  { field: "{your_company}", label: "Your Company" },
  { field: "{offer_amount}", label: "Offer Amount" },
  { field: "{current_date}", label: "Current Date" },
];

export default function MailTemplateEditor() {
  const navigate = useNavigate();
  const createTemplate = useCreateMailTemplate();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState("postcard_6x9");
  const [frontHtml, setFrontHtml] = React.useState(DEFAULT_FRONT_HTML);
  const [backHtml, setBackHtml] = React.useState(DEFAULT_BACK_HTML);
  const [activeTab, setActiveTab] = React.useState("front");

  const isLetter = type === "letter" || type === "yellow_letter";

  const handleSave = async () => {
    if (!name.trim()) return;

    await createTemplate.mutateAsync({
      name,
      description,
      type,
      front_html: frontHtml,
      back_html: isLetter ? null : backHtml,
      merge_fields: MERGE_FIELDS.map(m => m.field),
    });

    navigate("/mail/templates");
  };

  const insertMergeField = (field: string) => {
    const textarea = document.activeElement as HTMLTextAreaElement;
    if (textarea && (textarea.id === "front-html" || textarea.id === "back-html")) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + field + value.substring(end);
      
      if (textarea.id === "front-html") {
        setFrontHtml(newValue);
      } else {
        setBackHtml(newValue);
      }
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Create Template"
        description="Design a new mail template"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/mail/templates")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={!name.trim() || createTemplate.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {createTemplate.isPending ? "Saving..." : "Save Template"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Motivated Seller Postcard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this template..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={type} onValueChange={setType}>
                {TEMPLATE_TYPES.map((t) => (
                  <div key={t.value} className="flex items-start space-x-3 py-2">
                    <RadioGroupItem value={t.value} id={t.value} />
                    <Label htmlFor={t.value} className="cursor-pointer">
                      <span className="font-medium">{t.label}</span>
                      <p className="text-tiny text-content-tertiary">{t.description}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Merge Fields</CardTitle>
              <CardDescription>Click to insert into your template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {MERGE_FIELDS.map((m) => (
                  <Badge
                    key={m.field}
                    variant="outline"
                    className="cursor-pointer hover:bg-brand/10"
                    onClick={() => insertMergeField(m.field)}
                  >
                    {m.field}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Template Editor</CardTitle>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="front">
                      {isLetter ? "Content" : "Front"}
                    </TabsTrigger>
                    {!isLetter && <TabsTrigger value="back">Back</TabsTrigger>}
                    <TabsTrigger value="preview">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "front" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-tiny text-content-tertiary">
                    <Code className="h-4 w-4" />
                    <span>HTML supported. Use merge fields for personalization.</span>
                  </div>
                  <Textarea
                    id="front-html"
                    value={frontHtml}
                    onChange={(e) => setFrontHtml(e.target.value)}
                    className="font-mono text-small min-h-[400px]"
                    placeholder="Enter HTML content..."
                  />
                </div>
              )}

              {activeTab === "back" && !isLetter && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-tiny text-content-tertiary">
                    <Code className="h-4 w-4" />
                    <span>Back side content. Include call-to-action and contact info.</span>
                  </div>
                  <Textarea
                    id="back-html"
                    value={backHtml}
                    onChange={(e) => setBackHtml(e.target.value)}
                    className="font-mono text-small min-h-[400px]"
                    placeholder="Enter HTML content..."
                  />
                </div>
              )}

              {activeTab === "preview" && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b text-tiny font-medium">
                    Preview ({isLetter ? "Letter" : "Front"})
                  </div>
                  <div 
                    className="p-4 min-h-[400px] bg-white"
                    dangerouslySetInnerHTML={{ __html: frontHtml }}
                  />
                  {!isLetter && (
                    <>
                      <div className="bg-muted/50 px-4 py-2 border-t border-b text-tiny font-medium">
                        Preview (Back)
                      </div>
                      <div 
                        className="p-4 min-h-[300px] bg-white"
                        dangerouslySetInnerHTML={{ __html: backHtml }}
                      />
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

const DEFAULT_FRONT_HTML = `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h1 style="color: #2563eb; margin-bottom: 16px;">
    We Want to Buy Your Property!
  </h1>
  <p style="font-size: 16px; line-height: 1.6; color: #374151;">
    Dear {owner_name},
  </p>
  <p style="font-size: 16px; line-height: 1.6; color: #374151;">
    We're interested in purchasing your property at:
  </p>
  <p style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 16px 0;">
    {property_address}<br/>
    {property_city}, {property_state} {property_zip}
  </p>
  <p style="font-size: 16px; line-height: 1.6; color: #374151;">
    We buy properties in any condition and can close quickly with cash.
    No repairs needed, no realtor fees, no hassle.
  </p>
</div>`;

const DEFAULT_BACK_HTML = `<div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
  <h2 style="color: #2563eb; margin-bottom: 24px;">
    Get Your Cash Offer Today!
  </h2>
  <p style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 16px;">
    Call: {your_phone}
  </p>
  <p style="font-size: 16px; color: #6b7280;">
    {your_company}
  </p>
  <div style="margin-top: 32px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
    <p style="font-size: 14px; color: #374151; margin: 0;">
      ✓ Fast Cash Closing<br/>
      ✓ No Repairs Needed<br/>
      ✓ No Realtor Fees<br/>
      ✓ We Pay All Closing Costs
    </p>
  </div>
</div>`;
