import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Car, Route, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type D4DArea = Database['public']['Tables']['d4d_areas']['Row'];

interface D4DAreaCardProps {
  area: D4DArea;
  onStartDriving?: () => void;
  onViewDetails?: () => void;
  onToggleFavorite?: () => void;
}

export function D4DAreaCard({
  area,
  onStartDriving,
  onViewDetails,
  onToggleFavorite,
}: D4DAreaCardProps) {
  const colorClass = area.color || 'hsl(var(--primary))';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colorClass }}
            />
            <h3 className="font-semibold">{area.name}</h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className="p-1"
          >
            <Star
              className={cn(
                'h-5 w-5 transition-colors',
                area.is_favorite
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30 hover:text-amber-400'
              )}
            />
          </button>
        </div>

        {/* Description */}
        {area.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            "{area.description}"
          </p>
        )}

        {/* Mini map placeholder */}
        <div className="h-24 rounded-lg bg-muted/50 mb-3 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-muted-foreground/40" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Navigation className="h-3.5 w-3.5" />
            <span>{area.times_driven || 0} drives</span>
          </div>
          <div className="flex items-center gap-1">
            <Route className="h-3.5 w-3.5" />
            <span>{(area.total_miles_driven || 0).toFixed(1)} mi</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{area.properties_tagged || 0} properties</span>
          </div>
        </div>

        {/* Last driven */}
        {area.last_driven_at && (
          <p className="text-xs text-muted-foreground mb-3">
            Last: {formatDistanceToNow(new Date(area.last_driven_at), { addSuffix: true })}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" size="sm" onClick={onStartDriving}>
            <Car className="h-4 w-4 mr-2" />
            Start Driving
          </Button>
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
