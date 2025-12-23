import { Expense } from './expense.types';

export interface MonthlyRecord {
  id: string; // Format: "YYYY-MM"
  year: number;
  month: number; // 1-12
  expenses: Expense[];
  totalSpent: number;
  totalSaved: number;
  budgetLimit?: number;
}

export interface MonthlyTrend {
  month: string;
  spending: number;
  savings: number;
}

export interface MonthYearSelection {
  year: number;
  month: number;
}
