import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-small",
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-white hover:bg-brand-light hover:shadow-md active:bg-brand [&]:text-white",
        secondary:
          "bg-white border border-border text-content hover:bg-surface-secondary hover:border-border",
        ghost:
          "bg-transparent text-content-secondary hover:bg-surface-tertiary hover:text-content",
        danger:
          "bg-destructive-muted text-destructive border border-destructive/20 hover:bg-red-100",
        // Keep existing variants for backwards compatibility
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:shadow-inner [&]:text-primary-foreground",
        destructive:
          "bg-destructive-muted text-destructive border border-destructive/20 hover:bg-destructive/10",
        outline:
          "border border-border bg-background text-foreground hover:bg-background-secondary hover:border-border",
        link: "text-accent underline-offset-4 hover:underline",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent-hover",
      },
      size: {
        sm: "px-3 py-1.5 text-small",
        md: "px-4 py-2.5 text-body",
        lg: "px-6 py-3 text-body",
        default: "h-10 px-4 py-2",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      icon,
      iconPosition = "left",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    const iconElement = loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : icon ? (
      <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
    ) : null;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {iconElement && iconPosition === "left" && iconElement}
        {children}
        {iconElement && iconPosition === "right" && !loading && iconElement}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
