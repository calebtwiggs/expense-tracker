import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { db } from '@/db/database';
import { Expense, ExpenseCategory, ExpenseFormData } from '@/types';
import { MonthlyTrend } from '@/types/monthlyRecord.types';
import { useSavingsGoalStore } from './useSavingsGoalStore';

interface ExpenseState {
  expenses: Expense[];
  currentMonth: { year: number; month: number };
  budgetLimit: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadExpenses: () => Promise<void>;
  addExpense: (expense: ExpenseFormData) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, updates: Partial<ExpenseFormData>) => Promise<void>;
  setCurrentMonth: (year: number, month: number) => void;
  setBudgetLimit: (limit: number | null) => void;
  getCategoryTotals: () => Record<ExpenseCategory, number>;
  getMonthlyTrend: (months: number) => Promise<MonthlyTrend[]>;
  getTotalSpent: () => number;
  getTotalSaved: () => number;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  currentMonth: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },
  budgetLimit: null,
  isLoading: false,
  error: null,

  loadExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const { year, month } = get().currentMonth;
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(new Date(year, month - 1));

      const expenses = await db.expenses
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray();

      set({ expenses, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addExpense: async (formData: ExpenseFormData) => {
    try {
      const newExpense: Expense = {
        ...formData,
        id: uuidv4(),
        createdAt: new Date(),
      };

      await db.expenses.add(newExpense);

      // Only add to current state if it belongs to current month
      const { year, month } = get().currentMonth;
      const expenseDate = new Date(formData.date);
      if (
        expenseDate.getFullYear() === year &&
        expenseDate.getMonth() + 1 === month
      ) {
        set((state) => ({ expenses: [...state.expenses, newExpense] }));
      }

      return newExpense;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteExpense: async (id: string) => {
    try {
      // Remove any contributions linked to this expense (for savings expenses)
      await useSavingsGoalStore.getState().removeContributionsByExpenseId(id);

      await db.expenses.delete(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateExpense: async (id: string, updates: Partial<ExpenseFormData>) => {
    try {
      await db.expenses.update(id, updates);
      set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  setCurrentMonth: (year: number, month: number) => {
    set({ currentMonth: { year, month } });
    get().loadExpenses();
  },

  setBudgetLimit: (limit: number | null) => {
    set({ budgetLimit: limit });
    // Store in localStorage for persistence
    if (limit !== null) {
      localStorage.setItem('budgetLimit', limit.toString());
    } else {
      localStorage.removeItem('budgetLimit');
    }
  },

  getCategoryTotals: () => {
    const { expenses } = get();
    return expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      },
      {} as Record<ExpenseCategory, number>
    );
  },

  getMonthlyTrend: async (months: number): Promise<MonthlyTrend[]> => {
    const result: MonthlyTrend[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);

      const monthExpenses = await db.expenses
        .where('date')
        .between(startDate, endDate, true, true)
        .toArray();

      const spending = monthExpenses
        .filter((e) => e.category !== 'savings')
        .reduce((sum, e) => sum + e.amount, 0);

      const savings = monthExpenses
        .filter((e) => e.category === 'savings')
        .reduce((sum, e) => sum + e.amount, 0);

      result.push({
        month: format(date, 'MMM yyyy'),
        spending,
        savings,
      });
    }

    return result;
  },

  getTotalSpent: () => {
    const { expenses } = get();
    return expenses
      .filter((e) => e.category !== 'savings')
      .reduce((sum, e) => sum + e.amount, 0);
  },

  getTotalSaved: () => {
    const { expenses } = get();
    return expenses
      .filter((e) => e.category === 'savings')
      .reduce((sum, e) => sum + e.amount, 0);
  },
}));

// Load budget limit from localStorage on init
const storedLimit = localStorage.getItem('budgetLimit');
if (storedLimit) {
  useExpenseStore.getState().setBudgetLimit(parseFloat(storedLimit));
}
