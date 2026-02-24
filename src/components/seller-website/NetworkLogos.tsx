import React from "react";

// Well-known network/media logos rendered as styled text with distinctive fonts
// For a production app you'd use actual SVG logos, but these styled versions
// are recognisable and royalty-free.

const LOGO_CONFIGS: Record<string, { label: string; className: string; style?: React.CSSProperties }> = {
  forbes: {
    label: "Forbes",
    className: "font-serif italic font-bold tracking-tight",
    style: { fontFamily: "'Georgia', serif" },
  },
  nbc: {
    label: "NBC",
    className: "font-black tracking-widest uppercase",
  },
  cbs: {
    label: "CBS",
    className: "font-bold tracking-wider uppercase",
  },
  fox: {
    label: "FOX",
    className: "font-black italic tracking-tight uppercase",
  },
  abc: {
    label: "abc",
    className: "font-bold lowercase tracking-tight",
  },
  cnn: {
    label: "CNN",
    className: "font-black italic tracking-tight uppercase",
  },
  hgtv: {
    label: "HGTV",
    className: "font-extrabold tracking-wider uppercase",
  },
  realtor: {
    label: "Realtor.com",
    className: "font-bold tracking-tight",
  },
  zillow: {
    label: "Zillow",
    className: "font-extrabold tracking-tight",
  },
  yahoo: {
    label: "Yahoo!",
    className: "font-black italic tracking-tight",
    style: { fontFamily: "'Georgia', serif" },
  },
  bbb: {
    label: "BBB",
    className: "font-black tracking-widest uppercase",
  },
};

function normalise(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface NetworkLogoProps {
  name: string;
  /** Font size class e.g. "text-xs" or "text-xl" */
  sizeClass?: string;
  colorClass?: string;
}

export function NetworkLogo({ name, sizeClass = "text-base", colorClass = "text-gray-800" }: NetworkLogoProps) {
  const key = normalise(name);
  const config = LOGO_CONFIGS[key];

  if (config) {
    return (
      <span
        className={`${config.className} ${sizeClass} ${colorClass} whitespace-nowrap select-none`}
        style={config.style}
      >
        {config.label}
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
