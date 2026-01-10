/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface Window {
  electronAPI?: {
    // AI Tips
    getSpendingTips: (data: SpendingData) => Promise<AITipsResponse>;
    setApiKey: (key: string) => Promise<{ success: boolean }>;
    getApiKey: () => Promise<string | null>;
    hasApiKey: () => Promise<boolean>;
    // Auto-updater
    checkForUpdates: () => Promise<{ success: boolean; version?: string; message?: string }>;
    installUpdate: () => void;
    getAppVersion: () => Promise<string>;
    onUpdateStatus: (callback: (status: UpdateStatus) => void) => () => void;
  };
}

interface SpendingData {
  expenses: Array<{ category: string; amount: number; description: string }>;
  categoryTotals: Record<string, number>;
  monthlyTrend: Array<{ month: string; spending: number; savings: number }>;
  savingsGoals: Array<{ name: string; current: number; target: number }>;
  budgetLimit?: number;
}

interface AITipsResponse {
  success: boolean;
  tips?: string;
  error?: string;
}

interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  message: string;
  percent?: number;
  version?: string;
}
