import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DealScoreProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showBadges?: boolean;
  badges?: { label: string; variant: 'success' | 'warning' | 'info' | 'default' }[];
  className?: string;
}

export function DealScore({ 
  score, 
  size = 'md', 
  showBadges = true,
  badges,
  className 
}: DealScoreProps) {
  // Calculate the stroke-dashoffset for the progress ring
  const sizes = {
    sm: { container: 80, stroke: 6, fontSize: 'text-2xl', innerPadding: 6 },
    md: { container: 140, stroke: 10, fontSize: 'text-5xl', innerPadding: 10 },
    lg: { container: 180, stroke: 12, fontSize: 'text-6xl', innerPadding: 12 },
  };
  
  const config = sizes[size];
  const radius = (config.container - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  // Determine gradient colors based on score: red (bad), yellow (good), green (great)
  const getGradientColors = (score: number) => {
    if (score >= 70) {
      // Great - Green gradient
      return {
        start: 'hsl(142, 76%, 36%)', // emerald-600
        mid: 'hsl(152, 76%, 40%)',
        end: 'hsl(160, 84%, 39%)',
        glow: 'hsl(142, 76%, 36%)',
      };
    }
    if (score >= 40) {
      // Good - Yellow/Amber gradient
      return {
        start: 'hsl(45, 93%, 47%)', // amber-500
        mid: 'hsl(38, 92%, 50%)',
        end: 'hsl(32, 95%, 44%)',
        glow: 'hsl(45, 93%, 47%)',
      };
    }
    // Bad - Red gradient
    return {
      start: 'hsl(0, 84%, 60%)', // red-500
      mid: 'hsl(0, 72%, 51%)',
      end: 'hsl(0, 74%, 42%)',
      glow: 'hsl(0, 84%, 60%)',
    };
  };
  
  const gradientColors = getGradientColors(score);
  const gradientId = `scoreGradient-${score}-${Math.random().toString(36).substr(2, 9)}`;

  // Default badges based on score categories
  const defaultBadges = [
    ...(score >= 70 ? [{ label: 'Strong Cash Flow', variant: 'success' as const }] : []),
    ...(score >= 75 ? [{ label: 'Low Risk', variant: 'success' as const }] : []),
    ...(score >= 60 ? [{ label: `${(score * 0.08).toFixed(1)}% Cap`, variant: 'info' as const }] : []),
    ...(score >= 80 ? [{ label: 'A+ Location', variant: 'warning' as const }] : []),
  ];

  const displayBadges = badges || defaultBadges;

  const getBadgeStyles = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'bg-success/15 text-success border-success/40 hover:bg-success/25';
      case 'warning':
        return 'bg-warning/15 text-warning border-warning/40 hover:bg-warning/25';
      case 'info':
        return 'bg-primary/15 text-primary border-primary/40 hover:bg-primary/25';
      default:
        return 'bg-muted text-muted-foreground border-border hover:bg-muted/80';
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center gap-5 p-8 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50",
      className
    )}>
      {/* Circular Score Ring */}
      <div className="relative" style={{ width: config.container, height: config.container }}>
        {/* Background ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={config.container}
          height={config.container}
        >
          <circle
            cx={config.container / 2}
            cy={config.container / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-border/50"
          />
        </svg>
        
        {/* Gradient progress ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={config.container}
          height={config.container}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradientColors.start} />
              <stop offset="50%" stopColor={gradientColors.mid} />
              <stop offset="100%" stopColor={gradientColors.end} />
            </linearGradient>
          </defs>
          <circle
            cx={config.container / 2}
            cy={config.container / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
          />
        </svg>
        
        {/* Center content - dark circle with score */}
        <div 
          className="absolute flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 shadow-inner"
          style={{ 
            top: config.innerPadding, 
            left: config.innerPadding, 
            right: config.innerPadding, 
            bottom: config.innerPadding 
          }}
        >
          <span className={cn("font-bold text-white tabular-nums leading-none", config.fontSize)}>
            {score}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1">
            Score
          </span>
        </div>
      </div>

      {/* Badges */}
      {showBadges && displayBadges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2.5">
          {displayBadges.slice(0, 4).map((badge, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className={cn(
                "text-xs font-medium border rounded-full px-4 py-1.5 transition-colors",
                getBadgeStyles(badge.variant)
              )}
            >
              {badge.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact inline version for property detail headers
export function DealScoreCompact({ score, className }: { score: number; className?: string }) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const gradientId = `scoreGradientCompact-${Math.random().toString(36).substr(2, 9)}`;

  // Determine gradient colors based on score: red (bad), yellow (good), green (great)
  const getGradientColors = (score: number) => {
    if (score >= 70) {
      return { start: 'hsl(142, 76%, 36%)', end: 'hsl(160, 84%, 39%)' };
    }
    if (score >= 40) {
      return { start: 'hsl(45, 93%, 47%)', end: 'hsl(32, 95%, 44%)' };
    }
    return { start: 'hsl(0, 84%, 60%)', end: 'hsl(0, 74%, 42%)' };
  };
  
  const gradientColors = getGradientColors(score);

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-border/50"
        />
      </svg>
      
      {/* Progress ring */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientColors.start} />
            <stop offset="100%" stopColor={gradientColors.end} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      
      {/* Center */}
      <div className="absolute inset-[5px] flex items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900">
        <span className="text-lg font-bold text-white tabular-nums">{score}</span>
      </div>
    </div>
  );
}

// Simple inline version for cards
export function DealScoreInline({ score, className }: { score: number; className?: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("text-2xl font-bold tabular-nums", getScoreColor(score))}>
        {score}
      </div>
      <div className="text-xs text-muted-foreground">
        <div className="font-medium">{getLabel(score)}</div>
        <div>Deal Score</div>
      </div>
    </div>
  );
}
