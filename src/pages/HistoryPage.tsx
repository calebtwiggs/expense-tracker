import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { Calendar, Filter } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { EXPENSE_CATEGORIES, CATEGORY_LABELS, ExpenseCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';

export function HistoryPage() {
  const { expenses, currentMonth, setCurrentMonth, loadExpenses } =
    useExpenseStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses, currentMonth]);

  // Generate list of available months (last 12 months)
  const availableMonths = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: format(date, 'MMMM yyyy'),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    };
  });

  const filteredExpenses = expenses.filter((expense) => {
    if (selectedCategory === 'all') return true;
    return expense.category === selectedCategory;
  });

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const currentMonthValue = `${currentMonth.year}-${currentMonth.month}`;

  const handleMonthChange = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    setCurrentMonth(year, month);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="History" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Expense History</h2>
            <p className="text-muted-foreground">
              Browse your past expenses by month
            </p>
          </div>

          <div className="flex gap-3">
            <Select value={currentMonthValue} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {selectedCategory === 'all'
                ? 'Total for Period'
                : `Total ${CATEGORY_LABELS[selectedCategory as ExpenseCategory]}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-sm text-muted-foreground">
              {filteredExpenses.length} transactions
            </p>
          </CardContent>
        </Card>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No expenses found</h3>
            <p className="text-muted-foreground">
              {selectedCategory !== 'all'
                ? 'Try selecting a different category'
                : 'No expenses recorded for this period'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
