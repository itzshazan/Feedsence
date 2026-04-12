import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, { classes: string; pulse: boolean }> = {
  'Open': { classes: 'bg-[hsl(var(--status-open-bg))] text-[hsl(var(--status-open))]', pulse: true },
  'In Progress': { classes: 'bg-[hsl(var(--status-progress-bg))] text-[hsl(var(--status-progress))]', pulse: true },
  'Resolved': { classes: 'bg-[hsl(var(--status-resolved-bg))] text-[hsl(var(--status-resolved))]', pulse: false },
};

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = STATUS_STYLES[status];
  const classes = style?.classes || 'bg-muted text-muted-foreground';
  const pulse = style?.pulse ?? false;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-sm font-mono text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-neu-sharp',
      classes,
      className,
    )}>
      {/* LED status dot */}
      <span className={cn(
        'w-1.5 h-1.5 rounded-full bg-current',
        pulse && 'animate-led-pulse',
      )} />
      {status}
    </span>
  );
}
