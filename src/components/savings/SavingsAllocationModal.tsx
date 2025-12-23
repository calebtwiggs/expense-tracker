import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoalProgressBar } from './GoalProgressBar';
import { useSavingsGoalStore } from '@/stores/useSavingsGoalStore';
import { formatCurrency } from '@/lib/utils';

interface SavingsAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  expenseId: string;
}

export function SavingsAllocationModal({
  isOpen,
  onClose,
  totalAmount,
  expenseId,
}: SavingsAllocationModalProps) {
  const { goals, addContribution, getRequiredMonthlySavings } =
    useSavingsGoalStore();
  const activeGoals = goals.filter((g) => g.status === 'active');

  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allocatedTotal = Object.values(allocations).reduce(
    (sum, v) => sum + (v || 0),
    0
  );
  const remaining = totalAmount - allocatedTotal;

  const handleAllocationChange = (goalId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    const maxAllowable =
      totalAmount - allocatedTotal + (allocations[goalId] || 0);

    setAllocations((prev) => ({
      ...prev,
      [goalId]: Math.min(Math.max(0, amount), maxAllowable),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      for (const [goalId, amount] of Object.entries(allocations)) {
        if (amount > 0) {
          await addContribution({
            expenseId,
            goalId,
            amount,
            date: new Date(),
          });
        }
      }
      onClose();
    } catch (error) {
      console.error('Failed to allocate savings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Allocate Savings</DialogTitle>
          <DialogDescription>
            Distribute {formatCurrency(totalAmount)} across your savings goals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {activeGoals.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No active savings goals. Create a goal first!
            </p>
          ) : (
            activeGoals.map((goal) => {
              const required = getRequiredMonthlySavings(goal.id);

              return (
                <div
                  key={goal.id}
                  className="p-4 border border-border rounded-lg space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} /{' '}
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    {required > 0 && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        Suggested: {formatCurrency(required)}/mo
                      </span>
                    )}
                  </div>

                  <GoalProgressBar
                    current={goal.currentAmount}
                    target={goal.targetAmount}
                    showLabels={false}
                  />

                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={allocations[goal.id] || ''}
                      onChange={(e) =>
                        handleAllocationChange(goal.id, e.target.value)
                      }
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleAllocationChange(goal.id, remaining.toString())
                      }
                      disabled={remaining <= 0}
                    >
                      Max
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <span className="text-sm text-muted-foreground">Remaining: </span>
            <span
              className={`font-medium ${remaining < 0 ? 'text-destructive' : ''}`}
            >
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting || allocatedTotal === 0}
          >
            {isSubmitting ? 'Allocating...' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
