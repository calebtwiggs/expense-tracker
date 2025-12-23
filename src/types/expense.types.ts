export const EXPENSE_CATEGORIES = [
  'housing',
  'utilities',
  'groceries',
  'transportation',
  'healthcare',
  'entertainment',
  'dining',
  'shopping',
  'subscriptions',
  'education',
  'savings',
  'other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  createdAt: Date;
}

export interface ExpenseFormData {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: 'Housing',
  utilities: 'Utilities',
  groceries: 'Groceries',
  transportation: 'Transportation',
  healthcare: 'Healthcare',
  entertainment: 'Entertainment',
  dining: 'Dining',
  shopping: 'Shopping',
  subscriptions: 'Subscriptions',
  education: 'Education',
  savings: 'Savings',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  housing: '#8B5CF6',
  utilities: '#06B6D4',
  groceries: '#10B981',
  transportation: '#F59E0B',
  healthcare: '#EF4444',
  entertainment: '#EC4899',
  dining: '#F97316',
  shopping: '#84CC16',
  subscriptions: '#6366F1',
  education: '#3B82F6',
  savings: '#22C55E',
  other: '#6B7280',
};
