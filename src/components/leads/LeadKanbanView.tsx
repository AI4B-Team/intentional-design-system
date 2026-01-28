import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Phone,
  Mail,
  Eye,
  UserPlus,
  Trash2,
  Flame,
  MapPin,
  GripVertical,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SellerLead } from "@/hooks/useSellerLeads";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";

interface LeadKanbanViewProps {
  leads: SellerLead[];
  onViewDetail: (lead: SellerLead) => void;
  onCall: (phone: string) => void;
  onSms: (lead: SellerLead) => void;
  onEmail: (lead: SellerLead) => void;
  onAddToProperties: (lead: SellerLead) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

const KANBAN_COLUMNS = [
  { id: "new", label: "New", color: "bg-success" },
  { id: "contacted", label: "Contacted", color: "bg-info" },
  { id: "qualified", label: "Qualified", color: "bg-warning" },
  { id: "appointment", label: "Appointment", color: "bg-purple-500" },
  { id: "offer_made", label: "Offer Made", color: "bg-orange-500" },
  { id: "closed", label: "Closed", color: "bg-success" },
  { id: "lost", label: "Lost", color: "bg-destructive" },
];

function KanbanColumn({
  column,
  leads,
  onViewDetail,
  onCall,
  onEmail,
  onAddToProperties,
  onDelete,
}: {
  column: (typeof KANBAN_COLUMNS)[0];
  leads: SellerLead[];
  onViewDetail: (lead: SellerLead) => void;
  onCall: (phone: string) => void;
  onEmail: (lead: SellerLead) => void;
  onAddToProperties: (lead: SellerLead) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-72 flex flex-col bg-muted/30 rounded-lg transition-colors",
        isOver && "bg-brand/10 ring-2 ring-brand ring-inset"
      )}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("w-2.5 h-2.5 rounded-full", column.color)} />
            <span className="font-medium text-sm">{column.label}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {leads.length}
          </Badge>
        </div>
      </div>

      {/* Column Content */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2 min-h-[200px]">
          {leads.map((lead) => (
            <DraggableCard
              key={lead.id}
              lead={lead}
              onViewDetail={onViewDetail}
              onCall={onCall}
              onEmail={onEmail}
              onAddToProperties={onAddToProperties}
              onDelete={onDelete}
            />
          ))}
          {leads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No leads
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function DraggableCard({
  lead,
  onViewDetail,
  onCall,
  onEmail,
  onAddToProperties,
  onDelete,
}: {
  lead: SellerLead;
  onViewDetail: (lead: SellerLead) => void;
  onCall: (phone: string) => void;
  onEmail: (lead: SellerLead) => void;
  onAddToProperties: (lead: SellerLead) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-md border border-border-subtle shadow-sm transition-shadow",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="p-3">
        {/* Drag handle + header */}
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div
                className="flex-1 cursor-pointer"
                onClick={() => onViewDetail(lead)}
              >
                <h4 className="font-medium text-sm line-clamp-1">
                  {lead.full_name ||
                    `${lead.first_name || ""} ${lead.last_name || ""}`.trim() ||
                    "Unknown"}
                </h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="line-clamp-1">{lead.property_address}</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-white">
                  <DropdownMenuItem onClick={() => onViewDetail(lead)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  {lead.phone && (
                    <DropdownMenuItem onClick={() => onCall(lead.phone!)}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </DropdownMenuItem>
                  )}
                  {lead.email && (
                    <DropdownMenuItem onClick={() => onEmail(lead)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onAddToProperties(lead)}
                    disabled={!!lead.property_id}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    To Properties
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(lead.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Score indicator */}
        {lead.auto_score && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  lead.auto_score >= 800
                    ? "bg-destructive"
                    : lead.auto_score >= 600
                    ? "bg-warning"
                    : "bg-info"
                )}
                style={{ width: `${Math.min(100, lead.auto_score / 10)}%` }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums flex items-center gap-0.5">
              {lead.auto_score >= 800 && <Flame className="h-3 w-3 text-destructive" />}
              {lead.auto_score}
            </span>
          </div>
        )}

        {/* Meta */}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          {lead.sell_timeline && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {lead.sell_timeline.replace(/_/g, " ")}
            </Badge>
          )}
          <span>
            {lead.created_at ? format(new Date(lead.created_at), "MMM d") : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function LeadCardOverlay({ lead }: { lead: SellerLead }) {
  return (
    <div className="bg-white rounded-md border border-brand shadow-xl p-3 w-72 opacity-90">
      <h4 className="font-medium text-sm">
        {lead.full_name ||
          `${lead.first_name || ""} ${lead.last_name || ""}`.trim() ||
          "Unknown"}
      </h4>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
        <MapPin className="h-3 w-3" />
        <span className="line-clamp-1">{lead.property_address}</span>
      </div>
    </div>
  );
}

export function LeadKanbanView({
  leads,
  onViewDetail,
  onCall,
  onSms,
  onEmail,
  onAddToProperties,
  onDelete,
  onStatusChange,
}: LeadKanbanViewProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeLead = activeId
    ? leads.find((l) => l.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const newStatus = over.id as string;
      const leadId = active.id as string;
      
      // Only update if dropped on a column (not another card)
      if (KANBAN_COLUMNS.some((col) => col.id === newStatus)) {
        onStatusChange(leadId, newStatus);
      }
    }
  };

  const getLeadsByStatus = (status: string) =>
    leads.filter((l) => (l.status || "new") === status);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="w-full pb-4">
        <div className="flex gap-4 p-1 min-w-max">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              leads={getLeadsByStatus(column.id)}
              onViewDetail={onViewDetail}
              onCall={onCall}
              onEmail={onEmail}
              onAddToProperties={onAddToProperties}
              onDelete={onDelete}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay>
        {activeLead ? <LeadCardOverlay lead={activeLead} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
