import { useMemo } from 'react';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { ExpenseList } from './ExpenseList';
import { formatCurrency } from '@/lib/utils';

export function MonthlyLog() {
  const { expenses, currentMonth, budgetLimit } = useExpenseStore();

  const stats = useMemo(() => {
    const totalSpent = expenses
      .filter((e) => e.category !== 'savings')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalSaved = expenses
      .filter((e) => e.category === 'savings')
      .reduce((sum, e) => sum + e.amount, 0);

    const budgetRemaining = budgetLimit ? budgetLimit - totalSpent : null;
    const budgetPercent = budgetLimit ? (totalSpent / budgetLimit) * 100 : 0;

    return { totalSpent, totalSaved, budgetRemaining, budgetPercent };
  }, [expenses, budgetLimit]);

  const currentDate = new Date(currentMonth.year, currentMonth.month - 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="text-sm text-muted-foreground">
          {expenses.length} transactions
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSpent)}
            </div>
            {budgetLimit && (
              <div className="mt-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      stats.budgetPercent > 100
                        ? 'bg-destructive'
                        : stats.budgetPercent > 80
                          ? 'bg-yellow-500'
                          : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(stats.budgetPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.budgetPercent.toFixed(0)}% of {formatCurrency(budgetLimit)} budget
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Saved
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(stats.totalSaved)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Added to savings this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {budgetLimit ? 'Budget Remaining' : 'Net Flow'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.budgetRemaining !== null
                  ? stats.budgetRemaining >= 0
                    ? 'text-green-500'
                    : 'text-destructive'
                  : ''
              }`}
            >
              {stats.budgetRemaining !== null
                ? formatCurrency(stats.budgetRemaining)
                : formatCurrency(stats.totalSaved - stats.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.budgetRemaining !== null
                ? stats.budgetRemaining >= 0
                  ? 'Still available to spend'
                  : 'Over budget!'
                : 'Savings minus spending'}
            </p>
          </CardContent>
        </Card>
      </div>

      <ExpenseList />
    </div>
  );
}
