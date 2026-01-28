import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Star,
  Car,
  MapPin,
  Route,
  Navigation,
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useD4DAreas } from '@/hooks/useD4DAreas';
import { D4DPropertyCard } from '@/components/d4d/d4d-property-card';
import { D4DSessionCard } from '@/components/d4d/d4d-session-card';
import { cn } from '@/lib/utils';

export default function D4DAreaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useArea, deleteArea, toggleFavorite } = useD4DAreas();
  const { data: area, isLoading } = useArea(id);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!area) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full py-16">
          <p className="text-muted-foreground">Area not found</p>
          <Button variant="link" onClick={() => navigate('/d4d/areas')}>
            Back to areas
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleDelete = async () => {
    await deleteArea.mutateAsync(area.id);
    navigate('/d4d/areas');
  };

  const colorStyle = area.color || 'hsl(var(--primary))';

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
                onClick={() => navigate('/d4d/areas')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colorStyle }}
                />
                <h1 className="text-lg font-semibold">{area.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  toggleFavorite.mutate({ id: area.id, isFavorite: !area.is_favorite })
                }
              >
                <Star
                  className={cn(
                    'h-6 w-6 transition-colors',
                    area.is_favorite
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/d4d/areas/${area.id}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Area
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Area
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-safe">
          {/* Description */}
          {area.description && (
            <p className="text-muted-foreground italic">"{area.description}"</p>
          )}

          {/* Map */}
          <Card>
            <CardContent className="p-0">
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Area boundary map</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card>
              <CardContent className="p-3 text-center">
                <Navigation className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{area.times_driven || 0}</p>
                <p className="text-xs text-muted-foreground">Times Driven</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Route className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold font-mono">
                  {(area.total_miles_driven || 0).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Total Miles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <MapPin className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{area.properties_tagged || 0}</p>
                <p className="text-xs text-muted-foreground">Properties</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Car className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {area.last_driven_at
                    ? formatDistanceToNow(new Date(area.last_driven_at), { addSuffix: true })
                    : 'Never'}
                </p>
                <p className="text-xs text-muted-foreground">Last Driven</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions in this area */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Sessions</CardTitle>
                <Button variant="link" size="sm" className="h-auto p-0">
                  View All
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Session history will appear here
              </p>
            </CardContent>
          </Card>

          {/* Action */}
          <Button className="w-full" size="lg" onClick={() => navigate('/d4d')}>
            <Car className="h-5 w-5 mr-2" />
            Start Driving This Area
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this area?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the area. Your driving history and tagged properties
              will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteArea.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
