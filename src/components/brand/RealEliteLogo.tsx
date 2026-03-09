import * as React from "react";
import { cn } from "@/lib/utils";

interface RealEliteLogoProps {
  className?: string;
  /** Height in pixels — scales font size proportionally */
  height?: number;
  /** Color of the logo text. Defaults to currentColor */
  color?: string;
  /** Show icon-only mode (just the "RE" mark) */
  iconOnly?: boolean;
}

/**
 * RealElite text wordmark logo — "REAL Elite" with bold weight on REAL
 * and elegant lighter weight on Elite.
 */
export const RealEliteLogo = React.forwardRef<HTMLSpanElement, RealEliteLogoProps>(
  ({ className, height = 24, color = "currentColor", iconOnly = false }, ref) => {
    const fontSize = height * 0.85;

    if (iconOnly) {
      return (
        <span
          ref={ref}
          className={cn("shrink-0 inline-flex items-center select-none", className)}
          style={{ color, fontSize: fontSize, lineHeight: 1, letterSpacing: "-0.03em" }}
          aria-label="RealElite"
        >
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>RE</span>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn("shrink-0 inline-flex items-baseline select-none", className)}
        style={{ color, fontSize: fontSize, lineHeight: 1, letterSpacing: "-0.02em" }}
        aria-label="RealElite"
      >
        <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, textTransform: "uppercase" }}>
          Real
        </span>
        <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 400, marginLeft: "0.12em" }}>
          Elite
        </span>
      </span>
    );
  }
);

RealEliteLogo.displayName = "RealEliteLogo";
