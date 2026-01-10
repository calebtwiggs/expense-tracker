"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let mainWindow = null;
// Secure API key storage
const API_KEY_FILE = path_1.default.join(electron_1.app.getPath('userData'), 'secure-api-key');
function saveApiKeySecurely(apiKey) {
    try {
        if (!electron_1.safeStorage.isEncryptionAvailable()) {
            console.warn('Encryption not available, storing key without encryption');
            fs_1.default.writeFileSync(API_KEY_FILE, apiKey, 'utf-8');
            return true;
        }
        const encrypted = electron_1.safeStorage.encryptString(apiKey);
        fs_1.default.writeFileSync(API_KEY_FILE, encrypted);
        return true;
    }
    catch (error) {
        console.error('Failed to save API key:', error);
        return false;
    }
}
function loadApiKeySecurely() {
    try {
        if (!fs_1.default.existsSync(API_KEY_FILE)) {
            return null;
        }
        const data = fs_1.default.readFileSync(API_KEY_FILE);
        if (!electron_1.safeStorage.isEncryptionAvailable()) {
            return data.toString('utf-8');
        }
        return electron_1.safeStorage.decryptString(data);
    }
    catch (error) {
        console.error('Failed to load API key:', error);
        return null;
    }
}
function deleteApiKey() {
    try {
        if (fs_1.default.existsSync(API_KEY_FILE)) {
            fs_1.default.unlinkSync(API_KEY_FILE);
        }
        return true;
    }
    catch (error) {
        console.error('Failed to delete API key:', error);
        return false;
    }
}
// Auto-updater configuration
electron_updater_1.autoUpdater.autoDownload = true;
electron_updater_1.autoUpdater.autoInstallOnAppQuit = true;
function setupAutoUpdater() {
    // Don't check for updates in development
    if (process.env.NODE_ENV === 'development') {
        return;
    }
    // Check for updates after app is ready
    electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    // Update events - send to renderer for UI feedback
    electron_updater_1.autoUpdater.on('checking-for-update', () => {
        sendUpdateStatus('checking', 'Checking for updates...');
    });
    electron_updater_1.autoUpdater.on('update-available', (info) => {
        sendUpdateStatus('available', `Update v${info.version} available!`);
        // Show native dialog to notify user
        electron_1.dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Available',
            message: `A new version (v${info.version}) is available!`,
            detail: 'The update is being downloaded in the background. You will be notified when it is ready to install.',
            buttons: ['OK'],
        });
    });
    electron_updater_1.autoUpdater.on('update-not-available', () => {
        sendUpdateStatus('not-available', 'App is up to date');
    });
    electron_updater_1.autoUpdater.on('download-progress', (progress) => {
        sendUpdateStatus('downloading', `Downloading: ${Math.round(progress.percent)}%`, {
            percent: progress.percent,
            transferred: progress.transferred,
            total: progress.total,
        });
    });
    electron_updater_1.autoUpdater.on('update-downloaded', (info) => {
        sendUpdateStatus('downloaded', `Update v${info.version} ready to install`, {
            version: info.version,
        });
        // Show native dialog prompting user to restart
        electron_1.dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Ready',
            message: `Version ${info.version} has been downloaded`,
            detail: 'The update will be installed when you restart the application. Would you like to restart now?',
            buttons: ['Restart Now', 'Later'],
            defaultId: 0,
            cancelId: 1,
        }).then((result) => {
            if (result.response === 0) {
                // User clicked "Restart Now"
                electron_updater_1.autoUpdater.quitAndInstall(false, true);
            }
        });
    });
    electron_updater_1.autoUpdater.on('error', (error) => {
        sendUpdateStatus('error', `Update error: ${error.message}`);
        console.error('Auto-updater error:', error);
        // Show error dialog so user knows something went wrong
        electron_1.dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: 'Update Error',
            message: 'Failed to check for updates',
            detail: error.message,
            buttons: ['OK'],
        });
    });
}
function sendUpdateStatus(status, message, data) {
    if (mainWindow) {
        mainWindow.webContents.send('update-status', { status, message, ...data });
    }
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        icon: path_1.default.join(electron_1.app.getAppPath(), 'build', 'icon.png'),
        webPreferences: {
            preload: path_1.default.join(electron_1.app.getAppPath(), 'electron', 'preload.cjs'),
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
    }
    else {
        // In production, the app structure is:
        // app.asar/
        //   ├── dist/           (Vite build output)
        //   │   └── index.html
        //   └── electron/       (compiled main.js, preload.js)
        //       └── main.js     (__dirname points here)
        mainWindow.loadFile(path_1.default.join(electron_1.app.getAppPath(), 'dist', 'index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// App lifecycle
electron_1.app.whenReady().then(() => {
    createWindow();
    setupAutoUpdater();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// IPC handlers for update control
electron_1.ipcMain.handle('check-for-updates', async () => {
    if (process.env.NODE_ENV === 'development') {
        return { success: false, message: 'Updates disabled in development' };
    }
    try {
        const result = await electron_updater_1.autoUpdater.checkForUpdates();
        return { success: true, version: result?.updateInfo?.version };
    }
    catch (error) {
        return { success: false, message: error.message };
    }
});
electron_1.ipcMain.handle('install-update', () => {
    electron_updater_1.autoUpdater.quitAndInstall(false, true);
});
electron_1.ipcMain.handle('get-app-version', () => {
    return electron_1.app.getVersion();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// IPC Handlers for Claude API (using secure storage)
electron_1.ipcMain.handle('set-api-key', async (_event, key) => {
    if (!key) {
        const deleted = deleteApiKey();
        return { success: deleted };
    }
    const saved = saveApiKeySecurely(key);
    return { success: saved };
});
electron_1.ipcMain.handle('get-api-key', async () => {
    return loadApiKeySecurely();
});
electron_1.ipcMain.handle('has-api-key', async () => {
    return loadApiKeySecurely() !== null;
});
electron_1.ipcMain.handle('get-spending-tips', async (_event, data) => {
    const apiKey = loadApiKeySecurely();
    if (!apiKey) {
        return {
            success: false,
            error: 'Claude API key not configured. Please add your API key in Settings.',
        };
    }
    try {
        // Dynamic import for Anthropic SDK
        const Anthropic = (await Promise.resolve().then(() => __importStar(require('@anthropic-ai/sdk')))).default;
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
    }
    catch (error) {
        console.error('Claude API error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
});
