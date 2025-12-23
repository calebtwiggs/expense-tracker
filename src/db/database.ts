import Dexie, { Table } from 'dexie';
import { Expense } from '@/types/expense.types';
import { SavingsGoal, SavingsContribution } from '@/types/savingsGoal.types';
import { MonthlyRecord } from '@/types/monthlyRecord.types';

export class ExpenseTrackerDB extends Dexie {
  expenses!: Table<Expense>;
  monthlyRecords!: Table<MonthlyRecord>;
  savingsGoals!: Table<SavingsGoal>;
  savingsContributions!: Table<SavingsContribution>;

  constructor() {
    super('ExpenseTrackerDB');

    this.version(1).stores({
      expenses: 'id, category, date, [date+category]',
      monthlyRecords: 'id, year, month, [year+month]',
      savingsGoals: 'id, type, status, targetDate',
      savingsContributions: 'id, expenseId, goalId, date',
    });
  }
}

export const db = new ExpenseTrackerDB();

// Initialize database
db.open().catch((err) => {
  console.error('Failed to open database:', err);
});
