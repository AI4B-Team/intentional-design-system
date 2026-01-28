import * as React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Play,
  Download,
  StickyNote,
  Calendar,
  Phone,
  ExternalLink,
  Music,
} from "lucide-react";

interface Call {
  id: string;
  contact_name: string | null;
  phone_number: string;
  property_address?: string | null;
  duration_seconds: number | null;
  disposition: string | null;
  recording_url: string | null;
  initiated_at: string | null;
  property_id: string | null;
  [key: string]: any; // Allow additional properties
}

interface CallHistoryTableProps {
  calls: Call[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onSelectAll: () => void;
  onRowClick: (call: Call) => void;
  onPlayRecording: (call: Call) => void;
  onViewProperty: (propertyId: string) => void;
  onCallAgain: (call: Call) => void;
}

export function CallHistoryTable({
  calls,
  isLoading,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onRowClick,
  onPlayRecording,
  onViewProperty,
  onCallAgain,
}: CallHistoryTableProps) {
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "h:mm a");
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getDispositionBadge = (disposition: string | null) => {
    const variants: Record<string, "success" | "info" | "warning" | "secondary" | "destructive"> = {
      "appointment set": "success",
      "interested": "info",
      "left voicemail": "warning",
      "no answer": "secondary",
      "not interested": "destructive",
      "busy": "secondary",
      "wrong number": "destructive",
      "do not call": "destructive",
    };
    const variant = variants[disposition?.toLowerCase() || ""] || "secondary";
    return (
      <Badge variant={variant} size="sm">
        {disposition || "No Disposition"}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-border-subtle rounded-medium overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Time</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Disposition</TableHead>
              <TableHead>Recording</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={9}>
                  <Skeleton className="h-10 w-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="bg-white border border-border-subtle rounded-medium p-12 text-center">
        <Phone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-h3 font-semibold text-foreground mb-2">No calls found</h3>
        <p className="text-muted-foreground">
          Adjust your filters or date range to see more calls
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-subtle rounded-medium overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={calls.length > 0 && selectedIds.size === calls.length}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Disposition</TableHead>
            <TableHead className="text-center">Recording</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow
              key={call.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(call)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(call.id)}
                  onCheckedChange={() => onSelectToggle(call.id)}
                />
              </TableCell>
              <TableCell className="text-small" title={call.initiated_at || undefined}>
                {formatTime(call.initiated_at)}
              </TableCell>
              <TableCell className="font-medium">
                {call.contact_name || "Unknown"}
              </TableCell>
              <TableCell className="font-mono text-small">
                {formatPhone(call.phone_number)}
              </TableCell>
              <TableCell className="text-small text-muted-foreground max-w-[180px] truncate">
                {call.property_address || "-"}
              </TableCell>
              <TableCell className="font-mono text-small">
                {formatDuration(call.duration_seconds)}
              </TableCell>
              <TableCell>{getDispositionBadge(call.disposition)}</TableCell>
              <TableCell className="text-center">
                {call.recording_url ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayRecording(call);
                    }}
                    title="Play recording"
                  >
                    <Music className="h-4 w-4 text-primary" />
                  </Button>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem onClick={() => onRowClick(call)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {call.recording_url && (
                      <>
                        <DropdownMenuItem onClick={() => onPlayRecording(call)}>
                          <Play className="h-4 w-4 mr-2" />
                          Play Recording
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Recording
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <StickyNote className="h-4 w-4 mr-2" />
                      Add Notes
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Follow-up
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCallAgain(call)}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Again
                    </DropdownMenuItem>
                    {call.property_id && (
                      <DropdownMenuItem
                        onClick={() => onViewProperty(call.property_id!)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Property
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
