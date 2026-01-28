import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, 
  Star, 
  Camera, 
  Mic, 
  AlertTriangle,
  Home,
  Clock,
  Check,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type D4DProperty = Database['public']['Tables']['d4d_properties']['Row'];

interface D4DPropertyCardProps {
  property: D4DProperty & { driving_sessions?: { name: string } | null };
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onClick?: () => void;
}

export function D4DPropertyCard({
  property,
  selected = false,
  onSelect,
  onClick,
}: D4DPropertyCardProps) {
  const photos = property.photos as string[] | null;
  const hasPhotos = photos && photos.length > 0;
  const hasVoiceNote = !!property.voice_note_url;

  const getSyncStatusBadge = () => {
    switch (property.sync_status) {
      case 'synced':
        return (
          <Badge variant="outline" className="text-success border-success/30 bg-success/10">
            <Check className="h-3 w-3 mr-1" />
            Synced
          </Badge>
        );
      case 'skipped':
        return (
          <Badge variant="outline" className="text-muted-foreground border-border">
            <XCircle className="h-3 w-3 mr-1" />
            Skipped
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getConditionBadge = () => {
    const conditionMap: Record<string, { label: string; className: string; icon: typeof AlertTriangle }> = {
      distressed: { label: 'Distressed', className: 'text-orange-600 bg-orange-500/10 border-orange-500/30', icon: AlertTriangle },
      vacant: { label: 'Vacant', className: 'text-purple-600 bg-purple-500/10 border-purple-500/30', icon: Home },
      fair: { label: 'Fair', className: 'text-blue-600 bg-blue-500/10 border-blue-500/30', icon: Home },
      poor: { label: 'Poor', className: 'text-red-600 bg-red-500/10 border-red-500/30', icon: AlertTriangle },
    };

    const config = property.condition ? conditionMap[property.condition] : null;
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99]",
        selected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Selection checkbox */}
          {onSelect && (
            <div className="flex items-center" onClick={handleCheckboxClick}>
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onSelect(property.id, checked === true)}
              />
            </div>
          )}

          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {hasPhotos ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                <img
                  src={photos[0]}
                  alt="Property"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Address */}
            <p className="font-medium text-sm line-clamp-1">
              {property.formatted_address || `${property.street_number} ${property.street_name}`}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {property.city}, {property.state} {property.zip}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {getConditionBadge()}
              {getSyncStatusBadge()}
            </div>

            {/* Bottom row: Priority, media icons, time */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {/* Priority stars */}
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-3 w-3",
                        star <= (property.priority || 3)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/20"
                      )}
                    />
                  ))}
                </div>

                {/* Media indicators */}
                {hasPhotos && (
                  <div className="flex items-center text-muted-foreground">
                    <Camera className="h-3 w-3" />
                    <span className="text-xs ml-0.5">{photos.length}</span>
                  </div>
                )}
                {hasVoiceNote && (
                  <Mic className="h-3 w-3 text-muted-foreground" />
                )}
              </div>

              {/* Tagged time */}
              <span className="text-xs text-muted-foreground">
                {property.tagged_at 
                  ? formatDistanceToNow(new Date(property.tagged_at), { addSuffix: true })
                  : 'Recently'
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
