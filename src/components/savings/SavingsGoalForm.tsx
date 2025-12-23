import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addMonths } from 'date-fns';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSavingsGoalStore } from '@/stores/useSavingsGoalStore';
import {
  SavingsGoalType,
  EventGoalCategory,
  EVENT_CATEGORY_LABELS,
} from '@/types';

const goalSchema = z.object({
  type: z.enum(['monthly', 'event']),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  targetAmount: z.number().positive('Target must be positive'),
  rolloverEnabled: z.boolean(),
  category: z.string().optional(),
  targetDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface SavingsGoalFormProps {
  onSuccess?: () => void;
  initialType?: SavingsGoalType;
}

export function SavingsGoalForm({
  onSuccess,
  initialType = 'event',
}: SavingsGoalFormProps) {
  const { createGoal } = useSavingsGoalStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      type: initialType,
      rolloverEnabled: true,
      priority: 'medium',
      targetDate: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
    },
  });

  const goalType = watch('type');
  const selectedCategory = watch('category');

  const onSubmit = async (data: GoalFormData) => {
    try {
      await createGoal({
        type: data.type as SavingsGoalType,
        name: data.name,
        description: data.description,
        targetAmount: data.targetAmount,
        currentAmount: 0,
        status: 'active',
        rolloverEnabled: data.rolloverEnabled,
        startMonth: format(new Date(), 'yyyy-MM'),
        category:
          data.type === 'event'
            ? (data.category as EventGoalCategory)
            : undefined,
        targetDate:
          data.type === 'event' && data.targetDate
            ? new Date(data.targetDate)
            : undefined,
        priority: data.priority,
      });
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Monthly savings calculations start from next month. The current month
          is not included in the required monthly amount.
        </p>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="monthly"
            {...register('type')}
            className="w-4 h-4"
          />
          <span>Monthly Savings</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="event"
            {...register('type')}
            className="w-4 h-4"
          />
          <span>Event/One-time Goal</span>
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          placeholder="e.g., Summer Vacation, Emergency Fund"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Add any notes about this goal..."
          rows={2}
          {...register('description')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="targetAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="pl-7"
            {...register('targetAmount', { valueAsNumber: true })}
          />
        </div>
        {errors.targetAmount && (
          <p className="text-destructive text-sm">
            {errors.targetAmount.message}
          </p>
        )}
      </div>

      {goalType === 'event' && (
        <>
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
                {Object.entries(EVENT_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input id="targetDate" type="date" {...register('targetDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={watch('priority')}
              onValueChange={(value: 'low' | 'medium' | 'high') =>
                setValue('priority', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {goalType === 'monthly' && (
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="rollover">Enable Rollover</Label>
            <p className="text-sm text-muted-foreground">
              Shortfalls roll over to next month
            </p>
          </div>
          <Switch
            id="rollover"
            checked={watch('rolloverEnabled')}
            onCheckedChange={(checked) => setValue('rolloverEnabled', checked)}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Goal'}
      </Button>
    </form>
  );
}
