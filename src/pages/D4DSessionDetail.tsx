import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  MoreVertical,
  Clock,
  Car,
  MapPin,
  Camera,
  Pencil,
  Trash2,
  Download,
  Play,
  CheckCircle,
  Pause,
  Navigation,
  Star,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { D4DMileageCard } from '@/components/d4d/d4d-mileage-card';
import { D4DPropertyCard } from '@/components/d4d/d4d-property-card';
import { useDrivingSessions } from '@/hooks/useDrivingSessions';
import { formatDuration } from '@/lib/format-duration';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type D4DProperty = Database['public']['Tables']['d4d_properties']['Row'];

export default function D4DSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { useSession, updateSession, deleteSession } = useDrivingSessions();

  const { data, isLoading } = useSession(sessionId);
  const session = data?.session;
  const routePoints = data?.routePoints || [];
  const properties = data?.properties || [];

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full py-16">
          <p className="text-muted-foreground">Session not found</p>
          <Button variant="link" onClick={() => navigate('/d4d/history')}>
            Back to history
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const sessionDate = session.started_at ? new Date(session.started_at) : new Date();

  const getStatusBadge = () => {
    switch (session.status) {
      case 'active':
        return (
          <Badge className="bg-success text-success-foreground">
            <Play className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
            <Pause className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        );
    }
  };

  const handleSaveName = async () => {
    if (editedName.trim()) {
      await updateSession.mutateAsync({
        id: session.id,
        updates: { name: editedName.trim() },
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteSession.mutateAsync(session.id);
    navigate('/d4d/history');
  };

  // Build timeline events
  const timelineEvents = [
    {
      time: session.started_at,
      label: 'Started session',
      icon: Play,
      iconClass: 'text-success',
    },
    ...properties.map((p) => ({
      time: p.tagged_at,
      label: `Tagged ${p.formatted_address || p.street_name || 'property'}`,
      icon: MapPin,
      iconClass: 'text-primary',
      priority: p.priority,
    })),
    ...(session.status === 'completed' && session.ended_at
      ? [{
          time: session.ended_at,
          label: 'Session ended',
          icon: CheckCircle,
          iconClass: 'text-muted-foreground',
        }]
      : []),
  ].sort((a, b) => new Date(a.time || 0).getTime() - new Date(b.time || 0).getTime());

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-background">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/d4d/history')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    <Button size="sm" onClick={handleSaveName}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-lg font-semibold flex items-center gap-2">
                      {session.name || 'Driving Session'}
                      <button
                        onClick={() => {
                          setEditedName(session.name || '');
                          setIsEditing(true);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {format(sessionDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export GPX
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats Row */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold font-mono text-sm">
                  {formatDuration(session.total_duration_seconds || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Car className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold font-mono text-sm">
                  {(session.total_miles || 0).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Miles</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold font-mono text-sm">
                  {session.properties_tagged || 0}
                </p>
                <p className="text-xs text-muted-foreground">Tagged</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Camera className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold font-mono text-sm">
                  {session.photos_taken || 0}
                </p>
                <p className="text-xs text-muted-foreground">Photos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-safe">
          {/* Route Map */}
          <Card>
            <CardContent className="p-0">
              <div className="h-48 bg-muted rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {routePoints.length} route points recorded
                  </p>
                </div>
              </div>
              <div className="p-3 flex gap-2">
                <Button variant="outline" className="flex-1" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Replay Route
                </Button>
                <Button variant="outline" size="sm">
                  View Full Screen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Properties Tagged */}
          {properties.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Properties Tagged ({properties.length})
                  </CardTitle>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() => navigate(`/d4d/properties?session=${session.id}`)}
                  >
                    View All
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-3">
                <ScrollArea className="w-full">
                  <div className="flex gap-3 px-4">
                    {properties.slice(0, 5).map((property) => (
                      <div key={property.id} className="flex-shrink-0 w-64">
                        <D4DPropertyCard
                          property={property as D4DProperty & { driving_sessions?: { name: string } | null }}
                          onClick={() => navigate(`/d4d/properties/${property.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Session Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timelineEvents.slice(0, 10).map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0", event.iconClass)}>
                      <event.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm truncate">{event.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.time ? format(new Date(event.time), 'h:mm a') : ''}
                      </p>
                    </div>
                    {'priority' in event && event.priority && (
                      <div className="flex items-center pt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < event.priority
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/20"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {timelineEvents.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{timelineEvents.length - 10} more events
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mileage Card */}
          <D4DMileageCard
            session={session}
            isInLog={true}
          />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => navigate('/d4d')}
            >
              <Play className="h-4 w-4 mr-2" />
              Start New Session
            </Button>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the session, all route data, and associated property tags. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSession.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
