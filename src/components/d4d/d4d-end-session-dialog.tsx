import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Car, MapPin, Clock } from "lucide-react";
import { formatDuration, formatMiles } from "@/lib/format-duration";

interface D4DEndSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration: number;
  miles: number;
  propertiesTagged: number;
  onConfirm: () => void;
}

export function D4DEndSessionDialog({
  open,
  onOpenChange,
  duration,
  miles,
  propertiesTagged,
  onConfirm
}: D4DEndSessionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>End this driving session?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Your session stats will be saved and mileage logged.</p>
              
              {/* Session Stats */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="font-mono font-bold">{formatDuration(duration)}</span>
                  <span className="text-xs text-muted-foreground">Duration</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
                  <Car className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="font-mono font-bold">{formatMiles(miles)}</span>
                  <span className="text-xs text-muted-foreground">Miles</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-muted">
                  <MapPin className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="font-mono font-bold">{propertiesTagged}</span>
                  <span className="text-xs text-muted-foreground">Tagged</span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
          <AlertDialogCancel className="flex-1 mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="flex-1"
            onClick={onConfirm}
          >
            End Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
