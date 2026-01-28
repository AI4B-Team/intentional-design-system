import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Building2,
  List,
  Calendar,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

interface CreateQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (queueId: string) => void;
}

type SourceType = "properties" | "list" | "followups" | "manual";

const DAYS_OF_WEEK = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
];

export function CreateQueueModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateQueueModalProps) {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();

  const [step, setStep] = React.useState(1);
  const [sourceType, setSourceType] = React.useState<SourceType>("properties");
  const [selectedListId, setSelectedListId] = React.useState<string>("");
  const [followUpRange, setFollowUpRange] = React.useState("today");

  // Property filters
  const [propertyFilters, setPropertyFilters] = React.useState({
    statuses: [] as string[],
    motivationMin: 0,
    motivationMax: 1000,
    requirePhone: true,
    skipDnc: true,
    skipRecentlyCalledDays: 7,
  });

  // Queue settings
  const [settings, setSettings] = React.useState({
    name: "",
    description: "",
    scriptId: "",
    maxAttempts: 3,
    daysBetweenAttempts: 2,
    callingHoursStart: "09:00",
    callingHoursEnd: "20:00",
    callingDays: ["mon", "tue", "wed", "thu", "fri"],
    timezone: "America/New_York",
    respectDnc: true,
    skipRecentCalls: true,
  });

  // Fetch lists
  const { data: lists = [] } = useQuery({
    queryKey: ["lists", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data } = await supabase
        .from("lists")
        .select("id, name, record_count")
        .eq("organization_id", organizationId)
        .order("name");
      return data || [];
    },
    enabled: !!organizationId && sourceType === "list",
  });

  // Fetch scripts
  const { data: scripts = [] } = useQuery({
    queryKey: ["call-scripts", organizationId],
    queryFn: async () => {
      const { data } = await supabase
        .from("call_scripts")
        .select("id, name")
        .or(`organization_id.eq.${organizationId},is_system.eq.true`)
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
    enabled: !!organizationId,
  });

  // Preview count for property-based queues
  const { data: previewCount = 0 } = useQuery({
    queryKey: ["queue-preview", propertyFilters, organizationId],
    queryFn: async () => {
      if (!organizationId) return 0;
      // This would be a real query to count matching properties
      // For now, return a mock count
      return 156;
    },
    enabled: !!organizationId && sourceType === "properties",
  });

  // Create queue mutation
  const createQueue = useMutation({
    mutationFn: async () => {
      if (!user?.id || !organizationId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("call_queues")
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          name: settings.name,
          description: settings.description,
          source_type: sourceType,
          source_list_id: sourceType === "list" ? selectedListId : null,
          source_filter: sourceType === "properties" ? propertyFilters : null,
          call_script_id: settings.scriptId || null,
          max_attempts: settings.maxAttempts,
          days_between_attempts: settings.daysBetweenAttempts,
          calling_hours_start: settings.callingHoursStart,
          calling_hours_end: settings.callingHoursEnd,
          calling_days: settings.callingDays,
          timezone: settings.timezone,
          respect_dnc: settings.respectDnc,
          status: "active",
          total_contacts: 0,
          contacts_remaining: 0,
          contacts_completed: 0,
          priority: 5,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["call-queues"] });
      toast.success("Queue created successfully");
      onOpenChange(false);
      onSuccess?.(data.id);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create queue");
    },
  });

  const resetForm = () => {
    setStep(1);
    setSourceType("properties");
    setSelectedListId("");
    setSettings({
      name: "",
      description: "",
      scriptId: "",
      maxAttempts: 3,
      daysBetweenAttempts: 2,
      callingHoursStart: "09:00",
      callingHoursEnd: "20:00",
      callingDays: ["mon", "tue", "wed", "thu", "fri"],
      timezone: "America/New_York",
      respectDnc: true,
      skipRecentCalls: true,
    });
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) {
      if (sourceType === "list") return !!selectedListId;
      return true;
    }
    if (step === 3) return !!settings.name;
    return false;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else createQueue.mutate();
  };

  const getSourceIcon = (source: SourceType) => {
    switch (source) {
      case "properties":
        return Building2;
      case "list":
        return List;
      case "followups":
        return Calendar;
      case "manual":
        return UserPlus;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Call Queue</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-small font-medium",
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "w-12 h-0.5",
                    step > s ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Source Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-small text-muted-foreground">
              Where should contacts come from?
            </p>

            <RadioGroup
              value={sourceType}
              onValueChange={(v) => setSourceType(v as SourceType)}
              className="space-y-3"
            >
              {[
                {
                  value: "properties",
                  label: "From Properties Database",
                  description: "Filter your properties to create call list",
                },
                {
                  value: "list",
                  label: "From a List",
                  description: "Select an existing list",
                },
                {
                  value: "followups",
                  label: "From Follow-ups",
                  description: "Contacts scheduled for follow-up",
                },
                {
                  value: "manual",
                  label: "Manual Entry",
                  description: "Add contacts manually or paste numbers",
                },
              ].map((option) => {
                const Icon = getSourceIcon(option.value as SourceType);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-medium border cursor-pointer transition-all",
                      sourceType === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border-subtle hover:border-border"
                    )}
                    onClick={() => setSourceType(option.value as SourceType)}
                  >
                    <RadioGroupItem value={option.value} className="mt-1" />
                    <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {option.label}
                      </p>
                      <p className="text-small text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        )}

        {/* Step 2: Source Configuration */}
        {step === 2 && (
          <div className="space-y-4">
            {sourceType === "properties" && (
              <>
                <div className="space-y-3">
                  <Label>Motivation Score Range</Label>
                  <div className="px-2">
                    <Slider
                      value={[propertyFilters.motivationMin, propertyFilters.motivationMax]}
                      onValueChange={([min, max]) =>
                        setPropertyFilters((p) => ({
                          ...p,
                          motivationMin: min,
                          motivationMax: max,
                        }))
                      }
                      max={1000}
                      step={50}
                    />
                    <div className="flex justify-between text-tiny text-muted-foreground mt-1">
                      <span>{propertyFilters.motivationMin}</span>
                      <span>{propertyFilters.motivationMax}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="requirePhone"
                      checked={propertyFilters.requirePhone}
                      onCheckedChange={(checked) =>
                        setPropertyFilters((p) => ({ ...p, requirePhone: checked === true }))
                      }
                    />
                    <Label htmlFor="requirePhone" className="cursor-pointer">
                      Has phone number (required)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="skipDnc"
                      checked={propertyFilters.skipDnc}
                      onCheckedChange={(checked) =>
                        setPropertyFilters((p) => ({ ...p, skipDnc: checked === true }))
                      }
                    />
                    <Label htmlFor="skipDnc" className="cursor-pointer">
                      Skip Do Not Call list
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="skipRecent"
                      checked={propertyFilters.skipRecentlyCalledDays > 0}
                      onCheckedChange={(checked) =>
                        setPropertyFilters((p) => ({
                          ...p,
                          skipRecentlyCalledDays: checked ? 7 : 0,
                        }))
                      }
                    />
                    <Label htmlFor="skipRecent" className="cursor-pointer">
                      Skip recently called (last {propertyFilters.skipRecentlyCalledDays} days)
                    </Label>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-medium">
                  <p className="text-small text-muted-foreground">
                    <span className="font-semibold text-foreground">{previewCount}</span>{" "}
                    contacts match your criteria
                  </p>
                </div>
              </>
            )}

            {sourceType === "list" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select List</Label>
                  <Select value={selectedListId} onValueChange={setSelectedListId}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Choose a list..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {lists.map((list: any) => (
                        <SelectItem key={list.id} value={list.id}>
                          <div className="flex items-center gap-2">
                            <span>{list.name}</span>
                            <Badge variant="secondary" size="sm">
                              {list.record_count} records
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="onlyWithPhone" defaultChecked />
                    <Label htmlFor="onlyWithPhone" className="cursor-pointer">
                      Only include records with phone number
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="skipInActive" defaultChecked />
                    <Label htmlFor="skipInActive" className="cursor-pointer">
                      Skip records already in active queues
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {sourceType === "followups" && (
              <div className="space-y-4">
                <Label>Follow-up Date Range</Label>
                <RadioGroup value={followUpRange} onValueChange={setFollowUpRange}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="today" id="today" />
                    <Label htmlFor="today" className="cursor-pointer">
                      Today
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="week" id="week" />
                    <Label htmlFor="week" className="cursor-pointer">
                      This Week
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="cursor-pointer">
                      Custom Range
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {sourceType === "manual" && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste phone numbers, one per line..."
                  className="min-h-[150px]"
                />
                <p className="text-tiny text-muted-foreground">
                  Enter phone numbers separated by new lines. Names can be
                  included as: Name, Phone
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Queue Name *</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))}
                placeholder="e.g., Hot Leads - January"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, description: e.target.value }))
                }
                placeholder="Optional description..."
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Call Script</Label>
              <Select
                value={settings.scriptId}
                onValueChange={(v) => setSettings((s) => ({ ...s, scriptId: v }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select a script..." />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {scripts.map((script: any) => (
                    <SelectItem key={script.id} value={script.id}>
                      {script.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Attempts</Label>
                <Select
                  value={settings.maxAttempts.toString()}
                  onValueChange={(v) =>
                    setSettings((s) => ({ ...s, maxAttempts: parseInt(v) }))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} attempts
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Days Between</Label>
                <Select
                  value={settings.daysBetweenAttempts.toString()}
                  onValueChange={(v) =>
                    setSettings((s) => ({ ...s, daysBetweenAttempts: parseInt(v) }))
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} day{n > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={settings.callingHoursStart}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, callingHoursStart: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={settings.callingHoursEnd}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, callingHoursEnd: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Calling Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      setSettings((s) => ({
                        ...s,
                        callingDays: s.callingDays.includes(day.id)
                          ? s.callingDays.filter((d) => d !== day.id)
                          : [...s.callingDays, day.id],
                      }));
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-small text-small font-medium transition-colors",
                      settings.callingDays.includes(day.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(v) => setSettings((s) => ({ ...s, timezone: v }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="respectDnc"
                  checked={settings.respectDnc}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...s, respectDnc: checked === true }))
                  }
                />
                <Label htmlFor="respectDnc" className="cursor-pointer">
                  Respect Do Not Call list
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="skipRecent"
                  checked={settings.skipRecentCalls}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...s, skipRecentCalls: checked === true }))
                  }
                />
                <Label htmlFor="skipRecent" className="cursor-pointer">
                  Skip contacts called in last 7 days
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => (step > 1 ? setStep(step - 1) : onOpenChange(false))}
            disabled={createQueue.isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {step > 1 ? "Back" : "Cancel"}
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed() || createQueue.isPending}
          >
            {step < 3 ? (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            ) : createQueue.isPending ? (
              "Creating..."
            ) : (
              "Create Queue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
