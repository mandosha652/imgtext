import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  className,
  size = 'default',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed text-center',
        size === 'sm' && 'py-10',
        size === 'default' && 'py-16',
        size === 'lg' && 'py-20',
        className
      )}
    >
      {Icon && (
        <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Icon className="text-muted-foreground h-5 w-5" />
        </div>
      )}
      <p className="font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-xs text-sm">
          {description}
        </p>
      )}
      {actions && <div className="mt-6 flex gap-3">{actions}</div>}
    </div>
  );
}
