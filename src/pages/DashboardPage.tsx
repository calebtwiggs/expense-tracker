import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, RefreshCw, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { SpendingTrendChart } from '@/components/charts/SpendingTrendChart';
import { SpendingTipsPanel } from '@/components/ai/SpendingTipsPanel';
import { Button } from '@/components/ui/button';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { useSavingsGoalStore } from '@/stores/useSavingsGoalStore';
import { formatCurrency } from '@/lib/utils';

export function DashboardPage() {
  const { expenses, budgetLimit, loadExpenses } = useExpenseStore();
  const { goals, loadGoals, getTotalSavingsProgress, recalculateGoalAmounts } =
    useSavingsGoalStore();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculateSuccess, setRecalculateSuccess] = useState(false);

  useEffect(() => {
    loadExpenses();
    loadGoals();
  }, [loadExpenses, loadGoals]);

  const stats = useMemo(() => {
    const totalSpent = expenses
      .filter((e) => e.category !== 'savings')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalSaved = expenses
      .filter((e) => e.category === 'savings')
      .reduce((sum, e) => sum + e.amount, 0);

    const savingsProgress = getTotalSavingsProgress();
    const budgetUsed = budgetLimit ? (totalSpent / budgetLimit) * 100 : 0;

    return { totalSpent, totalSaved, savingsProgress, budgetUsed };
  }, [expenses, budgetLimit, getTotalSavingsProgress]);

  const activeGoals = goals.filter((g) => g.status === 'active');

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setRecalculateSuccess(false);
    try {
      await recalculateGoalAmounts();
      setRecalculateSuccess(true);
      setTimeout(() => setRecalculateSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to recalculate savings:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" showMonthSelector />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.budgetUsed.toFixed(0)}% of budget used
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Saved
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(stats.totalSaved)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Goals
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(stats.savingsProgress.current)} saved
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs"
                onClick={handleRecalculate}
                disabled={isRecalculating}
              >
                {recalculateSuccess ? (
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <RefreshCw
                    className={`h-3 w-3 mr-1 ${isRecalculating ? 'animate-spin' : ''}`}
                  />
                )}
                {recalculateSuccess ? 'Done' : 'Recalculate'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {budgetLimit ? 'Budget Remaining' : 'Net Balance'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  budgetLimit
                    ? budgetLimit - stats.totalSpent >= 0
                      ? 'text-green-500'
                      : 'text-destructive'
                    : ''
                }`}
              >
                {budgetLimit
                  ? formatCurrency(budgetLimit - stats.totalSpent)
                  : formatCurrency(stats.totalSaved - stats.totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {budgetLimit ? 'Available' : 'Savings - Spending'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingTrendChart months={6} />
            </CardContent>
          </Card>
        </div>

        {/* AI Tips */}
        <SpendingTipsPanel />
      </div>
    </div>
  );
}
