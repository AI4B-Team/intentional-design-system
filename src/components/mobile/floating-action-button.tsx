import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon = <Plus className="h-6 w-6" />,
  label,
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fab bg-brand text-white hover:bg-brand/90 active:scale-95 transition-all lg:hidden",
        className
      )}
      aria-label={label || "Add new"}
    >
      {icon}
    </button>
  );
}
