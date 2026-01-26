// Chart theme configuration for Recharts
// Use these styles and colors for consistent data visualization

export const chartColors = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  tertiary: "hsl(var(--chart-3))",
  quaternary: "hsl(var(--chart-4))",
  quinary: "hsl(var(--chart-5))",
} as const;

export const chartColorArray = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const chartTheme = {
  // Grid styling
  grid: {
    stroke: "hsl(var(--border-subtle))",
    strokeDasharray: "3 3",
  },
  
  // Axis styling
  axis: {
    stroke: "hsl(var(--border))",
    fontSize: 12,
    fontFamily: "Inter, sans-serif",
    fill: "hsl(var(--muted-foreground))",
  },
  
  // Tooltip styling
  tooltip: {
    contentStyle: {
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px",
      boxShadow: "0 10px 15px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.02)",
      padding: "12px 16px",
    },
    labelStyle: {
      color: "hsl(var(--foreground))",
      fontWeight: 600,
      marginBottom: "4px",
    },
    itemStyle: {
      color: "hsl(var(--muted-foreground))",
      fontSize: "13px",
    },
  },
  
  // Legend styling
  legend: {
    iconSize: 8,
    iconType: "circle" as const,
    wrapperStyle: {
      paddingTop: "16px",
    },
    formatter: (value: string) => (
      `<span style="color: hsl(var(--foreground)); font-size: 13px;">${value}</span>`
    ),
  },
  
  // Cursor/crosshair styling
  cursor: {
    stroke: "hsl(var(--accent))",
    strokeWidth: 1,
    strokeDasharray: "4 4",
  },
};

// CSS custom properties for charts (to be used in components)
export const chartStyles = `
  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line {
    stroke: hsl(var(--border-subtle));
  }
  
  .recharts-text {
    fill: hsl(var(--muted-foreground));
    font-size: 12px;
  }
  
  .recharts-legend-item-text {
    color: hsl(var(--foreground)) !important;
    font-size: 13px;
  }
  
  .recharts-tooltip-cursor {
    fill: hsl(var(--accent) / 0.1);
  }
  
  .recharts-active-dot {
    stroke: hsl(var(--background));
    stroke-width: 2;
  }
`;

// Utility function to get color by index
export function getChartColor(index: number): string {
  return chartColorArray[index % chartColorArray.length];
}

// Heat map colors for property scoring
export const heatMapColors = {
  hot: "hsl(var(--heat-hot))",
  warm: "hsl(var(--heat-warm))",
  moderate: "hsl(var(--heat-moderate))",
  cool: "hsl(var(--heat-cool))",
  cold: "hsl(var(--heat-cold))",
};

export function getHeatColor(score: number): string {
  if (score >= 800) return heatMapColors.hot;
  if (score >= 600) return heatMapColors.warm;
  if (score >= 400) return heatMapColors.moderate;
  if (score >= 200) return heatMapColors.cool;
  return heatMapColors.cold;
}
