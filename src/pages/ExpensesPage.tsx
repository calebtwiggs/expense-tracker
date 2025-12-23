import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { MonthlyLog } from '@/components/expenses/MonthlyLog';
import { SavingsAllocationModal } from '@/components/savings/SavingsAllocationModal';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { useSavingsGoalStore } from '@/stores/useSavingsGoalStore';

export function ExpensesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [allocationModal, setAllocationModal] = useState<{
    isOpen: boolean;
    amount: number;
    expenseId: string;
  }>({
    isOpen: false,
    amount: 0,
    expenseId: '',
  });

  const { addExpense } = useExpenseStore();
  const { goals } = useSavingsGoalStore();

  const handleExpenseSuccess = async () => {
    setIsFormOpen(false);
  };

  // Enhanced expense form that checks for savings category
  const handleExpenseAdded = (expense: { id: string; amount: number; category: string }) => {
    if (expense.category === 'savings' && goals.some((g) => g.status === 'active')) {
      setAllocationModal({
        isOpen: true,
        amount: expense.amount,
        expenseId: expense.id,
      });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Expenses" showMonthSelector />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Expense Log</h2>
            <p className="text-muted-foreground">
              Track and manage your daily expenses
            </p>
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm onSuccess={handleExpenseSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        <MonthlyLog />
      </div>

      <SavingsAllocationModal
        isOpen={allocationModal.isOpen}
        onClose={() =>
          setAllocationModal({ isOpen: false, amount: 0, expenseId: '' })
        }
        totalAmount={allocationModal.amount}
        expenseId={allocationModal.expenseId}
      />
    </div>
  );
}
