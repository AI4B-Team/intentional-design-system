import React from "react";

/** Inline SVG logos for well-known media brands. These are simplified, recognisable
 *  representations — not the actual trademarked assets.  For production you'd
 *  license the real logos or use the brand's official press-kit SVGs. */

interface NetworkLogoProps {
  name: string;
  /** Tailwind size class, e.g. "text-xs" or "text-xl" — used as a rough
   *  height guide (maps to an explicit pixel height). */
  sizeClass?: string;
  colorClass?: string;
}

const SIZE_MAP: Record<string, number> = {
  "text-[9px]": 14,
  "text-xs": 18,
  "text-sm": 22,
  "text-base": 26,
  "text-lg": 30,
  "text-xl": 34,
  "text-2xl": 40,
};

function h(cls: string) {
  return SIZE_MAP[cls] ?? 26;
}

function normalise(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

/* ---------- Individual logo SVGs ---------- */

function ForbesLogo({ height, color }: { height: number; color: string }) {
  return (
    <svg height={height} viewBox="0 0 200 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text
        x="0"
        y="42"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="bold"
        fontStyle="italic"
        fontSize="50"
        fill={color}
        letterSpacing="-1"
      >
        Forbes
      </text>
    </svg>
  );
}

function NBCLogo({ height }: { height: number }) {
  return (
    <svg height={height} viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Peacock feathers */}
      <path d="M20 2 L28 18 L22 18Z" fill="#F6BE00" />
      <path d="M28 18 L34 18 L28 2Z" fill="#FF6600" />
      <path d="M34 18 L40 6 L28 18Z" fill="#CC0000" />
      <path d="M34 18 L40 26 L34 18Z" fill="#6600CC" />
      <path d="M28 18 L22 26 L16 18Z" fill="#009900" />
      <path d="M28 18 L22 18 L16 10Z" fill="#0066CC" />
      {/* Body */}
      <ellipse cx="28" cy="20" rx="3" ry="4" fill="#999" />
      <text x="52" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="22" fill="currentColor" letterSpacing="3">
        NBC
      </text>
    </svg>
  );
}

function CBSLogo({ height, color }: { height: number; color: string }) {
  return (
    <svg height={height} viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Eye icon */}
      <ellipse cx="20" cy="20" rx="14" ry="10" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="20" cy="20" r="5" fill={color} />
      <text x="40" y="28" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="22" fill={color} letterSpacing="2">
        CBS
      </text>
    </svg>
  );
}

function FoxLogo({ height, color }: { height: number; color: string }) {
  return (
    <svg height={height} viewBox="0 0 100 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text
        x="0"
        y="36"
        fontFamily="Arial Black, Impact, sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="42"
        fill={color}
        letterSpacing="-1"
      >
        FOX
      </text>
    </svg>
  );
}

function ABCLogo({ height, color }: { height: number; color: string }) {
  return (
    <svg height={height} viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill={color} />
      <text x="8" y="27" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="18" fill="white" letterSpacing="0">
        abc
      </text>
      <text x="48" y="28" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="22" fill={color} letterSpacing="1">
        ABC
      </text>
    </svg>
  );
}

function CNNLogo({ height, color }: { height: number; color: string }) {
  return (
    <svg height={height} viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text
        x="0"
        y="34"
        fontFamily="'CNN Sans', Arial Black, Impact, sans-serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="38"
        fill={color}
        letterSpacing="2"
      >
        CNN
      </text>
    </svg>
  );
}

function HGTVLogo({ height, color }: { height: number; color: string }) {
  return (
    <svg height={height} viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text
        x="0"
        y="30"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="32"
        fill={color}
        letterSpacing="3"
      >
        HGTV
      </text>
    </svg>
  );
}

function YahooLogo({ height, color }: { height: number; color: string }) {
  return (
    <svg height={height} viewBox="0 0 130 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text
        x="0"
        y="36"
        fontFamily="Georgia, 'Palatino Linotype', serif"
        fontWeight="900"
        fontStyle="italic"
        fontSize="38"
        fill={color}
        letterSpacing="-1"
      >
        Yahoo!
      </text>
    </svg>
  );
}

/* ---------- Registry ---------- */

const LOGO_COMPONENTS: Record<string, React.FC<{ height: number; color: string }>> = {
  forbes: ForbesLogo,
  nbc: ({ height }) => <NBCLogo height={height} />,
  cbs: CBSLogo,
  fox: FoxLogo,
  abc: ABCLogo,
  cnn: CNNLogo,
  hgtv: HGTVLogo,
  yahoo: YahooLogo,
};

export function NetworkLogo({ name, sizeClass = "text-base", colorClass = "text-gray-800" }: NetworkLogoProps) {
  const key = normalise(name);
  const height = h(sizeClass);

  // Map colorClass to a CSS colour value for SVG fill
  const colorMap: Record<string, string> = {
    "text-gray-800": "#1f2937",
    "text-foreground": "currentColor",
    "text-gray-600": "#4b5563",
    "text-gray-500": "#6b7280",
    "text-gray-400": "#9ca3af",
  };
  const color = colorMap[colorClass] || "currentColor";

  const Comp = LOGO_COMPONENTS[key];
  if (Comp) {
    return (
      <span className={`inline-flex items-center justify-center whitespace-nowrap select-none ${colorClass}`} style={{ height }}>
        <Comp height={height} color={color} />
      </span>
    );
  }

  // Fallback: render as bold uppercase text
  return (
    <span className={`font-extrabold uppercase tracking-tight ${sizeClass} ${colorClass} whitespace-nowrap select-none`}>
      {name}
    </span>
  );
}
