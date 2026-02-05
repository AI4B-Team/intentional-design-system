import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Play,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_CLOSEBOT_BOTS } from "@/hooks/useClosebotIntegration";

interface BulkAIOutreachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPropertyIds: string[];
}

interface PropertyWithPhone {
  id: string;
  address: string;
  owner_phone: string | null;
  owner_name: string | null;
}

type BulkStatus = "idle" | "preparing" | "running" | "completed";

interface BulkResult {
  total: number;
  started: number;
  failed: number;
  skipped: number;
  errors: Array<{ property_id: string; error: string }>;
}

export function BulkAIOutreachModal({
  open,
  onOpenChange,
  selectedPropertyIds,
}: BulkAIOutreachModalProps) {
  const { user } = useAuth();
  const [selectedBot, setSelectedBot] = React.useState<string>("");
  const [dailyLimit, setDailyLimit] = React.useState("50");
  const [scheduleTime, setScheduleTime] = React.useState("");
  const [properties, setProperties] = React.useState<PropertyWithPhone[]>([]);
  const [status, setStatus] = React.useState<BulkStatus>("idle");
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<BulkResult | null>(null);

  const propertiesWithPhone = properties.filter((p) => p.owner_phone);
  const propertiesWithoutPhone = properties.filter((p) => !p.owner_phone);

  // Load properties when modal opens
  React.useEffect(() => {
    if (open && selectedPropertyIds.length > 0) {
      loadProperties();
    }
  }, [open, selectedPropertyIds]);

  const loadProperties = async () => {
    setStatus("preparing");
    const { data, error } = await supabase
      .from("properties")
      .select("id, address, owner_phone, owner_name")
      .in("id", selectedPropertyIds);

    if (error) {
      toast.error("Failed to load properties");
      setStatus("idle");
      return;
    }

    setProperties(data || []);
    setStatus("idle");
  };

  const handleStartBulkOutreach = async () => {
    if (!selectedBot || propertiesWithPhone.length === 0) return;

    setStatus("running");
    setProgress(0);
    setResult(null);

    const results: BulkResult = {
      total: propertiesWithPhone.length,
      started: 0,
      failed: 0,
      skipped: propertiesWithoutPhone.length,
      errors: [],
    };

    // Process properties
    for (let i = 0; i < propertiesWithPhone.length; i++) {
      const property = propertiesWithPhone[i];

      try {
        // Create conversation record (in production, this would call Closebot API)
        const { error } = await supabase.from("closebot_conversations").insert({
          user_id: user?.id,
          property_id: property.id,
          bot_id: selectedBot,
          bot_name: MOCK_CLOSEBOT_BOTS.find((b) => b.id === selectedBot)?.name || "AI Bot",
          status: "active",
        });

        if (error) {
          results.failed++;
          results.errors.push({ property_id: property.id, error: error.message });
        } else {
          results.started++;
        }
      } catch (err) {
        results.failed++;
        results.errors.push({
          property_id: property.id,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }

      // Update progress
      setProgress(Math.round(((i + 1) / propertiesWithPhone.length) * 100));

      // Small delay to prevent rate limiting
      await new Promise((r) => setTimeout(r, 100));
    }

    setResult(results);
    setStatus("completed");

    if (results.failed === 0) {
      toast.success(`Started ${results.started} AI conversations`);
    } else {
      toast.warning(`Started ${results.started} conversations, ${results.failed} failed`);
    }
  };

  const handleClose = () => {
    if (status === "running") return;
    onOpenChange(false);
    // Reset state after close
    setTimeout(() => {
      setStatus("idle");
      setProgress(0);
      setResult(null);
      setSelectedBot("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand" />
            Bulk AI Outreach
          </DialogTitle>
          <DialogDescription>
            Start AI conversations with multiple leads at once
          </DialogDescription>
        </DialogHeader>

        {status === "idle" && (
          <>
            <div className="px-6 py-4 space-y-4">
              {/* Summary */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-small font-medium">Selected Properties</span>
                  <Badge variant="secondary">{selectedPropertyIds.length}</Badge>
                </div>
                <div className="flex items-center gap-4 text-tiny">
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    {propertiesWithPhone.length} with phone
                  </span>
                  <span className="flex items-center gap-1 text-warning">
                    <AlertTriangle className="h-3 w-3" />
                    {propertiesWithoutPhone.length} no phone (will skip)
                  </span>
                </div>
              </div>

              {/* Bot Selection */}
              <div className="space-y-2">
                <Label>Select Bot</Label>
                <Select value={selectedBot} onValueChange={setSelectedBot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CLOSEBOT_BOTS.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        <div className="flex items-center gap-2">
                          {bot.type === "seller" ? (
                            <Sparkles className="h-4 w-4 text-brand" />
                          ) : bot.type === "buyer" ? (
                            <Bot className="h-4 w-4 text-info" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-content-secondary" />
                          )}
                          {bot.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Daily Limit */}
              <div className="space-y-2">
                <Label>Daily Limit</Label>
                <Input
                  type="number"
                  min="1"
                  max="500"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                />
                <p className="text-tiny text-content-tertiary">
                  Maximum conversations to start per day (respects rate limits)
                </p>
              </div>

              {/* Schedule (optional) */}
              <div className="space-y-2">
                <Label>Schedule Start (optional)</Label>
                <Input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
                <p className="text-tiny text-content-tertiary">
                  Leave empty to start immediately
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-small text-info font-medium mb-1">Preview</p>
                <p className="text-tiny text-info/80">
                  This will initiate {propertiesWithPhone.length} AI conversations
                  {scheduleTime ? ` starting at ${new Date(scheduleTime).toLocaleString()}` : " immediately"}.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartBulkOutreach}
                disabled={!selectedBot || propertiesWithPhone.length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Start {propertiesWithPhone.length} Conversations
              </Button>
            </DialogFooter>
          </>
        )}

        {status === "running" && (
          <div className="px-6 py-8 space-y-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-brand animate-spin" />
              <p className="text-body font-medium text-content">Starting AI Conversations...</p>
              <p className="text-small text-content-secondary mt-1">
                Please don't close this window
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-small">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        )}

        {status === "completed" && result && (
          <>
            <div className="px-6 py-6 space-y-4">
              <div className="text-center">
                {result.failed === 0 ? (
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
                ) : (
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-warning" />
                )}
                <p className="text-body font-medium text-content">
                  {result.failed === 0 ? "All Conversations Started!" : "Completed with Errors"}
                </p>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-success/10 rounded-lg text-center">
                  <p className="text-h3 font-bold text-success">{result.started}</p>
                  <p className="text-tiny text-success">Started</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg text-center">
                  <p className="text-h3 font-bold text-destructive">{result.failed}</p>
                  <p className="text-tiny text-destructive">Failed</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg text-center">
                  <p className="text-h3 font-bold text-warning">{result.skipped}</p>
                  <p className="text-tiny text-warning">Skipped</p>
                </div>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-small font-medium text-destructive mb-2">Errors</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <p key={i} className="text-tiny text-destructive/80">
                        {err.property_id.substring(0, 8)}... - {err.error}
                      </p>
                    ))}
                    {result.errors.length > 5 && (
                      <p className="text-tiny text-destructive/80">
                        + {result.errors.length - 5} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="primary" onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
