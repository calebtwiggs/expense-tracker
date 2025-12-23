import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { EXPENSE_CATEGORIES, CATEGORY_LABELS, ExpenseCategory } from '@/types';

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(EXPENSE_CATEGORIES as readonly [string, ...string[]]),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const { addExpense } = useExpenseStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      category: 'other',
    },
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await addExpense({
        amount: data.amount,
        category: data.category as ExpenseCategory,
        description: data.description,
        date: new Date(data.date),
      });
      reset({
        amount: undefined,
        category: 'other',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-7"
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
          {errors.amount && (
            <p className="text-destructive text-sm">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <div className="relative">
            <Input id="date" type="date" {...register('date')} />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {errors.date && (
            <p className="text-destructive text-sm">{errors.date.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setValue('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-destructive text-sm">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What did you spend on?"
          rows={2}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-destructive text-sm">
            {errors.description.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Expense'}
      </Button>
    </form>
  );
}
