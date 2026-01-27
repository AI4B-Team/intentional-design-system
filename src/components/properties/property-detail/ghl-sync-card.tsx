import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Zap,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  MessageSquare,
  Mail,
  Target,
  ClipboardList,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useGHLConnection } from "@/hooks/useGHLIntegration";
import {
  useSyncPropertyToGHL,
  useTriggerGHLWorkflow,
  GHL_WORKFLOWS,
} from "@/lib/ghl-sync";
import { formatDistanceToNow } from "date-fns";

interface GHLSyncCardProps {
  propertyId: string;
  ghlContactId?: string | null;
  ghlLastSync?: string | null;
}

export function GHLSyncCard({
  propertyId,
  ghlContactId,
  ghlLastSync,
}: GHLSyncCardProps) {
  const { data: connection, isLoading: connectionLoading } = useGHLConnection();
  const syncProperty = useSyncPropertyToGHL();
  const triggerWorkflow = useTriggerGHLWorkflow();

  const isConnected = connection?.is_active;
  const isSynced = !!ghlContactId;

  const handleSync = () => {
    syncProperty.mutate(propertyId);
  };

  const handleTriggerWorkflow = (workflowId: string) => {
    triggerWorkflow.mutate({ propertyId, workflowId });
  };

  // Don't show if GHL not connected
  if (connectionLoading) {
    return null;
  }

  if (!isConnected) {
    return null;
  }

  return (
    <Card variant="default" padding="md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-h4">
          <Zap className="h-4 w-4 text-brand-accent" />
          GoHighLevel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSynced ? (
              <>
                <Check className="h-4 w-4 text-success" />
                <span className="text-small text-success font-medium">
                  Synced to GHL
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-small text-warning font-medium">
                  Not synced
                </span>
              </>
            )}
          </div>
          {isSynced && (
            <Badge variant="secondary" size="sm" className="font-mono">
              {ghlContactId?.substring(0, 12)}...
            </Badge>
          )}
        </div>

        {/* Last Sync Time */}
        {ghlLastSync && (
          <p className="text-tiny text-content-tertiary">
            Last synced {formatDistanceToNow(new Date(ghlLastSync), { addSuffix: true })}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {isSynced ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSync}
                disabled={syncProperty.isPending}
              >
                {syncProperty.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Re-sync
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <a
                  href={`https://app.gohighlevel.com/v2/location/${connection.location_id}/contacts/detail/${ghlContactId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View in GHL
                </a>
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSync}
              disabled={syncProperty.isPending}
            >
              {syncProperty.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-1" />
              )}
              Sync Now
            </Button>
          )}
        </div>

        {/* GHL Actions Dropdown - only show if synced */}
        {isSynced && (
          <div className="pt-2 border-t border-border-subtle">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  GHL Actions
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => handleTriggerWorkflow("sms_sequence_1")}
                  disabled={triggerWorkflow.isPending}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Trigger SMS Sequence
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleTriggerWorkflow("email_sequence_1")}
                  disabled={triggerWorkflow.isPending}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Trigger Email Sequence
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleTriggerWorkflow("hot_lead")}
                  disabled={triggerWorkflow.isPending}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Add to Hot Lead Campaign
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleTriggerWorkflow("offer_followup")}
                  disabled={triggerWorkflow.isPending}
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Create Task in GHL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
