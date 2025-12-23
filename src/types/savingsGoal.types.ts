export type SavingsGoalType = 'monthly' | 'event';
export type SavingsGoalStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type EventGoalCategory =
  | 'vacation'
  | 'vehicle'
  | 'emergency_fund'
  | 'home_improvement'
  | 'electronics'
  | 'education'
  | 'wedding'
  | 'medical'
  | 'custom';

export interface SavingsGoal {
  id: string;
  type: SavingsGoalType;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  status: SavingsGoalStatus;
  createdAt: Date;
  updatedAt: Date;

  // Monthly goal fields
  rolloverEnabled: boolean;
  startMonth: string; // Format: "YYYY-MM"

  // Event goal fields
  category?: EventGoalCategory;
  targetDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface SavingsContribution {
  id: string;
  expenseId: string;
  goalId: string;
  amount: number;
  date: Date;
  createdAt: Date;
}

export const EVENT_CATEGORY_LABELS: Record<EventGoalCategory, string> = {
  vacation: 'Vacation',
  vehicle: 'Vehicle',
  emergency_fund: 'Emergency Fund',
  home_improvement: 'Home Improvement',
  electronics: 'Electronics',
  education: 'Education',
  wedding: 'Wedding',
  medical: 'Medical',
  custom: 'Custom',
};

export const PRIORITY_LABELS: Record<'low' | 'medium' | 'high', string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
