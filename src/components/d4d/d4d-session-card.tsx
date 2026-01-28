import { formatDistanceToNow, format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Car, 
  MapPin, 
  Camera,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import { formatDuration } from '@/lib/format-duration';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type DrivingSession = Database['public']['Tables']['driving_sessions']['Row'];

interface D4DSessionCardProps {
  session: DrivingSession;
  onClick?: () => void;
}

export function D4DSessionCard({ session, onClick }: D4DSessionCardProps) {
  const routeCoords = session.route_coordinates as Array<{ lat: number; lng: number }> | null;
  const hasRoute = routeCoords && routeCoords.length > 0;

  const getStatusBadge = () => {
    switch (session.status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
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

  const sessionDate = session.started_at ? new Date(session.started_at) : new Date();

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99]",
        session.status === 'active' && "ring-2 ring-success"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Date and Status */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm text-muted-foreground">
              {format(sessionDate, 'EEEE, MMMM d, yyyy')}
            </p>
            <h3 className="font-semibold">
              {session.name || 'Driving Session'}
            </h3>
          </div>
          {getStatusBadge()}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(session.total_duration_seconds || 0)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Car className="h-4 w-4" />
            <span>{(session.total_miles || 0).toFixed(1)} mi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{session.properties_tagged || 0} tagged</span>
          </div>
          {(session.photos_taken || 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <Camera className="h-4 w-4" />
              <span>{session.photos_taken}</span>
            </div>
          )}
        </div>

        {/* Route preview placeholder */}
        {hasRoute && (
          <div className="mt-3 h-24 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
            <div className="text-xs text-muted-foreground">Route preview</div>
          </div>
        )}

        {/* Time ago */}
        <p className="text-xs text-muted-foreground mt-3">
          {formatDistanceToNow(sessionDate, { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  );
}
