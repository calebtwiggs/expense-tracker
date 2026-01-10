import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle, Lightbulb } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { useSavingsGoalStore } from '@/stores/useSavingsGoalStore';
import { useUIStore } from '@/stores/useUIStore';

export function SpendingTipsPanel() {
  const [tips, setTips] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  const { expenses, getCategoryTotals, getMonthlyTrend, budgetLimit } =
    useExpenseStore();
  const { goals } = useSavingsGoalStore();
  const { hasApiKey } = useUIStore();

  // Check if API key is configured
  useEffect(() => {
    if (window.electronAPI?.hasApiKey) {
      window.electronAPI.hasApiKey().then(setApiKeyConfigured);
    }
  }, [hasApiKey]);

  const fetchTips = async () => {
    if (!window.electronAPI) {
      setError('Running in browser mode. AI tips require the desktop app.');
      return;
    }

    if (!apiKeyConfigured) {
      setError('Please configure your Claude API key in Settings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const categoryTotals = getCategoryTotals();
      const monthlyTrend = await getMonthlyTrend(6);
      const savingsGoals = goals
        .filter((g) => g.status === 'active')
        .map((g) => ({
          name: g.name,
          current: g.currentAmount,
          target: g.targetAmount,
        }));

      const result = await window.electronAPI.getSpendingTips({
        expenses: expenses.slice(0, 50).map((e) => ({
          category: e.category,
          amount: e.amount,
          description: e.description,
        })),
        categoryTotals,
        monthlyTrend,
        savingsGoals,
        budgetLimit: budgetLimit || undefined,
      });

      if (result.success) {
        setTips(result.tips || null);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to get tips');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't auto-fetch on mount to avoid unnecessary API calls
  // User can click refresh to get tips

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Spending Tips
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTips}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
        </Button>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="flex items-start gap-2 text-destructive mb-4 p-3 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Error</p>
              <p className="text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {isLoading && !tips && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Analyzing your spending patterns...</span>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        )}

        {tips && (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {tips}
              </div>
            </div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground border-t pt-3">
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </p>
            )}
          </div>
        )}

        {!tips && !isLoading && !error && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-3">
              Get personalized tips to save money
            </p>
            <Button onClick={fetchTips} disabled={isLoading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze My Spending
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
