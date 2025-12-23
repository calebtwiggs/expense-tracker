import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Expense, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useExpenseStore } from '@/stores/useExpenseStore';

interface ExpenseCardProps {
  expense: Expense;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const { deleteExpense } = useExpenseStore();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expense.id);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
        />
        <div>
          <p className="font-medium">{expense.description}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{CATEGORY_LABELS[expense.category]}</span>
            <span>•</span>
            <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold">
          {formatCurrency(expense.amount)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
