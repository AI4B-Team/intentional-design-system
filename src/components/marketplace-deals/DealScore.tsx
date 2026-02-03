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
    sm: { container: 80, stroke: 6, fontSize: 'text-2xl' },
    md: { container: 120, stroke: 8, fontSize: 'text-4xl' },
    lg: { container: 160, stroke: 10, fontSize: 'text-5xl' },
  };
  
  const config = sizes[size];
  const radius = (config.container - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return { gradient: 'from-emerald-400 to-emerald-600', stroke: 'stroke-emerald-500' };
    if (score >= 60) return { gradient: 'from-blue-400 to-indigo-500', stroke: 'stroke-blue-500' };
    if (score >= 40) return { gradient: 'from-amber-400 to-orange-500', stroke: 'stroke-amber-500' };
    return { gradient: 'from-red-400 to-red-600', stroke: 'stroke-red-500' };
  };
  
  const colors = getScoreColor(score);

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
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'info':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900",
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
            className="text-slate-700"
          />
        </svg>
        
        {/* Gradient progress ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={config.container}
          height={config.container}
        >
          <defs>
            <linearGradient id={`scoreGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <circle
            cx={config.container / 2}
            cy={config.container / 2}
            r={radius}
            fill="none"
            stroke={`url(#scoreGradient-${score})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80 rounded-full m-2">
          <span className={cn("font-bold text-white", config.fontSize)}>
            {score}
          </span>
          <span className="text-xs uppercase tracking-widest text-slate-400">
            Score
          </span>
        </div>
      </div>

      {/* Badges */}
      {showBadges && displayBadges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {displayBadges.slice(0, 4).map((badge, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className={cn(
                "text-xs font-medium border rounded-full px-3 py-1",
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

// Simple inline version for cards
export function DealScoreInline({ score, className }: { score: number; className?: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
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
