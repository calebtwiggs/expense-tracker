"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // AI Tips
    getSpendingTips: (data) => electron_1.ipcRenderer.invoke('get-spending-tips', data),
    setApiKey: (key) => electron_1.ipcRenderer.invoke('set-api-key', key),
    getApiKey: () => electron_1.ipcRenderer.invoke('get-api-key'),
    hasApiKey: () => electron_1.ipcRenderer.invoke('has-api-key'),
    // Auto-updater
    checkForUpdates: () => electron_1.ipcRenderer.invoke('check-for-updates'),
    installUpdate: () => {
        electron_1.ipcRenderer.invoke('install-update');
    },
    getAppVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
    onUpdateStatus: (callback) => {
        const handler = (_event, status) => callback(status);
        electron_1.ipcRenderer.on('update-status', handler);
        // Return cleanup function
        return () => electron_1.ipcRenderer.removeListener('update-status', handler);
    },
});
