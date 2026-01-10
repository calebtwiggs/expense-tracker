import { app, BrowserWindow, ipcMain, safeStorage } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;

// Secure API key storage
const API_KEY_FILE = path.join(app.getPath('userData'), 'secure-api-key');

function saveApiKeySecurely(apiKey: string): boolean {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('Encryption not available, storing key without encryption');
      fs.writeFileSync(API_KEY_FILE, apiKey, 'utf-8');
      return true;
    }
    const encrypted = safeStorage.encryptString(apiKey);
    fs.writeFileSync(API_KEY_FILE, encrypted);
    return true;
  } catch (error) {
    console.error('Failed to save API key:', error);
    return false;
  }
}

function loadApiKeySecurely(): string | null {
  try {
    if (!fs.existsSync(API_KEY_FILE)) {
      return null;
    }
    const data = fs.readFileSync(API_KEY_FILE);
    if (!safeStorage.isEncryptionAvailable()) {
      return data.toString('utf-8');
    }
    return safeStorage.decryptString(data);
  } catch (error) {
    console.error('Failed to load API key:', error);
    return null;
  }
}

function deleteApiKey(): boolean {
  try {
    if (fs.existsSync(API_KEY_FILE)) {
      fs.unlinkSync(API_KEY_FILE);
    }
    return true;
  } catch (error) {
    console.error('Failed to delete API key:', error);
    return false;
  }
}

// Auto-updater configuration
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdater() {
  // Don't check for updates in development
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  // Check for updates after app is ready
  autoUpdater.checkForUpdatesAndNotify();

  // Update events - send to renderer for UI feedback
  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus('checking', 'Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus('available', `Update v${info.version} available!`);
  });

  autoUpdater.on('update-not-available', () => {
    sendUpdateStatus('not-available', 'App is up to date');
  });

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus('downloading', `Downloading: ${Math.round(progress.percent)}%`, {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateStatus('downloaded', `Update v${info.version} ready to install`, {
      version: info.version,
    });
  });

  autoUpdater.on('error', (error) => {
    sendUpdateStatus('error', `Update error: ${error.message}`);
  });
}

function sendUpdateStatus(status: string, message: string, data?: Record<string, unknown>) {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status, message, ...data });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(app.getAppPath(), 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(app.getAppPath(), 'electron', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    autoHideMenuBar: true,
    backgroundColor: '#030712', // Dark background
    show: false,
  });

  // Remove the menu bar entirely on Windows/Linux
  if (process.platform !== 'darwin') {
    mainWindow.setMenu(null);
  }

  // Show window when ready to prevent flashing
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, the app structure is:
    // app.asar/
    //   ├── dist/           (Vite build output)
    //   │   └── index.html
    //   └── electron/       (compiled main.js, preload.js)
    //       └── main.js     (__dirname points here)
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// IPC handlers for update control
ipcMain.handle('check-for-updates', async () => {
  if (process.env.NODE_ENV === 'development') {
    return { success: false, message: 'Updates disabled in development' };
  }
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, version: result?.updateInfo?.version };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Claude API (using secure storage)
ipcMain.handle('set-api-key', async (_event, key: string) => {
  if (!key) {
    const deleted = deleteApiKey();
    return { success: deleted };
  }
  const saved = saveApiKeySecurely(key);
  return { success: saved };
});

ipcMain.handle('get-api-key', async () => {
  return loadApiKeySecurely();
});

ipcMain.handle('has-api-key', async () => {
  return loadApiKeySecurely() !== null;
});

interface SpendingData {
  expenses: Array<{ category: string; amount: number; description: string }>;
  categoryTotals: Record<string, number>;
  monthlyTrend: Array<{ month: string; spending: number; savings: number }>;
  savingsGoals: Array<{ name: string; current: number; target: number }>;
  budgetLimit?: number;
}

ipcMain.handle('get-spending-tips', async (_event, data: SpendingData) => {
  const apiKey = loadApiKeySecurely();
  if (!apiKey) {
    return {
      success: false,
      error: 'Claude API key not configured. Please add your API key in Settings.',
    };
  }

  try {
    // Dynamic import for Anthropic SDK
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({ apiKey });

    const totalSpending = Object.entries(data.categoryTotals)
      .filter(([cat]) => cat !== 'savings')
      .reduce((sum, [, amount]) => sum + amount, 0);

    const categoryBreakdown = Object.entries(data.categoryTotals)
      .filter(([, amount]) => amount > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amount]) => `- ${cat}: $${amount.toFixed(2)}`)
      .join('\n');

    const trendInfo = data.monthlyTrend
      .map((m) => `- ${m.month}: Spent $${m.spending.toFixed(2)}, Saved $${m.savings.toFixed(2)}`)
      .join('\n');

    const goalsInfo = data.savingsGoals
      .map((g) => `- ${g.name}: $${g.current.toFixed(2)} / $${g.target.toFixed(2)} (${((g.current / g.target) * 100).toFixed(0)}%)`)
      .join('\n');

    const prompt = `Analyze my spending data and provide 3-5 personalized, actionable tips to help me save money and reach my financial goals.

Spending Summary:
- Total spending this month: $${totalSpending.toFixed(2)}
${data.budgetLimit ? `- Budget limit: $${data.budgetLimit}` : ''}

Category Breakdown:
${categoryBreakdown || 'No spending data available'}

Monthly Trend (last 6 months):
${trendInfo || 'No trend data available'}

Savings Goals:
${goalsInfo || 'No savings goals set'}

Please provide specific, actionable tips based on my actual spending patterns. Focus on:
1. Areas where I could realistically cut back
2. Strategies to reach my savings goals faster
3. Spending patterns that might indicate habits I should change
4. Positive habits I should continue

Keep the response concise and practical.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = message.content.find((c) => c.type === 'text');

    return {
      success: true,
      tips: textContent?.text || 'Unable to generate tips',
    };
  } catch (error) {
    console.error('Claude API error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
});
