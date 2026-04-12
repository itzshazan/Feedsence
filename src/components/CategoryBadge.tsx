import { CAT_CONFIG, type FeedbackCategory } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: FeedbackCategory;
  size?: 'sm' | 'md';
  className?: string;
}

export default function CategoryBadge({ category, size = 'sm', className }: CategoryBadgeProps) {
  const cfg = CAT_CONFIG[category];
  if (!cfg) return <span>{category}</span>;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-sm font-mono font-bold uppercase tracking-wider shadow-neu-sharp',
      cfg.bgClass, cfg.textClass,
      size === 'sm' ? 'text-[9px] px-2.5 py-0.5' : 'text-xs px-4 py-1.5',
      className,
    )}>
      {/* LED dot */}
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.colorClass)} />
      {category}
    </span>
  );
}
