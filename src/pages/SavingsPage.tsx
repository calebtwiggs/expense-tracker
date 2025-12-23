import { useState, useEffect } from 'react';
import { Plus, Palmtree } from 'lucide-react';
import { addMonths, format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SavingsGoalForm } from '@/components/savings/SavingsGoalForm';
import { SavingsGoalList } from '@/components/savings/SavingsGoalList';
import { SavingsProgressChart } from '@/components/charts/SavingsProgressChart';
import { GoalProgressBar } from '@/components/savings/GoalProgressBar';
import { useSavingsGoalStore } from '@/stores/useSavingsGoalStore';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { formatCurrency } from '@/lib/utils';
import { createVacationGoalPreset } from '@/lib/savingsCalculations';

export function SavingsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { goals, loadGoals, getTotalSavingsProgress, getMonthlyTarget, createGoal } =
    useSavingsGoalStore();
  const { loadExpenses, getTotalSaved, currentMonth } = useExpenseStore();

  useEffect(() => {
    loadGoals();
    loadExpenses();
  }, [loadGoals, loadExpenses]);

  const progress = getTotalSavingsProgress();
  const monthlyTarget = getMonthlyTarget();
  const monthlySaved = getTotalSaved();
  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const currentMonthLabel = format(new Date(currentMonth.year, currentMonth.month - 1), 'MMMM yyyy');

  // Calculate remaining amounts
  const totalRemaining = Math.max(0, progress.target - progress.current);
  const monthlyRemaining = Math.max(0, monthlyTarget - monthlySaved);

  const handleQuickVacation = async () => {
    const vacationGoal = createVacationGoalPreset(
      'Summer Vacation',
      3000,
      addMonths(new Date(), 6)
    );
    await createGoal(vacationGoal);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Savings Goals" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(progress.current)}
                </div>
                <p className="text-sm text-muted-foreground">
                  of {formatCurrency(progress.target)} goal
                </p>
                {totalRemaining > 0 && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="text-amber-500">{formatCurrency(totalRemaining)}</span> remaining
                  </p>
                )}
                <GoalProgressBar
                  current={progress.current}
                  target={progress.target}
                  showLabels={false}
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {currentMonthLabel}
                </p>
                <div className="text-xl font-bold">
                  {formatCurrency(monthlySaved)}
                </div>
                <p className="text-sm text-muted-foreground">
                  of {formatCurrency(monthlyTarget)} monthly target
                </p>
                {monthlyRemaining > 0 && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="text-amber-500">{formatCurrency(monthlyRemaining)}</span> remaining
                  </p>
                )}
                <GoalProgressBar
                  current={monthlySaved}
                  target={monthlyTarget}
                  showLabels={false}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
              <p className="text-sm text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {completedGoals.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Achieved!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Chart */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Savings Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SavingsProgressChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Savings Goal</DialogTitle>
                  </DialogHeader>
                  <SavingsGoalForm onSuccess={() => setIsFormOpen(false)} />
                </DialogContent>
              </Dialog>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Quick Start
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleQuickVacation}
              >
                <Palmtree className="h-4 w-4 mr-2" />
                Add Vacation Goal ($3,000)
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Creates a 6-month vacation savings goal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Goals</h2>
          </div>

          <SavingsGoalList onAddGoal={() => setIsFormOpen(true)} />
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Completed Goals
            </h2>
            <SavingsGoalList filter="completed" />
          </div>
        )}
      </div>
    </div>
  );
}
