import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Clock, FileText, Zap } from "lucide-react";

interface QueueSettings {
  id: string;
  name: string;
  description: string | null;
  call_script_id: string | null;
  max_attempts: number | null;
  days_between_attempts: number | null;
  calling_hours_start: string | null;
  calling_hours_end: string | null;
  calling_days: string[] | null;
  timezone: string | null;
  respect_dnc: boolean | null;
  priority: number | null;
}

interface QueueSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queue: QueueSettings | null;
}

const DAYS_OF_WEEK = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

export function QueueSettingsPanel({
  open,
  onOpenChange,
  queue,
}: QueueSettingsPanelProps) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = React.useState<QueueSettings | null>(null);

  React.useEffect(() => {
    if (queue) {
      setSettings(queue);
    }
  }, [queue]);

  const { data: scripts = [] } = useQuery({
    queryKey: ["call-scripts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("call_scripts")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
  });

  const updateQueue = useMutation({
    mutationFn: async (updates: Partial<QueueSettings>) => {
      if (!queue?.id) throw new Error("No queue selected");
      const { error } = await supabase
        .from("call_queues")
        .update(updates)
        .eq("id", queue.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-queue", queue?.id] });
      queryClient.invalidateQueries({ queryKey: ["call-queues"] });
      toast.success("Settings saved");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  const handleSave = () => {
    if (!settings) return;
    updateQueue.mutate({
      name: settings.name,
      description: settings.description,
      call_script_id: settings.call_script_id,
      max_attempts: settings.max_attempts,
      days_between_attempts: settings.days_between_attempts,
      calling_hours_start: settings.calling_hours_start,
      calling_hours_end: settings.calling_hours_end,
      calling_days: settings.calling_days,
      timezone: settings.timezone,
      respect_dnc: settings.respect_dnc,
      priority: settings.priority,
    });
  };

  if (!settings) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md bg-white overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Queue Settings</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="general" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1 gap-1">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex-1 gap-1">
              <Clock className="h-4 w-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="script" className="flex-1 gap-1">
              <FileText className="h-4 w-4" />
              Script
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex-1 gap-1">
              <Zap className="h-4 w-4" />
              Auto
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) =>
                  setSettings((s) => (s ? { ...s, name: e.target.value } : s))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description || ""}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, description: e.target.value } : s
                  )
                }
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Priority (affects order in multi-queue)</Label>
              <div className="px-2">
                <Slider
                  value={[settings.priority || 5]}
                  onValueChange={([v]) =>
                    setSettings((s) => (s ? { ...s, priority: v } : s))
                  }
                  max={10}
                  min={1}
                  step={1}
                />
                <div className="flex justify-between text-tiny text-muted-foreground mt-1">
                  <span>Low</span>
                  <span>{settings.priority || 5}</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Calling Rules Tab */}
          <TabsContent value="rules" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Attempts</Label>
                <Select
                  value={(settings.max_attempts || 3).toString()}
                  onValueChange={(v) =>
                    setSettings((s) =>
                      s ? { ...s, max_attempts: parseInt(v) } : s
                    )
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Days Between</Label>
                <Select
                  value={(settings.days_between_attempts || 2).toString()}
                  onValueChange={(v) =>
                    setSettings((s) =>
                      s ? { ...s, days_between_attempts: parseInt(v) } : s
                    )
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
                  value={settings.calling_hours_start || "09:00"}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, calling_hours_start: e.target.value } : s
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={settings.calling_hours_end || "20:00"}
                  onChange={(e) =>
                    setSettings((s) =>
                      s ? { ...s, calling_hours_end: e.target.value } : s
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Calling Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = (settings.calling_days || []).includes(
                    day.id
                  );
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        setSettings((s) => {
                          if (!s) return s;
                          const days = s.calling_days || [];
                          return {
                            ...s,
                            calling_days: isSelected
                              ? days.filter((d) => d !== day.id)
                              : [...days, day.id],
                          };
                        });
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-small text-small font-medium transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="respect-dnc">Respect Do Not Call list</Label>
              <Switch
                id="respect-dnc"
                checked={settings.respect_dnc || false}
                onCheckedChange={(checked) =>
                  setSettings((s) => (s ? { ...s, respect_dnc: checked } : s))
                }
              />
            </div>
          </TabsContent>

          {/* Script Tab */}
          <TabsContent value="script" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Assigned Script</Label>
              <Select
                value={settings.call_script_id || ""}
                onValueChange={(v) =>
                  setSettings((s) =>
                    s ? { ...s, call_script_id: v || null } : s
                  )
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="No script assigned" />
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

            {settings.call_script_id && (
              <Button variant="outline" size="sm" className="w-full">
                Preview Script
              </Button>
            )}
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-add new contacts</Label>
                <p className="text-tiny text-muted-foreground">
                  For property-based queues
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-remove after max attempts</Label>
                <p className="text-tiny text-muted-foreground">
                  Remove contacts that hit max attempts
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-archive when complete</Label>
                <p className="text-tiny text-muted-foreground">
                  Archive queue when all contacts processed
                </p>
              </div>
              <Switch />
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSave}
            disabled={updateQueue.isPending}
          >
            {updateQueue.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
