import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Full-page notice shown when we can't load the workspace at all. */
export function ConnectionTroubleScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-warning/15 text-warning flex items-center justify-center">
          <WifiOff className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Can't Reach The Server</h1>
        <p className="text-sm text-muted-foreground">
          Your data is safe. The server is responding slowly right now — we'll keep retrying automatically.
        </p>
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

/** Small non-blocking pill shown while the app keeps working from last-known data. */
export function ConnectionTroubleBanner() {
  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 rounded-full border border-warning/40 bg-warning-muted px-4 py-2 text-xs font-medium text-foreground shadow-lg"
    >
      <WifiOff className="h-3.5 w-3.5 text-warning" />
      Connection Trouble — Showing Last-Known Data, Retrying…
    </div>
  );
}
