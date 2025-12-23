import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

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

contextBridge.exposeInMainWorld('electronAPI', {
  // AI Tips
  getSpendingTips: (data: SpendingData): Promise<AITipsResponse> =>
    ipcRenderer.invoke('get-spending-tips', data),

  setApiKey: (key: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('set-api-key', key),

  getApiKey: (): Promise<string | null> =>
    ipcRenderer.invoke('get-api-key'),

  // Auto-updater
  checkForUpdates: (): Promise<{ success: boolean; version?: string; message?: string }> =>
    ipcRenderer.invoke('check-for-updates'),

  installUpdate: (): void => {
    ipcRenderer.invoke('install-update');
  },

  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke('get-app-version'),

  onUpdateStatus: (callback: (status: UpdateStatus) => void) => {
    const handler = (_event: IpcRendererEvent, status: UpdateStatus) => callback(status);
    ipcRenderer.on('update-status', handler);
    // Return cleanup function
    return () => ipcRenderer.removeListener('update-status', handler);
  },
});
