import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bookmark,
  Rocket,
  Mail,
  MessageSquare,
  Check,
  ChevronRight,
  Sparkles,
  Target,
  Send,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Record<string, any>;
  resultCount: number;
}

type Step = "save" | "launch-prompt" | "campaign-setup";

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  smsBody: string;
}

const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "cash-offer",
    name: "Cash Offer",
    description: "Direct cash offer with quick close timeline",
    subject: "Cash Offer for {property_address}",
    body: `Hi {agent_name},

I noticed your listing at {property_address} and wanted to reach out with a cash offer.

I'm prepared to offer {offer_amount} with a quick close in 14-21 days. This is a cash offer with no financing contingencies.

Property: {property_address}
Listed at: {list_price}
My Offer: {offer_amount}

I can move quickly and close on your timeline. Let me know if you'd like to discuss.

Best regards`,
    smsBody: "Hi {agent_name}, I'd like to make a cash offer on {property_address}. Can we connect? Reply STOP to opt out.",
  },
  {
    id: "investor-inquiry",
    name: "Investor Inquiry",
    description: "Softer approach asking about seller motivation",
    subject: "Inquiry About {property_address}",
    body: `Hi {agent_name},

I'm an active investor in your area and came across your listing at {property_address}.

I'm curious if your seller would be open to a cash offer with flexible terms? I often work with sellers who need a quick, hassle-free sale.

Could you tell me more about:
- The seller's timeline?
- Would they consider an as-is offer?
- Any flexibility on price for a fast close?

Looking forward to hearing from you.

Best regards`,
    smsBody: "Hi {agent_name}, I'm interested in {property_address}. Is your seller open to a cash offer? Reply STOP to opt out.",
  },
  {
    id: "as-is-offer",
    name: "As-Is Offer",
    description: "Emphasizes no repairs or contingencies needed",
    subject: "As-Is Cash Offer - {property_address}",
    body: `Hi {agent_name},

I'm reaching out about {property_address}. I'm a cash buyer looking to purchase as-is with no inspection contingencies.

I understand properties sometimes need work, and I'm fully prepared to take on any repairs. This means:
- No inspection contingencies
- No repair requests
- Quick 14-day close

I'm offering {offer_amount} for a fast, clean transaction.

Would your seller be interested in discussing?

Best regards`,
    smsBody: "Hi {agent_name}, cash buyer here for {property_address}. No contingencies, close in 14 days. Interested? Reply STOP to opt out.",
  },
  {
    id: "price-reduction",
    name: "Price Reduction Follow-up",
    description: "For properties with recent price drops",
    subject: "Following Up on {property_address} Price Reduction",
    body: `Hi {agent_name},

I noticed the recent price reduction on {property_address}. Your seller is clearly motivated, and I'd like to help them move forward.

I can offer:
- Cash purchase at {offer_amount}
- Close in as little as 14 days
- No financing delays or contingencies
- Flexible on closing date

Sometimes a slightly lower offer with certainty beats waiting for a higher one that falls through. Happy to discuss.

Best regards`,
    smsBody: "Hi {agent_name}, saw the price drop on {property_address}. I have a cash offer ready. Can we talk? Reply STOP to opt out.",
  },
];

const NOTIFICATION_OPTIONS = [
  { value: "never", label: "Never", description: "No notifications" },
  { value: "instant", label: "Instant", description: "As new deals match" },
  { value: "daily", label: "Daily Digest", description: "Once per day" },
  { value: "weekly", label: "Weekly Summary", description: "Once per week" },
];

