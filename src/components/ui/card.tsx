import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-medium text-card-foreground card-inner-highlight", {
  variants: {
    variant: {
      default: "bg-white shadow-card border border-border/60 hover:shadow-card-hover hover:-translate-y-0.5 dark:bg-gradient-to-b dark:from-[hsl(222,47%,10%)] dark:to-[hsl(222,47%,8%)] [transition:all_250ms_cubic-bezier(0.16,1,0.3,1)]",
      elevated: "bg-white shadow-lg border border-border/40 dark:bg-gradient-to-b dark:from-[hsl(222,47%,10%)] dark:to-[hsl(222,47%,8%)] [transition:all_250ms_cubic-bezier(0.16,1,0.3,1)]",
      bordered: "bg-white border border-border",
      interactive:
        "bg-white shadow-card border border-border/60 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20 cursor-pointer card-gloss hover-lift dark:bg-gradient-to-b dark:from-[hsl(222,47%,10%)] dark:to-[hsl(222,47%,8%)] [transition:all_250ms_cubic-bezier(0.16,1,0.3,1)]",
      premium: "relative bg-gradient-to-b from-white to-gray-50/50 overflow-hidden dark:from-[hsl(222,47%,10%)] dark:to-[hsl(222,47%,8%)] [transition:all_250ms_cubic-bezier(0.16,1,0.3,1)]",
    },
    padding: {
      none: "p-0",
      sm: "p-sm",
      md: "p-md",
      lg: "p-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-md", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-h2 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-small text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-md pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-md pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
