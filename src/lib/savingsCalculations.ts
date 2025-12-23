import { differenceInMonths, addMonths } from 'date-fns';
import { SavingsGoal } from '@/types';

export function calculateRequiredMonthlySavings(goal: SavingsGoal): number {
  if (!goal.targetDate) return 0;

  const remaining = goal.targetAmount - goal.currentAmount;
  if (remaining <= 0) return 0;

  // Exclude the current month from calculation (savings start next month)
  const monthsLeft = differenceInMonths(goal.targetDate, new Date());
  if (monthsLeft <= 0) return remaining;

  return Math.ceil(remaining / monthsLeft);
}

export function calculateProjectedCompletionDate(
  goal: SavingsGoal,
  monthlyContribution: number
): Date | null {
  if (monthlyContribution <= 0) return null;

  const remaining = goal.targetAmount - goal.currentAmount;
  if (remaining <= 0) return new Date();

  const monthsNeeded = Math.ceil(remaining / monthlyContribution);
  return addMonths(new Date(), monthsNeeded);
}

export function calculateProgress(goal: SavingsGoal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
}

export function calculateRolloverAmount(
  goal: SavingsGoal,
  monthlyTarget: number,
  actualSaved: number
): number {
  if (!goal.rolloverEnabled) return 0;
  return Math.max(0, monthlyTarget - actualSaved);
}

export function createVacationGoalPreset(
  name: string,
  targetAmount: number,
  targetDate: Date
): Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    type: 'event',
    name,
    description: `Save for ${name}`,
    targetAmount,
    currentAmount: 0,
    status: 'active',
    rolloverEnabled: false,
    startMonth: new Date().toISOString().slice(0, 7),
    category: 'vacation',
    targetDate,
    priority: 'high',
  };
}
