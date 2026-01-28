import { cn } from '@/lib/utils';

interface D4DHeatMapLegendProps {
  className?: string;
}

export function D4DHeatMapLegend({ className }: D4DHeatMapLegendProps) {
  const items = [
    { color: 'bg-red-500', label: 'Heavily covered' },
    { color: 'bg-orange-500', label: 'Moderately covered' },
    { color: 'bg-yellow-500', label: 'Lightly covered' },
    { color: 'bg-muted', label: 'Not yet driven' },
  ];

  return (
    <div className={cn('flex flex-col gap-2 p-3 rounded-lg bg-background/95 shadow-lg', className)}>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Coverage
      </span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={cn('w-4 h-4 rounded', item.color)} />
          <span className="text-xs">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
