import { Header } from '@/components/layout/Header';
import { SpendingTipsPanel } from '@/components/ai/SpendingTipsPanel';

export function PremiumAITipsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="AI Spending Tips" />

      <div className="flex-1 overflow-auto p-6">
        <SpendingTipsPanel />
      </div>
    </div>
  );
}
