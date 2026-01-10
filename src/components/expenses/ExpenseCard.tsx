import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Expense, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { toast } from '@/hooks/useToast';

interface ExpenseCardProps {
  expense: Expense;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const { deleteExpense } = useExpenseStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      toast({
        title: 'Expense deleted',
        description: 'The expense has been removed.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete expense. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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
          onClick={() => setShowDeleteDialog(true)}
          aria-label="Delete expense"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Expense"
        description={`Are you sure you want to delete "${expense.description}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
