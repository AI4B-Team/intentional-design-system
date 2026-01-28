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
import { Clock, Car, MapPin, Play } from 'lucide-react';
import { formatDuration } from '@/lib/format-duration';
import type { Database } from '@/integrations/supabase/types';

type DrivingSession = Database['public']['Tables']['driving_sessions']['Row'];

interface D4DIncompleteSessionDialogProps {
  session: DrivingSession | null;
  open: boolean;
  onResume: () => void;
  onEnd: () => void;
}

export function D4DIncompleteSessionDialog({
  session,
  open,
  onResume,
  onEnd,
}: D4DIncompleteSessionDialogProps) {
  if (!session) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-warning" />
            Incomplete Session Found
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>You have an incomplete driving session that wasn't properly ended.</p>
            
            {/* Session Stats */}
            <div className="grid grid-cols-3 gap-3 py-3">
              <div className="text-center p-3 rounded-lg bg-muted">
                <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold">{formatDuration(session.total_duration_seconds || 0)}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <Car className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold">{(session.total_miles || 0).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Miles</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <MapPin className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold">{session.properties_tagged || 0}</p>
                <p className="text-xs text-muted-foreground">Properties</p>
              </div>
            </div>

            <p className="text-sm">
              {session.name || 'Driving Session'}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onEnd}>
            End Session
          </AlertDialogCancel>
          <AlertDialogAction onClick={onResume}>
            Resume Driving
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