export function SaveSearchDialog({
  open,
  onOpenChange,
  filters,
  resultCount,
}: SaveSearchDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("save");
  const [searchName, setSearchName] = useState("");
  const [notificationFrequency, setNotificationFrequency] = useState("daily");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSearchId, setSavedSearchId] = useState<string | null>(null);
  
  // Campaign setup state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("cash-offer");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(true);
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [customSms, setCustomSms] = useState("");

  const activeTemplate = CAMPAIGN_TEMPLATES.find(t => t.id === selectedTemplate);

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      toast.error("Please enter a name for your search");
      return;
    }

    if (!user) {
      toast.error("Please sign in to save searches");
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("saved_searches")
        .insert({
          user_id: user.id,
          name: searchName.trim(),
          filters: filters,
          notification_frequency: notificationFrequency,
          result_count: resultCount,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedSearchId(data.id);
      toast.success(`Search "${searchName}" saved successfully!`);
      setStep("launch-prompt");
    } catch (error: any) {
      console.error("Error saving search:", error);
      toast.error("Failed to save search. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLaunchCampaign = () => {
    setStep("campaign-setup");
    // Pre-fill with template content
    if (activeTemplate) {
      setCustomSubject(activeTemplate.subject);
      setCustomBody(activeTemplate.body);
      setCustomSms(activeTemplate.smsBody);
    }
  };

  const handleStartCampaign = () => {
    // In production, this would create a campaign via API
    toast.success("Campaign created! Sending offers to matching properties...", {
      description: `${resultCount} properties will receive ${sendEmail ? "email" : ""}${sendEmail && sendSms ? " & " : ""}${sendSms ? "SMS" : ""} offers.`,
    });
    
    // Navigate to campaigns page
    navigate("/campaigns");
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setStep("save");
    setSearchName("");
    setNotificationFrequency("daily");
    setSavedSearchId(null);
    setSelectedTemplate("cash-offer");
    setSendEmail(true);
    setSendSms(true);
    setCustomSubject("");
    setCustomBody("");
    setCustomSms("");
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(resetState, 200);
  };

  // Get filter summary for display
  const getFilterSummary = () => {
    const parts: string[] = [];
    if (filters.leadType && filters.leadType !== "all") parts.push(filters.leadType);
    if (filters.homeTypes?.length > 0 && filters.homeTypes.length < 7) {
      parts.push(`${filters.homeTypes.length} home types`);
    }
    if (filters.priceRange && filters.priceRange !== "any") parts.push(filters.priceRange);
    if (filters.bedsMin) parts.push(`${filters.bedsMin}+ beds`);
    if (filters.bathsMin) parts.push(`${filters.bathsMin}+ baths`);
    if (filters.address) parts.push(`"${filters.address}"`);
    return parts.length > 0 ? parts.join(" • ") : "All properties";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "transition-all duration-200 overflow-visible",
        step === "campaign-setup" ? "max-w-2xl" : "max-w-md"
      )}>
        {step === "save" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-primary" />
                Save Search
              </DialogTitle>
              <DialogDescription>
                Save these filters to quickly access matching properties later.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="search-name">Search Name</Label>
                <Input
                  id="search-name"
                  placeholder="e.g., Tampa High Equity Deals"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSearch()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-frequency" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Frequency
                </Label>
                <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
                  <SelectTrigger id="notification-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Filters</span>
                  <Badge variant="secondary">{resultCount} results</Badge>
                </div>
                <p className="text-sm font-medium">{getFilterSummary()}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSaveSearch} disabled={!searchName.trim() || isSaving}>
                <Bookmark className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Search"}
              </Button>
            </div>
          </>
        )}

        {step === "launch-prompt" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                Search Saved!
              </DialogTitle>
              <DialogDescription>
                Would you like to start a campaign and send offers to all {resultCount} matching properties?
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Launch Outreach Campaign</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send personalized offers via email & SMS to sellers/agents of all {resultCount} properties matching your search.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Email Offers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>SMS Alerts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleClose}>
                Maybe Later
              </Button>
              <Button onClick={handleLaunchCampaign} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Start Campaign
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {step === "campaign-setup" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Campaign Setup
              </DialogTitle>
              <DialogDescription>
                Choose a template and customize your outreach to {resultCount} properties.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* Delivery Options */}
              <div className="space-y-3">
                <Label>Delivery Methods</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={sendEmail}
                      onCheckedChange={(checked) => setSendEmail(!!checked)}
                    />
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={sendSms}
                      onCheckedChange={(checked) => setSendSms(!!checked)}
                    />
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">SMS Alert</span>
                  </label>
                </div>
              </div>

              {/* Template Selection */}
              <div className="space-y-3">
                <Label>Choose Template</Label>
                <RadioGroup
                  value={selectedTemplate}
                  onValueChange={(value) => {
                    setSelectedTemplate(value);
                    const template = CAMPAIGN_TEMPLATES.find(t => t.id === value);
                    if (template) {
                      setCustomSubject(template.subject);
                      setCustomBody(template.body);
                      setCustomSms(template.smsBody);
                    }
                  }}
                  className="grid grid-cols-2 gap-3"
                >
                  {CAMPAIGN_TEMPLATES.map((template) => (
                    <label
                      key={template.id}
                      className={cn(
                        "flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all",
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value={template.id} className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Email Customization */}
              {sendEmail && (
                <div className="space-y-3">
                  <Label>Email Content</Label>
                  <Input
                    placeholder="Subject line..."
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                  <Textarea
                    placeholder="Email body..."
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    rows={6}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables: {"{property_address}"}, {"{agent_name}"}, {"{list_price}"}, {"{offer_amount}"}, {"{days_on_market}"}
                  </p>
                </div>
              )}

              {/* SMS Customization */}
              {sendSms && (
                <div className="space-y-3">
                  <Label>SMS Message</Label>
                  <Textarea
                    placeholder="SMS message..."
                    value={customSms}
                    onChange={(e) => setCustomSms(e.target.value)}
                    rows={2}
                    className="text-sm"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {customSms.length}/160 characters
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="ghost" onClick={() => setStep("launch-prompt")}>
                Back
              </Button>
              <Button 
                onClick={handleStartCampaign}
                disabled={!sendEmail && !sendSms}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Launch Campaign ({resultCount} properties)
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
