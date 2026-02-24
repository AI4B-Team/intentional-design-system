import React from "react";

// US state abbreviations and names
export const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington DC",
};

// Simplified SVG paths for each US state (approximate boundaries)
const STATE_PATHS: Record<string, string> = {
  AL: "M628,396 L628,453 L621,466 L630,473 L628,480 L607,480 L604,468 L604,396Z",
  AK: "M120,462 L133,462 L138,455 L155,455 L160,463 L180,463 L185,470 L175,478 L160,480 L140,483 L125,480 L115,475Z",
  AZ: "M205,390 L260,390 L268,453 L242,470 L205,470 L198,420Z",
  AR: "M555,400 L600,397 L604,398 L604,445 L555,448 L552,415Z",
  CA: "M120,270 L150,260 L170,290 L182,340 L192,380 L200,420 L190,450 L170,450 L140,420 L120,370Z",
  CO: "M275,290 L360,290 L360,345 L275,345Z",
  CT: "M810,210 L835,200 L840,210 L835,225 L815,225Z",
  DE: "M770,280 L780,275 L785,295 L775,300Z",
  FL: "M630,475 L670,465 L710,470 L720,480 L710,510 L690,535 L665,538 L660,520 L640,510 L625,495 L615,480Z",
  GA: "M635,396 L680,390 L690,395 L695,455 L670,465 L635,470 L628,453Z",
  HI: "M260,490 L275,485 L285,490 L280,500 L265,500Z",
  ID: "M210,155 L250,145 L260,180 L255,240 L230,260 L210,240 L205,200Z",
  IL: "M580,260 L600,258 L610,280 L615,320 L608,355 L595,370 L580,360 L570,320 L575,280Z",
  IN: "M615,270 L640,268 L645,330 L640,360 L615,365 L610,325Z",
  IA: "M500,240 L565,235 L575,260 L570,290 L505,295 L495,265Z",
  KS: "M390,320 L490,315 L495,365 L390,370Z",
  KY: "M610,340 L690,320 L710,335 L700,360 L650,370 L610,365Z",
  LA: "M545,455 L600,448 L604,468 L600,490 L575,505 L555,500 L540,490 L540,465Z",
  ME: "M830,115 L850,105 L860,120 L858,160 L840,175 L825,160Z",
  MD: "M730,280 L770,270 L785,285 L780,300 L750,305 L730,295Z",
  MA: "M815,195 L845,185 L855,192 L845,200 L815,205Z",
  MI: "M590,170 L620,155 L645,170 L650,210 L640,240 L620,250 L600,240 L595,210Z",
  MN: "M480,130 L545,125 L550,195 L540,230 L500,235 L485,210 L480,160Z",
  MS: "M580,400 L604,396 L604,468 L600,480 L580,478 L572,440Z",
  MO: "M505,300 L570,295 L580,310 L595,370 L570,385 L545,395 L530,375 L505,370 L500,340Z",
  MT: "M230,115 L350,105 L355,170 L260,180 L235,165Z",
  NE: "M365,260 L485,255 L495,265 L495,300 L390,310 L365,300Z",
  NV: "M175,230 L215,220 L230,260 L225,340 L200,370 L175,340Z",
  NH: "M825,140 L840,135 L842,175 L830,190 L818,180Z",
  NJ: "M780,240 L795,230 L800,260 L790,285 L778,278Z",
  NM: "M240,380 L330,375 L338,455 L268,460 L260,445Z",
  NY: "M730,170 L780,150 L810,165 L815,200 L790,225 L760,230 L730,230 L720,200Z",
  NC: "M660,355 L760,340 L775,355 L760,370 L700,380 L660,385Z",
  ND: "M370,130 L475,125 L480,185 L370,190Z",
  OH: "M645,260 L690,245 L710,270 L710,320 L690,330 L650,335 L640,305Z",
  OK: "M370,375 L385,370 L490,365 L500,340 L510,375 L545,395 L535,415 L420,420 L380,420 L370,400Z",
  OR: "M130,155 L205,140 L215,155 L210,215 L175,230 L135,225 L120,195Z",
  PA: "M700,225 L770,215 L785,230 L780,270 L730,280 L700,275Z",
  RI: "M835,210 L845,205 L848,218 L840,222Z",
  SC: "M670,380 L720,365 L740,380 L720,400 L690,405 L675,395Z",
  SD: "M370,190 L475,185 L480,210 L485,252 L370,258Z",
  TN: "M580,365 L690,348 L700,360 L690,380 L610,390 L580,395Z",
  TX: "M330,390 L420,420 L460,425 L535,415 L555,448 L545,480 L530,510 L500,530 L470,540 L430,530 L400,510 L370,490 L340,465 L330,430Z",
  UT: "M230,260 L275,255 L280,290 L275,345 L235,350 L225,340Z",
  VT: "M808,140 L825,135 L825,180 L815,195 L805,180Z",
  VA: "M680,310 L760,290 L780,305 L775,335 L760,345 L700,355 L680,345Z",
  WA: "M140,95 L210,85 L218,140 L205,155 L140,160Z",
  WV: "M690,290 L720,280 L730,300 L720,330 L700,340 L685,330 L680,310Z",
  WI: "M535,155 L580,150 L595,180 L590,230 L570,250 L540,255 L530,225 L525,185Z",
  WY: "M260,195 L355,185 L360,250 L265,255Z",
  DC: "M755,295 L760,292 L762,298 L757,300Z",
};

interface USStateMapProps {
  selectedStates: string[];
  onToggleState: (stateCode: string) => void;
  primaryColor?: string;
  size?: "sm" | "md";
}

export function USStateMap({ selectedStates, onToggleState, primaryColor = "#2563eb", size = "md" }: USStateMapProps) {
  const viewBox = "100 70 780 480";
  const w = size === "sm" ? "100%" : "100%";
  const h = size === "sm" ? 180 : 280;

  return (
    <svg
      viewBox={viewBox}
      width={w}
      height={h}
      className="select-none"
      style={{ maxWidth: "100%" }}
    >
      {Object.entries(STATE_PATHS).map(([code, d]) => {
        const isSelected = selectedStates.includes(code);
        return (
          <path
            key={code}
            d={d}
            fill={isSelected ? primaryColor : "hsl(var(--muted))"}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            className="cursor-pointer transition-colors hover:opacity-80"
            onClick={() => onToggleState(code)}
          >
            <title>{US_STATES[code]}</title>
          </path>
        );
      })}
    </svg>
  );
}
