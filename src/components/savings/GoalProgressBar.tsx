import { cn } from '@/lib/utils';

interface GoalProgressBarProps {
  current: number;
  target: number;
  className?: string;
  showLabels?: boolean;
}

export function GoalProgressBar({
  current,
  target,
  className,
  showLabels = true,
}: GoalProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = current >= target;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            isComplete ? 'bg-green-500' : 'bg-primary'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${current.toFixed(2)}</span>
          <span>{percentage.toFixed(0)}%</span>
          <span>${target.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
