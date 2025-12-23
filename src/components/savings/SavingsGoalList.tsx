import { useEffect } from 'react';
import { PiggyBank, Plus } from 'lucide-react';
import { useSavingsGoalStore } from '@/stores/useSavingsGoalStore';
import { SavingsGoalCard } from './SavingsGoalCard';
import { Button } from '@/components/ui/button';

interface SavingsGoalListProps {
  onAddGoal?: () => void;
  filter?: 'all' | 'active' | 'completed';
}

export function SavingsGoalList({
  onAddGoal,
  filter = 'all',
}: SavingsGoalListProps) {
  const { goals, isLoading, loadGoals } = useSavingsGoalStore();

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'active') return goal.status === 'active';
    if (filter === 'completed') return goal.status === 'completed';
    return true;
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (filteredGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <PiggyBank className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">
          {filter === 'completed' ? 'No completed goals yet' : 'No savings goals yet'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {filter === 'completed'
            ? 'Complete a goal to see it here'
            : 'Create your first savings goal to start tracking'}
        </p>
        {onAddGoal && filter !== 'completed' && (
          <Button onClick={onAddGoal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filteredGoals.map((goal) => (
        <SavingsGoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
