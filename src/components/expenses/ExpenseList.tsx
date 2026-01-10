import { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Receipt } from 'lucide-react';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { ExpenseCard } from './ExpenseCard';

export function ExpenseList() {
  const { expenses, isLoading, loadExpenses } = useExpenseStore();

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No expenses yet</h3>
        <p className="text-muted-foreground">
          Add your first expense to start tracking
        </p>
      </div>
    );
  }

  // Group expenses by date
  const groupedExpenses = expenses.reduce(
    (groups, expense) => {
      const dateKey = format(new Date(expense.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
      return groups;
    },
    {} as Record<string, typeof expenses>
  );

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedExpenses).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => (
        <div key={dateKey} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">
            {format(parseISO(dateKey), 'EEEE, MMMM d')}
          </h3>
          <div className="space-y-2">
            {groupedExpenses[dateKey].map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
