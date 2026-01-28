import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AutoDialCountdownProps {
  seconds: number;
  contactName?: string;
  onCancel: () => void;
  onComplete: () => void;
}

export function AutoDialCountdown({
  seconds,
  contactName,
  onCancel,
  onComplete,
}: AutoDialCountdownProps) {
  const [remaining, setRemaining] = React.useState(seconds);

  React.useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [remaining, onComplete]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4 shadow-2xl">
        <div className="mb-6">
          <div className="text-7xl font-bold text-primary mb-2 animate-pulse">
            {remaining}
          </div>
          <p className="text-lg text-muted-foreground">
            Calling next in {remaining} second{remaining !== 1 ? "s" : ""}...
          </p>
          {contactName && (
            <p className="text-body font-medium text-foreground mt-2">
              Next: {contactName}
            </p>
          )}
        </div>

        <Button
          variant="destructive"
          size="lg"
          onClick={onCancel}
          className="w-full gap-2"
        >
          <X className="h-5 w-5" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
