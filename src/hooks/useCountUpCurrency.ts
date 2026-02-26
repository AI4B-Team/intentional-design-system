import { useCountUp } from './useCountUp';

export function useCountUpCurrency(
  target: number,
  duration: number = 1400,
  delay: number = 0,
  enabled: boolean = true
): string {
  const count = useCountUp(target, duration, delay, enabled);
  if (count >= 1000000) return `$${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `$${(count / 1000).toFixed(0)}K`;
  return `$${count.toLocaleString()}`;
}
