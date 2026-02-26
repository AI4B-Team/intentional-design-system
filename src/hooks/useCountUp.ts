import { useState, useEffect, useRef } from 'react';

export function useCountUp(
  target: number,
  duration: number = 1200,
  delay: number = 0,
  enabled: boolean = true
): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (!enabled || target === 0) {
      setCount(target);
      return;
    }

    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startTimeRef.current = undefined;
    };
  }, [target, duration, delay, enabled]);

  return count;
}
