import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Trash2, Pause, Play, Check, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { GoalProgressBar } from './GoalProgressBar';
import { SavingsGoal, EVENT_CATEGORY_LABELS } from '@/types';
import { useSavingsGoalStore } from '@/stores/useSavingsGoalStore';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/useToast';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
}

export function SavingsGoalCard({ goal }: SavingsGoalCardProps) {
  const { updateGoal, deleteGoal, getRequiredMonthlySavings } =
    useSavingsGoalStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const requiredMonthly = getRequiredMonthlySavings(goal.id);
  const daysRemaining = goal.targetDate
    ? differenceInDays(new Date(goal.targetDate), new Date())
    : null;

  const handleToggleStatus = async () => {
    try {
      await updateGoal(goal.id, {
        status: goal.status === 'active' ? 'paused' : 'active',
      });
      toast({
        title: goal.status === 'active' ? 'Goal paused' : 'Goal resumed',
        description: `"${goal.name}" has been ${goal.status === 'active' ? 'paused' : 'resumed'}.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update goal status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGoal(goal.id);
      toast({
        title: 'Goal deleted',
        description: `"${goal.name}" has been removed.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete goal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleComplete = async () => {
    try {
      await updateGoal(goal.id, { status: 'completed' });
      toast({
        title: 'Goal completed!',
        description: `Congratulations! You've reached your "${goal.name}" goal.`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to mark goal as complete.',
        variant: 'destructive',
      });
    }
  };

  const isCompleted = goal.status === 'completed';
  const isPaused = goal.status === 'paused';

  return (
    <Card className={cn(isPaused && 'opacity-60')}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            {goal.name}
            {isCompleted && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
          {goal.category && (
            <p className="text-sm text-muted-foreground">
              {EVENT_CATEGORY_LABELS[goal.category]}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isCompleted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleStatus}
              aria-label={isPaused ? 'Resume goal' : 'Pause goal'}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
            aria-label="Delete goal"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {goal.description && (
          <p className="text-sm text-muted-foreground">{goal.description}</p>
        )}

        <GoalProgressBar
          current={goal.currentAmount}
          target={goal.targetAmount}
        />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{formatCurrency(goal.targetAmount)}</p>
              <p className="text-xs text-muted-foreground">Target</p>
            </div>
          </div>

          {goal.targetDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {daysRemaining !== null && daysRemaining >= 0
                    ? `${daysRemaining} days left`
                    : 'Overdue'}
                </p>
              </div>
            </div>
          )}
        </div>

        {!isCompleted && requiredMonthly > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <span className="font-medium">
                {formatCurrency(requiredMonthly)}
              </span>{' '}
              <span className="text-muted-foreground">
                needed per month to reach your goal
              </span>
            </p>
          </div>
        )}

        {!isCompleted &&
          goal.currentAmount >= goal.targetAmount && (
            <Button onClick={handleComplete} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          )}
      </CardContent>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Savings Goal"
        description={`Are you sure you want to delete "${goal.name}"? All contribution history for this goal will also be removed.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
