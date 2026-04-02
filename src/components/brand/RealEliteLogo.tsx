import * as React from "react";
import { cn } from "@/lib/utils";

interface RealEliteLogoProps {
  className?: string;
  /** Width of the logo badge in pixels */
  width?: number;
  /** @deprecated Use width instead. Kept for backward compat — maps to width. */
  height?: number;
  /** Color prop kept for backward compat (ignored — uses design tokens) */
  color?: string;
  /** Show icon-only mode (just the "RE" mark) */
  iconOnly?: boolean;
}

/**
 * RealElite badge logo — accent-colored rectangle with bordered inner frame,
 * "REAL" in large bold text and "ELITE" in small tracked text below.
 * Matches the REAL CREATOR logo style from AI4B-Team/real-art.
 */
export const RealEliteLogo = React.forwardRef<HTMLDivElement, RealEliteLogoProps>(
  ({ className, width: widthProp, height, iconOnly = false, color: _color }, ref) => {
    const width = widthProp ?? (height ? height * (140 / 24) : 140);
    const scale = width / 140;

    if (iconOnly) {
      const iconSize = Math.max(32, width * 0.3);
      return (
        <div
          ref={ref}
          className={cn("shrink-0 inline-flex items-center justify-center select-none bg-primary", className)}
          style={{
            width: iconSize,
            height: iconSize * 1.1,
            padding: `${3 * (iconSize / 32)}px`,
          }}
          aria-label="RealElite"
        >
          <div
            className="border-[2px] border-primary-foreground flex items-center justify-center w-full h-full"
          >
            <span
              className="text-primary-foreground font-sans leading-none text-center block"
              style={{
                fontSize: `${iconSize * 0.45}px`,
                fontWeight: 900,
                letterSpacing: "0.05em",
              }}
            >
              RE
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("shrink-0 inline-flex items-center justify-center select-none bg-primary", className)}
        style={{
          width: `${width}px`,
          padding: `${7 * scale}px`,
        }}
        aria-label="RealElite"
      >
        <div
          className="border-primary-foreground flex flex-col items-center w-full"
          style={{
            borderWidth: `${2.5 * scale}px`,
            borderStyle: "solid",
            paddingTop: `${6 * scale}px`,
            paddingBottom: `${6 * scale}px`,
            paddingLeft: `${18 * scale}px`,
            paddingRight: `${18 * scale}px`,
          }}
        >
          <span
            className="text-primary-foreground font-sans leading-none text-center block"
            style={{
              fontSize: `${2.1 * 16 * scale}px`,
              fontWeight: 900,
              letterSpacing: "0.05em",
            }}
          >
            REAL
          </span>
          <span
            className="text-primary-foreground font-sans uppercase text-center block"
            style={{
              fontSize: `${0.52 * 16 * scale}px`,
              fontWeight: 700,
              letterSpacing: "0.3em",
              marginTop: `${3 * scale}px`,
              lineHeight: 1,
            }}
          >
            ELITE
          </span>
        </div>
      </div>
    );
  }
);

RealEliteLogo.displayName = "RealEliteLogo";
