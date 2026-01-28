import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  RefreshCw,
  Check,
  Save,
  Rocket,
  Upload,
  Plus,
  GripVertical,
  Trash2,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSellerWebsite, useUpdateWebsite, usePublishWebsite } from "@/hooks/useSellerWebsites";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface ValueProp {
  icon: string;
  title: string;
  description: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  location: string;
  quote: string;
  rating: number;
  image_url?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const ICON_OPTIONS = [
  { value: "clock", label: "Clock" },
  { value: "dollar", label: "Dollar" },
  { value: "tool", label: "Tool" },
  { value: "x", label: "X/No" },
  { value: "home", label: "Home" },
  { value: "check", label: "Check" },
  { value: "shield", label: "Shield" },
];

const FORM_FIELD_OPTIONS = [
  { id: "name", label: "Name" },
  { id: "phone", label: "Phone" },
  { id: "email", label: "Email" },
  { id: "condition", label: "Property Condition" },
  { id: "timeline", label: "Selling Timeline" },
  { id: "reason", label: "Reason for Selling" },
  { id: "property_type", label: "Property Type" },
  { id: "beds_baths", label: "Beds/Baths" },
  { id: "notes", label: "Additional Notes" },
  { id: "how_heard", label: "How Did You Hear" },
];

export default function SellerWebsiteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: website, isLoading } = useSellerWebsite(id);
  const updateWebsite = useUpdateWebsite();
  const publishWebsite = usePublishWebsite();

  const [activeTab, setActiveTab] = useState("content");
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [previewKey, setPreviewKey] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    company_name: "",
    company_phone: "",
    company_email: "",
    primary_color: "#2563EB",
    secondary_color: "#1E40AF",
    accent_color: "#10B981",
    hero_headline: "",
    hero_subheadline: "",
    hero_image_url: "",
    about_headline: "",
    about_content: "",
    meta_title: "",
    meta_description: "",
    form_submit_text: "",
    form_fields: [] as string[],
    lead_notification_email: "",
    lead_notification_sms: "",
    auto_respond_email: true,
    auto_respond_sms: false,
    google_analytics_id: "",
    facebook_pixel_id: "",
    custom_domain: "",
  });

  const [valueProps, setValueProps] = useState<ValueProp[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  // Initialize form data from website
  useEffect(() => {
    if (website) {
      setFormData({
        name: website.name || "",
        slug: website.slug || "",
        company_name: website.company_name || "",
        company_phone: website.company_phone || "",
        company_email: website.company_email || "",
        primary_color: website.primary_color || "#2563EB",
        secondary_color: website.secondary_color || "#1E40AF",
        accent_color: website.accent_color || "#10B981",
        hero_headline: website.hero_headline || "",
        hero_subheadline: website.hero_subheadline || "",
        hero_image_url: website.hero_image_url || "",
        about_headline: website.about_headline || "",
        about_content: website.about_content || "",
        meta_title: website.meta_title || "",
        meta_description: website.meta_description || "",
        form_submit_text: website.form_submit_text || "Get My Cash Offer",
        form_fields: Array.isArray(website.form_fields) 
          ? website.form_fields as string[]
          : typeof website.form_fields === 'string'
            ? JSON.parse(website.form_fields)
            : [],
        lead_notification_email: website.lead_notification_email || "",
        lead_notification_sms: website.lead_notification_sms || "",
        auto_respond_email: website.auto_respond_email ?? true,
        auto_respond_sms: website.auto_respond_sms ?? false,
        google_analytics_id: website.google_analytics_id || "",
        facebook_pixel_id: website.facebook_pixel_id || "",
        custom_domain: website.custom_domain || "",
      });

      setValueProps(
        Array.isArray(website.value_props)
          ? (website.value_props as unknown as ValueProp[])
          : []
      );
      setProcessSteps(
        Array.isArray(website.process_steps)
          ? (website.process_steps as unknown as ProcessStep[])
          : []
      );
      setTestimonials(
        Array.isArray(website.testimonials)
          ? (website.testimonials as unknown as Testimonial[])
          : []
      );
      setFaqs(
        Array.isArray(website.faqs)
          ? (website.faqs as unknown as FAQ[])
          : []
      );
    }
  }, [website]);

  // Debounced save
  const saveChanges = useCallback(async () => {
    if (!id) return;
    setSaveStatus("saving");

    try {
      await updateWebsite.mutateAsync({
        id,
        data: {
          ...formData,
          value_props: valueProps as unknown as Json,
          process_steps: processSteps as unknown as Json,
          testimonials: testimonials as unknown as Json,
          faqs: faqs as unknown as Json,
        } as any,
      });
      setSaveStatus("saved");
      setPreviewKey((k) => k + 1);
    } catch {
      setSaveStatus("unsaved");
    }
  }, [id, formData, valueProps, processSteps, testimonials, faqs, updateWebsite]);

  // Mark as unsaved when data changes
  useEffect(() => {
    if (website) {
      setSaveStatus("unsaved");
    }
  }, [formData, valueProps, processSteps, testimonials, faqs]);

  const handlePublish = async () => {
    if (!id) return;
    await saveChanges();
    publishWebsite.mutate(id);
  };

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFormField = (fieldId: string) => {
    setFormData((prev) => ({
      ...prev,
      form_fields: prev.form_fields.includes(fieldId)
        ? prev.form_fields.filter((f) => f !== fieldId)
        : [...prev.form_fields, fieldId],
    }));
  };

  // Value Props handlers
  const addValueProp = () => {
    setValueProps([
      ...valueProps,
      { icon: "check", title: "New Value", description: "Description here" },
    ]);
  };

  const updateValueProp = (index: number, updates: Partial<ValueProp>) => {
    setValueProps((prev) =>
      prev.map((vp, i) => (i === index ? { ...vp, ...updates } : vp))
    );
  };

  const removeValueProp = (index: number) => {
    setValueProps((prev) => prev.filter((_, i) => i !== index));
  };

  // Testimonial handlers
  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      { name: "", location: "", quote: "", rating: 5 },
    ]);
  };

  const updateTestimonial = (index: number, updates: Partial<Testimonial>) => {
    setTestimonials((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...updates } : t))
    );
  };

  const removeTestimonial = (index: number) => {
    setTestimonials((prev) => prev.filter((_, i) => i !== index));
  };

  // FAQ handlers
  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, updates: Partial<FAQ>) => {
    setFaqs((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const removeFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex gap-6">
          <Skeleton className="w-[40%] h-[600px]" />
          <Skeleton className="flex-1 h-[600px]" />
        </div>
      </PageLayout>
    );
  }

  if (!website) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-content-secondary">Website not found</p>
          <Button variant="secondary" onClick={() => navigate("/websites")} className="mt-4">
            Back to Websites
          </Button>
        </div>
      </PageLayout>
    );
  }

  const getDeviceWidth = () => {
    switch (device) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  return (
    <PageLayout fullWidth>
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate("/websites")}
          >
            Back
          </Button>
          <div>
            <h1 className="text-h3 font-semibold">{website.name}</h1>
            <p className="text-small text-content-secondary">/s/{website.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-small",
              saveStatus === "saved"
                ? "text-success"
                : saveStatus === "saving"
                ? "text-content-secondary"
                : "text-warning"
            )}
          >
            {saveStatus === "saved" && <Check className="inline h-4 w-4 mr-1" />}
            {saveStatus === "saving" && <Spinner size="sm" className="inline mr-1" />}
            {saveStatus === "saved"
              ? "Saved"
              : saveStatus === "saving"
              ? "Saving..."
              : "Unsaved changes"}
          </span>

          <Button variant="secondary" size="sm" onClick={saveChanges} disabled={saveStatus === "saving"}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Button variant="secondary" size="sm" onClick={() => window.open(`/s/${website.slug}`, "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview
          </Button>

          {website.status === "published" ? (
            <Badge variant="success">Published</Badge>
          ) : (
            <Button variant="primary" size="sm" onClick={handlePublish}>
              <Rocket className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex gap-6 px-4 h-[calc(100vh-180px)]">
        {/* Settings Panel */}
        <div className="w-[400px] flex-shrink-0 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
              <TabsTrigger value="form" className="flex-1">Form</TabsTrigger>
              <TabsTrigger value="seo" className="flex-1">SEO</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label htmlFor="hero_headline">Headline</Label>
                    <Input
                      id="hero_headline"
                      value={formData.hero_headline}
                      onChange={(e) => updateField("hero_headline", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero_subheadline">Subheadline</Label>
                    <Textarea
                      id="hero_subheadline"
                      value={formData.hero_subheadline}
                      onChange={(e) => updateField("hero_subheadline", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Hero Image</Label>
                    <div className="mt-2 border-2 border-dashed border-border rounded-medium p-4 text-center">
                      <Upload className="h-6 w-6 mx-auto text-content-tertiary mb-1" />
                      <p className="text-tiny text-content-secondary">Upload image</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Value Props */}
              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-body">Value Propositions</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addValueProp}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  {valueProps.map((vp, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-surface-secondary rounded-medium"
                    >
                      <GripVertical className="h-4 w-4 text-content-tertiary mt-2 cursor-grab" />
                      <div className="flex-1 space-y-2">
                        <select
                          value={vp.icon}
                          onChange={(e) => updateValueProp(index, { icon: e.target.value })}
                          className="w-full p-2 rounded border border-border text-small"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <Input
                          value={vp.title}
                          onChange={(e) => updateValueProp(index, { title: e.target.value })}
                          placeholder="Title"
                        />
                        <Input
                          value={vp.description}
                          onChange={(e) => updateValueProp(index, { description: e.target.value })}
                          placeholder="Description"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeValueProp(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Testimonials */}
              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-body">Testimonials</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addTestimonial}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  {testimonials.length === 0 ? (
                    <p className="text-small text-content-secondary text-center py-4">
                      No testimonials yet
                    </p>
                  ) : (
                    testimonials.map((t, index) => (
                      <div
                        key={index}
                        className="p-3 bg-surface-secondary rounded-medium space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Input
                            value={t.name}
                            onChange={(e) => updateTestimonial(index, { name: e.target.value })}
                            placeholder="Name"
                            className="flex-1 mr-2"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTestimonial(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={t.location}
                          onChange={(e) => updateTestimonial(index, { location: e.target.value })}
                          placeholder="Location (e.g., Austin, TX)"
                        />
                        <Textarea
                          value={t.quote}
                          onChange={(e) => updateTestimonial(index, { quote: e.target.value })}
                          placeholder="Their quote..."
                          rows={2}
                        />
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => updateTestimonial(index, { rating: star })}
                              className={cn(
                                "text-lg",
                                star <= t.rating ? "text-warning" : "text-content-tertiary"
                              )}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* FAQs */}
              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-body">FAQs</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addFaq}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  {faqs.length === 0 ? (
                    <p className="text-small text-content-secondary text-center py-4">
                      No FAQs yet
                    </p>
                  ) : (
                    faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="p-3 bg-surface-secondary rounded-medium space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-content-tertiary mt-2 cursor-grab" />
                          <div className="flex-1 space-y-2">
                            <Input
                              value={faq.question}
                              onChange={(e) => updateFaq(index, { question: e.target.value })}
                              placeholder="Question"
                            />
                            <Textarea
                              value={faq.answer}
                              onChange={(e) => updateFaq(index, { answer: e.target.value })}
                              placeholder="Answer"
                              rows={2}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFaq(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* About Section */}
              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">About Section</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label htmlFor="about_headline">Headline</Label>
                    <Input
                      id="about_headline"
                      value={formData.about_headline}
                      onChange={(e) => updateField("about_headline", e.target.value)}
                      placeholder="Why Sell To Us?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="about_content">Content</Label>
                    <Textarea
                      id="about_content"
                      value={formData.about_content}
                      onChange={(e) => updateField("about_content", e.target.value)}
                      placeholder="Tell sellers about your company..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design" className="space-y-6">
              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">Colors</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => updateField("primary_color", e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        id="primary_color"
                        value={formData.primary_color}
                        onChange={(e) => updateField("primary_color", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => updateField("secondary_color", e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        id="secondary_color"
                        value={formData.secondary_color}
                        onChange={(e) => updateField("secondary_color", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accent_color">Accent Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) => updateField("accent_color", e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        id="accent_color"
                        value={formData.accent_color}
                        onChange={(e) => updateField("accent_color", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">Branding</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label>Logo</Label>
                    <div className="mt-2 border-2 border-dashed border-border rounded-medium p-4 text-center">
                      <Upload className="h-6 w-6 mx-auto text-content-tertiary mb-1" />
                      <p className="text-tiny text-content-secondary">Upload logo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Form Tab */}
            <TabsContent value="form" className="space-y-6">
              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">Form Fields</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <div className="p-3 bg-surface-secondary rounded-medium">
                    <div className="flex items-center gap-2">
                      <Checkbox checked disabled />
                      <span className="font-medium">Property Address</span>
                      <span className="text-tiny text-content-tertiary">(Required)</span>
                    </div>
                  </div>
                  {FORM_FIELD_OPTIONS.map((field) => (
                    <label
                      key={field.id}
                      className="flex items-center gap-3 p-3 rounded-medium border border-border hover:bg-surface-secondary cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={formData.form_fields.includes(field.id)}
                        onCheckedChange={() => toggleFormField(field.id)}
                      />
                      <span>{field.label}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">Submit Button</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Label htmlFor="form_submit_text">Button Text</Label>
                  <Input
                    id="form_submit_text"
                    value={formData.form_submit_text}
                    onChange={(e) => updateField("form_submit_text", e.target.value)}
                    placeholder="Get My Cash Offer"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">Meta Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Page Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => updateField("meta_title", e.target.value)}
                      placeholder="We Buy Houses Fast | Company Name"
                    />
                    <p className="text-tiny text-content-tertiary mt-1">
                      {formData.meta_title.length}/60 characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => updateField("meta_description", e.target.value)}
                      placeholder="Get a fair cash offer for your house in 24 hours..."
                      rows={3}
                    />
                    <p className="text-tiny text-content-tertiary mt-1">
                      {formData.meta_description.length}/160 characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">Tracking</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                    <Input
                      id="google_analytics_id"
                      value={formData.google_analytics_id}
                      onChange={(e) => updateField("google_analytics_id", e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                    <Input
                      id="facebook_pixel_id"
                      value={formData.facebook_pixel_id}
                      onChange={(e) => updateField("facebook_pixel_id", e.target.value)}
                      placeholder="XXXXXXXXXXXXXXXX"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">Website Info</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label htmlFor="name">Website Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-content-secondary">/s/</span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => updateField("slug", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="custom_domain">Custom Domain</Label>
                    <Input
                      id="custom_domain"
                      value={formData.custom_domain}
                      onChange={(e) => updateField("custom_domain", e.target.value)}
                      placeholder="webuyhousesaustin.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">Company Info</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => updateField("company_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_phone">Phone</Label>
                    <Input
                      id="company_phone"
                      value={formData.company_phone}
                      onChange={(e) => updateField("company_phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_email">Email</Label>
                    <Input
                      id="company_email"
                      value={formData.company_email}
                      onChange={(e) => updateField("company_email", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card variant="default" padding="md">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-body">Notifications</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label htmlFor="lead_notification_email">Notification Email</Label>
                    <Input
                      id="lead_notification_email"
                      value={formData.lead_notification_email}
                      onChange={(e) => updateField("lead_notification_email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead_notification_sms">Notification SMS</Label>
                    <Input
                      id="lead_notification_sms"
                      value={formData.lead_notification_sms}
                      onChange={(e) => updateField("lead_notification_sms", e.target.value)}
                    />
                  </div>
                  <label className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.auto_respond_email}
                      onCheckedChange={(checked) => updateField("auto_respond_email", !!checked)}
                    />
                    <span>Auto-respond via email</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox
                      checked={formData.auto_respond_sms}
                      onCheckedChange={(checked) => updateField("auto_respond_sms", !!checked)}
                    />
                    <span>Auto-respond via SMS</span>
                  </label>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col bg-surface-secondary rounded-medium overflow-hidden">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between p-3 bg-white border-b border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDevice("desktop")}
                className={cn(
                  "p-2 rounded transition-colors",
                  device === "desktop" ? "bg-surface-secondary" : "hover:bg-surface-secondary"
                )}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDevice("tablet")}
                className={cn(
                  "p-2 rounded transition-colors",
                  device === "tablet" ? "bg-surface-secondary" : "hover:bg-surface-secondary"
                )}
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDevice("mobile")}
                className={cn(
                  "p-2 rounded transition-colors",
                  device === "mobile" ? "bg-surface-secondary" : "hover:bg-surface-secondary"
                )}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewKey((k) => k + 1)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`/s/${website.slug}`, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview Frame */}
          <div className="flex-1 flex items-start justify-center p-4 overflow-auto">
            <div
              style={{ width: getDeviceWidth(), maxWidth: "100%" }}
              className="bg-white rounded-lg shadow-lg overflow-hidden h-full"
            >
              <iframe
                key={previewKey}
                src={`/s/${website.slug}`}
                className="w-full h-full border-0"
                title="Website Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
