import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { differenceInMonths } from 'date-fns';
import { db } from '@/db/database';
import { SavingsGoal, SavingsContribution } from '@/types';

interface SavingsGoalState {
  goals: SavingsGoal[];
  contributions: SavingsContribution[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadGoals: () => Promise<void>;
  createGoal: (
    goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<SavingsGoal>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (
    contribution: Omit<SavingsContribution, 'id' | 'createdAt'>
  ) => Promise<SavingsContribution>;
  removeContributionsByExpenseId: (expenseId: string) => Promise<void>;
  recalculateGoalAmounts: () => Promise<void>;
  getRequiredMonthlySavings: (goalId: string) => number;
  getActiveGoals: () => SavingsGoal[];
  getTotalSavingsProgress: () => { current: number; target: number };
  getMonthlyTarget: () => number;
}

export const useSavingsGoalStore = create<SavingsGoalState>((set, get) => ({
  goals: [],
  contributions: [],
  isLoading: false,
  error: null,

  loadGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const goals = await db.savingsGoals.toArray();
      const contributions = await db.savingsContributions.toArray();
      set({ goals, contributions, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createGoal: async (goalData) => {
    try {
      const now = new Date();
      const newGoal: SavingsGoal = {
        ...goalData,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };

      await db.savingsGoals.add(newGoal);
      set((state) => ({ goals: [...state.goals, newGoal] }));
      return newGoal;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateGoal: async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      const updatedData = { ...updates, updatedAt: new Date() };
      await db.savingsGoals.update(id, updatedData);
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, ...updatedData } : g
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteGoal: async (id: string) => {
    try {
      await db.savingsGoals.delete(id);
      // Also delete related contributions
      await db.savingsContributions.where('goalId').equals(id).delete();
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        contributions: state.contributions.filter((c) => c.goalId !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  addContribution: async (contributionData) => {
    try {
      const newContribution: SavingsContribution = {
        ...contributionData,
        id: uuidv4(),
        createdAt: new Date(),
      };

      await db.savingsContributions.add(newContribution);

      // Update goal's currentAmount
      const goal = get().goals.find((g) => g.id === contributionData.goalId);
      if (goal) {
        const newAmount = goal.currentAmount + contributionData.amount;
        await get().updateGoal(goal.id, {
          currentAmount: newAmount,
          status: newAmount >= goal.targetAmount ? 'completed' : goal.status,
        });
      }

      set((state) => ({
        contributions: [...state.contributions, newContribution],
      }));

      return newContribution;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  removeContributionsByExpenseId: async (expenseId: string) => {
    try {
      // Query database directly to find contributions (state may not be loaded)
      const contributionsToRemove = await db.savingsContributions
        .where('expenseId')
        .equals(expenseId)
        .toArray();

      if (contributionsToRemove.length === 0) return;

      // Load goals from database if not in state
      let goals = get().goals;
      if (goals.length === 0) {
        goals = await db.savingsGoals.toArray();
      }

      // Update each goal's currentAmount by subtracting the contribution
      for (const contribution of contributionsToRemove) {
        const goal = goals.find((g) => g.id === contribution.goalId);
        if (goal) {
          const newAmount = Math.max(0, goal.currentAmount - contribution.amount);
          await db.savingsGoals.update(goal.id, {
            currentAmount: newAmount,
            status: goal.status === 'completed' && newAmount < goal.targetAmount
              ? 'active'
              : goal.status,
            updatedAt: new Date(),
          });
        }
      }

      // Delete contributions from database
      await db.savingsContributions.where('expenseId').equals(expenseId).delete();

      // Reload state from database to ensure consistency
      const updatedGoals = await db.savingsGoals.toArray();
      const updatedContributions = await db.savingsContributions.toArray();
      set({ goals: updatedGoals, contributions: updatedContributions });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  recalculateGoalAmounts: async () => {
    try {
      // Query database directly to ensure we have fresh data
      const goals = await db.savingsGoals.toArray();
      const contributions = await db.savingsContributions.toArray();

      // Recalculate each goal's currentAmount from actual contributions
      for (const goal of goals) {
        const goalContributions = contributions.filter((c) => c.goalId === goal.id);
        const calculatedAmount = goalContributions.reduce((sum, c) => sum + c.amount, 0);

        if (calculatedAmount !== goal.currentAmount) {
          await db.savingsGoals.update(goal.id, {
            currentAmount: calculatedAmount,
            status: calculatedAmount >= goal.targetAmount ? 'completed' : 'active',
            updatedAt: new Date(),
          });
        }
      }

      // Reload state from database
      const updatedGoals = await db.savingsGoals.toArray();
      set({ goals: updatedGoals, contributions });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  getRequiredMonthlySavings: (goalId: string) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal || !goal.targetDate) return 0;

    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 0;

    // Exclude the current month from calculation (savings start next month)
    const monthsLeft = differenceInMonths(goal.targetDate, new Date());
    if (monthsLeft <= 0) return remaining;

    return Math.ceil(remaining / monthsLeft);
  },

  getActiveGoals: () => {
    return get().goals.filter((g) => g.status === 'active');
  },

  getTotalSavingsProgress: () => {
    const activeGoals = get().getActiveGoals();
    return activeGoals.reduce(
      (acc, goal) => ({
        current: acc.current + goal.currentAmount,
        target: acc.target + goal.targetAmount,
      }),
      { current: 0, target: 0 }
    );
  },

  getMonthlyTarget: () => {
    const activeGoals = get().getActiveGoals();
    return activeGoals.reduce((total, goal) => {
      if (goal.type === 'monthly') {
        // Monthly goals have their targetAmount as monthly target
        return total + goal.targetAmount;
      } else if (goal.type === 'event' && goal.targetDate) {
        // Event goals: calculate required monthly savings
        return total + get().getRequiredMonthlySavings(goal.id);
      }
      return total;
    }, 0);
  },
}));
