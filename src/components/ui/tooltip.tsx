import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>
>(({ children, ...props }, _ref) => {
  const [open, setOpen] = React.useState(false);
  const isPointerOver = React.useRef(false);

  return (
    <TooltipPrimitive.Root
      {...props}
      open={open}
      onOpenChange={(nextOpen) => {
        // Only open on hover (pointer), not on focus
        if (nextOpen && !isPointerOver.current) return;
        setOpen(nextOpen);
      }}
    >
      <div
        onPointerEnter={() => { isPointerOver.current = true; }}
        onPointerLeave={() => { isPointerOver.current = false; setOpen(false); }}
        style={{ display: "contents" }}
      >
        {children}
      </div>
    </TooltipPrimitive.Root>
  );
}) as React.FC<React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>>;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-[200] overflow-hidden rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-content shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
