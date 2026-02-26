import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-body",
        "shadow-inner-sm",
        "placeholder:text-muted-foreground/40",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:border-primary/60",
        "focus-visible:shadow-[0_0_0_3px_hsl(160_84%_39%_/_0.12),inset_0_1px_2px_rgba(0,0,0,0.04)]",
        "hover:border-border/80 hover:shadow-inner-sm",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
