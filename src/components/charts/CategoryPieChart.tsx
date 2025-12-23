import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { CATEGORY_COLORS, CATEGORY_LABELS, ExpenseCategory } from '@/types';

export function CategoryPieChart() {
  const { expenses } = useExpenseStore();

  const data = useMemo(() => {
    const totals = expenses.reduce(
      (acc, expense) => {
        // Exclude savings from spending breakdown
        if (expense.category !== 'savings') {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        }
        return acc;
      },
      {} as Record<ExpenseCategory, number>
    );

    return Object.entries(totals)
      .map(([category, amount]) => ({
        name: CATEGORY_LABELS[category as ExpenseCategory],
        value: amount,
        category: category as ExpenseCategory,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No expense data to display
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
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) =>
            percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
          }
          labelLine={false}
        >
          {data.map((entry) => (
            <Cell
              key={entry.category}
              fill={CATEGORY_COLORS[entry.category]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          formatter={(value) => (
            <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
