import * as React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RecordingPlayer } from "./recording-player";
import {
  Phone,
  PhoneOutgoing,
  PhoneIncoming,
  Clock,
  Calendar,
  MapPin,
  FileText,
  ChevronDown,
  ExternalLink,
  Plus,
} from "lucide-react";

interface CallData {
  id: string;
  contact_name: string | null;
  phone_number: string;
  direction: string | null;
  status: string | null;
  disposition: string | null;
  disposition_category: string | null;
  initiated_at: string | null;
  answered_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  ring_time_seconds: number | null;
  talk_time_seconds: number | null;
  recording_url: string | null;
  recording_duration_seconds: number | null;
  transcription: string | null;
  notes: string | null;
  follow_up_date: string | null;
  follow_up_time: string | null;
  property_id: string | null;
  queue_id: string | null;
}

interface RelatedCall {
  id: string;
  initiated_at: string | null;
  disposition: string | null;
  duration_seconds: number | null;
}

interface CallDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  call: CallData | null;
  relatedCalls?: RelatedCall[];
  propertyAddress?: string;
  queueName?: string;
  onAddNote?: (note: string) => void;
  onViewProperty?: () => void;
}

export function CallDetailSheet({
  open,
  onOpenChange,
  call,
  relatedCalls = [],
  propertyAddress,
  queueName,
  onAddNote,
  onViewProperty,
}: CallDetailSheetProps) {
  const [newNote, setNewNote] = React.useState("");
  const [showTranscript, setShowTranscript] = React.useState(false);

  if (!call) return null;

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "h:mm:ss a");
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

  const getDispositionColor = (disposition: string | null) => {
    switch (disposition?.toLowerCase()) {
      case "appointment set":
        return "success";
      case "interested":
        return "info";
      case "left voicemail":
        return "warning";
      case "no answer":
        return "secondary";
      case "not interested":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(newNote.trim());
      setNewNote("");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg bg-white overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {call.direction === "inbound" ? (
              <PhoneIncoming className="h-5 w-5 text-info" />
            ) : (
              <PhoneOutgoing className="h-5 w-5 text-success" />
            )}
            {call.contact_name || "Unknown Contact"}
          </SheetTitle>
          <div className="flex items-center gap-2 text-small text-muted-foreground">
            <span>{formatPhone(call.phone_number)}</span>
            <span>•</span>
            <span>
              {call.initiated_at
                ? format(new Date(call.initiated_at), "MMM d, yyyy h:mm a")
                : "-"}
            </span>
          </div>
          <Badge variant={getDispositionColor(call.disposition)} className="w-fit">
            {call.disposition || "No Disposition"}
          </Badge>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6 py-4">
            {/* Recording Player */}
            {call.recording_url && (
              <div>
                <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Recording
                </h4>
                <RecordingPlayer
                  src={call.recording_url}
                  duration={call.recording_duration_seconds || undefined}
                />
              </div>
            )}

            {/* Call Info */}
            <div>
              <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Call Info
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-small">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-tiny text-muted-foreground">Direction</p>
                    <p className="text-small font-medium capitalize">
                      {call.direction || "Outbound"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-small">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-tiny text-muted-foreground">Duration</p>
                    <p className="text-small font-medium">
                      {formatDuration(call.duration_seconds)}
                    </p>
                  </div>
                </div>
              </div>
              {queueName && (
                <p className="text-small text-muted-foreground mt-2">
                  Queue: <span className="text-foreground">{queueName}</span>
                </p>
              )}
            </div>

            {/* Timing */}
            <div>
              <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Timing
              </h4>
              <div className="space-y-1 text-small">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Initiated</span>
                  <span>{formatTime(call.initiated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answered</span>
                  <span>{formatTime(call.answered_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ended</span>
                  <span>{formatTime(call.ended_at)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ring Time</span>
                  <span>{call.ring_time_seconds || 0}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Talk Time</span>
                  <span>{formatDuration(call.talk_time_seconds)}</span>
                </div>
              </div>
            </div>

            {/* Property */}
            {propertyAddress && (
              <div>
                <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Property
                </h4>
                <button
                  onClick={onViewProperty}
                  className="flex items-center gap-2 w-full p-3 bg-muted/30 rounded-medium hover:bg-muted/50 transition-colors text-left"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-small">{propertyAddress}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Transcription */}
            {call.transcription && (
              <Collapsible open={showTranscript} onOpenChange={setShowTranscript}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
                    Transcription
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground ml-auto transition-transform",
                      showTranscript && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-3 bg-muted/30 rounded-medium text-small text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {call.transcription}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Notes */}
            <div>
              <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Notes
              </h4>
              {call.notes && (
                <div className="p-3 bg-muted/30 rounded-medium text-small mb-3">
                  {call.notes}
                </div>
              )}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Note
                </Button>
              </div>
            </div>

            {/* Follow-up */}
            {call.follow_up_date && (
              <div>
                <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Follow-up
                </h4>
                <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-medium">
                  <Calendar className="h-4 w-4 text-warning" />
                  <div className="flex-1">
                    <p className="text-small font-medium">
                      {format(new Date(call.follow_up_date), "MMM d, yyyy")}
                      {call.follow_up_time && ` at ${call.follow_up_time}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      Reschedule
                    </Button>
                    <Button variant="ghost" size="sm">
                      Complete
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Related Calls */}
            {relatedCalls.length > 0 && (
              <div>
                <h4 className="text-small font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Related Calls
                </h4>
                <div className="space-y-2">
                  {relatedCalls.map((rc) => (
                    <div
                      key={rc.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-small"
                    >
                      <span className="text-small">
                        {rc.initiated_at
                          ? format(new Date(rc.initiated_at), "MMM d")
                          : "-"}
                      </span>
                      <span className="text-small text-muted-foreground">
                        {rc.disposition || "No disposition"}
                      </span>
                      <span className="text-small font-mono">
                        {formatDuration(rc.duration_seconds)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
