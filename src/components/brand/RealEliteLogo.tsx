import { cn } from "@/lib/utils";

interface RealEliteLogoProps {
  className?: string;
  /** Height in pixels — width scales proportionally (~4.5:1 ratio) */
  height?: number;
  /** Color of the logo text. Defaults to currentColor */
  color?: string;
  /** Show icon-only mode (just the "RE" mark) */
  iconOnly?: boolean;
}

/**
 * RealElite wordmark logo — geometric sans-serif with distinctive angular E cuts.
 * Recreated as inline SVG for crisp rendering at any size.
 */
export function RealEliteLogo({
  className,
  height = 24,
  color = "currentColor",
  iconOnly = false,
}: RealEliteLogoProps) {
  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 40 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        height={height}
        className={cn("shrink-0", className)}
        aria-label="RealElite"
      >
        {/* R */}
        <path
          d="M0 0h3.2v28H0V0zm3.2 0h8.4c3.6 0 6 2.2 6 5.8v1.6c0 2.8-1.4 4.6-3.8 5.4L18 28h-3.6l-4-14.8H3.2v-3h7.8c2 0 3.2-1 3.2-3V5.8c0-2-1.2-3-3.2-3H3.2V0z"
          fill={color}
        />
        {/* E */}
        <path
          d="M20 0h14v3H23.2v9.2H32v3h-8.8V25H34v3H20V0z"
          fill={color}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 272 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      className={cn("shrink-0", className)}
      aria-label="RealElite"
    >
      {/* R */}
      <path
        d="M0 1h4.2v38H0V1zm4.2 0h11c4.8 0 7.8 2.8 7.8 7.6v2c0 3.6-1.8 6-5 7L23 39h-4.8L13 25.2H4.2v-3.4H14c2.6 0 4.2-1.4 4.2-4V8.6c0-2.6-1.6-4.2-4.2-4.2H4.2V1z"
        fill={color}
      />
      {/* E */}
      <path
        d="M28 1h18.5v3.4H32.2v12.2h12v3.4h-12V35.6h14.8V39H28V1z"
        fill={color}
      />
      {/* A */}
      <path
        d="M55 39L68.5 1h4.5L86.5 39H82L78.6 29H60.4L57 39H55zm6.6-13.4h15.8L69.6 5.2h-.2L61.6 25.6z"
        fill={color}
      />
      {/* L */}
      <path
        d="M90 1h4.2v34.6h14.8V39H90V1z"
        fill={color}
      />
      {/* E (second, with distinctive cuts) */}
      <path
        d="M117 1h18.5v3.4H121.2v12.2h12v3.4h-12V35.6h14.8V39H117V1z"
        fill={color}
      />
      {/* L */}
      <path
        d="M144 1h4.2v34.6h14.8V39H144V1z"
        fill={color}
      />
      {/* I */}
      <path
        d="M168 1h4.2v38H168V1z"
        fill={color}
      />
      {/* T */}
      <path
        d="M180 1h20v3.4h-7.9V39H188V4.4h-8V1z"
        fill={color}
      />
      {/* E (third) */}
      <path
        d="M205 1h18.5v3.4H209.2v12.2h12v3.4h-12V35.6h14.8V39H205V1z"
        fill={color}
      />
    </svg>
  );
}
