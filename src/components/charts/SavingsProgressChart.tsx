import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useSavingsGoalStore } from '@/stores/useSavingsGoalStore';

const COLORS = [
  '#8B5CF6',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#6366F1',
  '#84CC16',
];

export function SavingsProgressChart() {
  const { goals } = useSavingsGoalStore();

  const data = useMemo(() => {
    return goals
      .filter((goal) => goal.status === 'active')
      .map((goal) => ({
        name: goal.name,
        value: goal.currentAmount,
        target: goal.targetAmount,
        percentage: (goal.currentAmount / goal.targetAmount) * 100,
      }));
  }, [goals]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No active savings goals
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, percentage }) =>
            `${name}: ${percentage.toFixed(0)}%`
          }
          labelLine={true}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, _name, { payload }) => [
            `$${value.toFixed(2)} / $${payload.target.toFixed(2)}`,
            payload.name,
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
