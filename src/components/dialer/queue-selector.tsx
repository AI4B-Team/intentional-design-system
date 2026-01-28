import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Plus, Pause, Play, SkipForward } from "lucide-react";

interface Queue {
  id: string;
  name: string;
  status: string;
  total_contacts: number;
  contacts_remaining: number;
  contacts_completed: number;
  priority: number;
}

interface QueueSelectorProps {
  selectedQueueId: string | null;
  onQueueChange: (queueId: string | null) => void;
  onCreateQueue: () => void;
  onPauseQueue: () => void;
  onSkipContact: () => void;
  isPaused: boolean;
  isOnCall: boolean;
}

export function QueueSelector({
  selectedQueueId,
  onQueueChange,
  onCreateQueue,
  onPauseQueue,
  onSkipContact,
  isPaused,
  isOnCall,
}: QueueSelectorProps) {
  const { organizationId } = useOrganizationContext();

  const { data: queues = [], isLoading } = useQuery({
    queryKey: ["call-queues", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from("call_queues")
        .select("*")
        .eq("organization_id", organizationId)
        .in("status", ["active", "paused"])
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as Queue[];
    },
    enabled: !!organizationId,
  });

  const selectedQueue = queues.find((q) => q.id === selectedQueueId);

  const progressPercent = selectedQueue
    ? Math.round(
        (selectedQueue.contacts_completed / selectedQueue.total_contacts) * 100
      ) || 0
    : 0;

  return (
    <div className="space-y-4">
      {/* Queue Dropdown */}
      <div className="flex items-center gap-2">
        <Select
          value={selectedQueueId || ""}
          onValueChange={(value) => onQueueChange(value || null)}
        >
          <SelectTrigger className="flex-1 bg-white">
            <SelectValue placeholder="Select Call Queue" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {queues.map((queue) => (
              <SelectItem key={queue.id} value={queue.id}>
                <div className="flex items-center gap-2">
                  {queue.priority >= 8 && (
                    <Flame className="h-4 w-4 text-warning" />
                  )}
                  <span>{queue.name}</span>
                  <Badge variant="secondary" size="sm">
                    {queue.contacts_remaining} remaining
                  </Badge>
                </div>
              </SelectItem>
            ))}
            {queues.length === 0 && !isLoading && (
              <div className="p-3 text-center text-muted-foreground text-small">
                No queues found. Create one to get started.
              </div>
            )}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          size="icon"
          onClick={onCreateQueue}
          title="Create New Queue"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected Queue Info */}
      {selectedQueue && (
        <div className="bg-white border border-border-subtle rounded-medium p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">{selectedQueue.name}</h4>
            <Badge
              variant={selectedQueue.status === "active" ? "success" : "warning"}
              size="sm"
            >
              {selectedQueue.status}
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-small text-muted-foreground">
              <span>
                {selectedQueue.contacts_completed}/{selectedQueue.total_contacts}{" "}
                called
              </span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <p className="text-small text-muted-foreground">
            Remaining today:{" "}
            <span className="font-medium text-foreground">
              {selectedQueue.contacts_remaining}
            </span>
          </p>

          {/* Queue Controls */}
          <div className="flex gap-2">
            <Button
              variant={isPaused ? "primary" : "secondary"}
              size="sm"
              onClick={onPauseQueue}
              disabled={isOnCall}
              className="flex-1"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume Queue
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause Queue
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSkipContact}
              disabled={isOnCall}
              className="flex-1"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip to Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
