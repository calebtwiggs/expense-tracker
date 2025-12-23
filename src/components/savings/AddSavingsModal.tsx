import { useState } from 'react';
import { PiggyBank } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { SavingsAllocationModal } from './SavingsAllocationModal';

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSavingsModal({ isOpen, onClose }: AddSavingsModalProps) {
  const { addExpense } = useExpenseStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocationData, setAllocationData] = useState<{
    isOpen: boolean;
    amount: number;
    expenseId: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const expense = await addExpense({
        amount: parsedAmount,
        category: 'savings',
        description: description || 'Savings contribution',
        date: new Date(),
      });

      // Open allocation modal
      setAllocationData({
        isOpen: true,
        amount: parsedAmount,
        expenseId: expense.id,
      });
    } catch (error) {
      console.error('Failed to add savings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocationClose = () => {
    setAllocationData(null);
    setAmount('');
    setDescription('');
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !allocationData?.isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Add Savings
            </DialogTitle>
            <DialogDescription>
              Record a savings contribution to allocate to your goals
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Monthly savings deposit"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !amount}
              >
                {isSubmitting ? 'Adding...' : 'Continue'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {allocationData && (
        <SavingsAllocationModal
          isOpen={allocationData.isOpen}
          onClose={handleAllocationClose}
          totalAmount={allocationData.amount}
          expenseId={allocationData.expenseId}
        />
      )}
    </>
  );
}
