import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CheckCircle,
  Clock,
  Phone,
  DollarSign,
  FileText,
  XCircle,
  Mail,
  Eye,
  Sparkles,
  GripVertical
} from 'lucide-react';
import { PropertyLead, LeadStatus } from '@/types/property-scout';

interface LeadPipelineManagerProps {
  leads: PropertyLead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus, notifyScout: boolean, message?: string) => void;
  onViewLead: (leadId: string) => void;
}

interface PipelineColumn {
  status: LeadStatus;
  title: string;
  icon: React.ReactNode;
}

const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    status: 'pending_review',
    title: 'Pending Review',
    icon: <Clock className="h-4 w-4" />
  },
  {
    status: 'under_review',
    title: 'Under Review',
    icon: <Eye className="h-4 w-4" />
  },
  {
    status: 'qualified',
    title: 'Qualified',
    icon: <CheckCircle className="h-4 w-4" />
  },
  {
    status: 'contacted_owner',
    title: 'Owner Contacted',
    icon: <Phone className="h-4 w-4" />
  },
  {
    status: 'offer_made',
    title: 'Offer Made',
    icon: <DollarSign className="h-4 w-4" />
  },
  {
    status: 'under_contract',
    title: 'Under Contract',
    icon: <FileText className="h-4 w-4" />
  },
  {
    status: 'closed',
    title: 'Closed',
    icon: <CheckCircle className="h-4 w-4" />
  },
  {
    status: 'disqualified',
    title: 'Disqualified',
    icon: <XCircle className="h-4 w-4" />
  }
];

interface SortableLeadCardProps {
  lead: PropertyLead;
  onView: () => void;
}

const SortableLeadCard: React.FC<SortableLeadCardProps> = ({ lead, onView }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
    >
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div
              {...attributes}
              {...listeners}
              className="mt-1 text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {lead.address.street}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {lead.address.city}, {lead.address.state}
                  </p>
                </div>
                {lead.buyBoxMatches && (
                  <Badge variant="outline" className="text-primary border-primary shrink-0 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Match
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {lead.propertyType?.replace(/_/g, ' ')}
                </Badge>
                {lead.estimatedValue && (
                  <span className="text-xs font-medium text-muted-foreground">
                    ${(lead.estimatedValue / 1000).toFixed(0)}k
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground truncate">
                  By {lead.scoutName}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                  className="h-7 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface DroppableColumnProps {
  column: PipelineColumn;
  leads: PropertyLead[];
  onViewLead: (leadId: string) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, leads, onViewLead }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] max-w-[320px] rounded-lg border transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'bg-muted/30'
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary">{column.icon}</span>
            {column.title}
          </div>
          <Badge variant="secondary">{leads.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {leads.map(lead => (
              <SortableLeadCard
                key={lead.id}
                lead={lead}
                onView={() => onViewLead(lead.id)}
              />
            ))}
          </div>
        </SortableContext>
      </CardContent>
    </div>
  );
};

export const LeadPipelineManager: React.FC<LeadPipelineManagerProps> = ({
  leads,
  onStatusChange,
  onViewLead
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    leadId: string;
    newStatus: LeadStatus;
  } | null>(null);
  const [notifyScout, setNotifyScout] = useState(true);
  const [notificationMessage, setNotificationMessage] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const leadId = active.id as string;
      const newStatus = over.id as LeadStatus;
      
      // Only proceed if dropping on a valid column
      if (PIPELINE_COLUMNS.some(col => col.status === newStatus)) {
        const lead = leads.find(l => l.id === leadId);
        
        if (lead && lead.status !== newStatus) {
          setPendingStatusChange({ leadId, newStatus });
          setShowNotificationDialog(true);
          
          const column = PIPELINE_COLUMNS.find(c => c.status === newStatus);
          if (lead && column) {
            setNotificationMessage(
              `Great news! Your property at ${lead.address.street} has been moved to "${column.title}".`
            );
          }
        }
      }
    }
    
    setActiveId(null);
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      onStatusChange(
        pendingStatusChange.leadId,
        pendingStatusChange.newStatus,
        notifyScout,
        notifyScout ? notificationMessage : undefined
      );
    }
    setShowNotificationDialog(false);
    setPendingStatusChange(null);
    setNotificationMessage('');
  };

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Lead Pipeline</h2>
        <p className="text-muted-foreground text-sm">
          Drag and drop leads to update their status
        </p>
      </div>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map(column => (
            <DroppableColumn
              key={column.status}
              column={column}
              leads={getLeadsByStatus(column.status)}
              onViewLead={onViewLead}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && (
            <Card className="w-[280px] shadow-lg">
              <CardContent className="p-3">
                <p className="font-medium text-sm">
                  {activeLead.address.street}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeLead.address.city}, {activeLead.address.state}
                </p>
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>

      {/* Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notify Scout of Status Change?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  id="notify-scout"
                  checked={notifyScout}
                  onCheckedChange={setNotifyScout}
                />
                <div>
                  <Label htmlFor="notify-scout" className="font-medium">
                    Send Email Notification
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically notify the scout about this status update
                  </p>
                </div>
              </div>
            </div>

            {notifyScout && (
              <div className="space-y-2">
                <Label>Custom Message (Optional)</Label>
                <Textarea
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Add a personalized message for the scout..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This message will be included in the email notification
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNotificationDialog(false);
                setPendingStatusChange(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmStatusChange}>
              {notifyScout ? (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Update & Notify
                </>
              ) : (
                <>Update Status</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
