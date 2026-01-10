import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { DashboardPage } from '@/pages/DashboardPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { SavingsPage } from '@/pages/SavingsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PremiumAITipsPage } from '@/pages/PremiumAITipsPage';
import { PremiumInsightsPage } from '@/pages/PremiumInsightsPage';
import { PremiumAutomationPage } from '@/pages/PremiumAutomationPage';

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/premium/ai-tips" element={<PremiumAITipsPage />} />
          <Route path="/premium/insights" element={<PremiumInsightsPage />} />
          <Route path="/premium/automation" element={<PremiumAutomationPage />} />
        </Routes>
      </Layout>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
