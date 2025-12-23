import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { MonthlyTrend } from '@/types/monthlyRecord.types';

interface SpendingTrendChartProps {
  months?: number;
}

export function SpendingTrendChart({ months = 6 }: SpendingTrendChartProps) {
  const { getMonthlyTrend } = useExpenseStore();
  const [data, setData] = useState<MonthlyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const trendData = await getMonthlyTrend(months);
      setData(trendData);
      setIsLoading(false);
    };
    fetchData();
  }, [months, getMonthlyTrend]);

  if (isLoading) {
    return (
      <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          opacity={0.5}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis
          tickFormatter={(value) => `$${value}`}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={{ stroke: 'hsl(var(--border))' }}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            `$${value.toFixed(2)}`,
            name === 'spending' ? 'Spending' : 'Savings',
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
            <span style={{ color: 'hsl(var(--foreground))' }}>
              {value === 'spending' ? 'Spending' : 'Savings'}
            </span>
          )}
        />
        <Line
          type="monotone"
          dataKey="spending"
          stroke="#EF4444"
          strokeWidth={2}
          dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="spending"
        />
        <Line
          type="monotone"
          dataKey="savings"
          stroke="#22C55E"
          strokeWidth={2}
          dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="savings"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
