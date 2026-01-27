import * as React from "react";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

interface StatsCounterProps {
  stats: StatItem[];
  className?: string;
}

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start]);

  return count;
}

function StatCounter({ stat, inView }: { stat: StatItem; inView: boolean }) {
  const count = useCountUp(stat.value, 2000, inView);

  return (
    <div className="text-center">
      <div className="text-display font-bold text-content tabular-nums">
        {stat.prefix}
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="text-body text-content-secondary mt-2">{stat.label}</div>
    </div>
  );
}

export function StatsCounter({ stats, className }: StatsCounterProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section ref={ref} className={cn("py-16 bg-surface-secondary/50", className)}>
      <div className="container mx-auto px-md">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              <StatCounter stat={stat} inView={inView} />
              {index < stats.length - 1 && (
                <div className="hidden md:block h-16 w-px bg-border" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
