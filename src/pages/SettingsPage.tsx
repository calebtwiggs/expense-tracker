import { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, Moon, Sun, DollarSign, Trash2, RefreshCw, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUIStore } from '@/stores/useUIStore';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { db } from '@/db/database';

export function SettingsPage() {
  const { theme, setTheme, claudeApiKey, setClaudeApiKey } = useUIStore();
  const { budgetLimit, setBudgetLimit } = useExpenseStore();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budgetLimit?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  // Update state
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  useEffect(() => {
    // Get app version on mount
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then(setAppVersion);
    }

    // Listen for update status changes
    if (window.electronAPI?.onUpdateStatus) {
      const cleanup = window.electronAPI.onUpdateStatus((status) => {
        setUpdateStatus(status);
        if (status.status !== 'checking') {
          setIsCheckingUpdates(false);
        }
      });
      return cleanup;
    }
  }, []);

  const handleCheckUpdates = async () => {
    if (!window.electronAPI?.checkForUpdates) return;
    setIsCheckingUpdates(true);
    setUpdateStatus(null);
    await window.electronAPI.checkForUpdates();
  };

  const handleInstallUpdate = () => {
    if (window.electronAPI?.installUpdate) {
      window.electronAPI.installUpdate();
    }
  };

  const handleSaveApiKey = async () => {
    setIsSaving(true);
    try {
      setClaudeApiKey(apiKeyInput);
      if (window.electronAPI) {
        await window.electronAPI.setApiKey(apiKeyInput);
      }
      setApiKeyInput('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveApiKey = () => {
    setClaudeApiKey(null);
    if (window.electronAPI) {
      window.electronAPI.setApiKey('');
    }
  };

  const handleSaveBudget = () => {
    const budget = parseFloat(budgetInput);
    if (!isNaN(budget) && budget > 0) {
      setBudgetLimit(budget);
    } else {
      setBudgetLimit(null);
    }
  };

  const handleClearData = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete ALL data? This cannot be undone.'
      )
    ) {
      await db.expenses.clear();
      await db.savingsGoals.clear();
      await db.savingsContributions.clear();
      await db.monthlyRecords.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" />

      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-2xl">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how the app looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'dark' : 'light')
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Budget
            </CardTitle>
            <CardDescription>
              Set a monthly spending limit to track against
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="Enter monthly budget"
                  className="pl-7"
                />
              </div>
              <Button onClick={handleSaveBudget}>Save</Button>
            </div>
            {budgetLimit && (
              <p className="text-sm text-muted-foreground">
                Current budget: ${budgetLimit.toFixed(2)} per month
              </p>
            )}
          </CardContent>
        </Card>

        {/* Claude API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Claude API Configuration
            </CardTitle>
            <CardDescription>
              Enter your Claude API key to enable AI-powered spending tips.
              Get your key from{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                console.anthropic.com
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {claudeApiKey ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">API Key Configured</p>
                    <p className="text-xs text-muted-foreground">
                      Key ending in ...{claudeApiKey.slice(-8)}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveApiKey}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-ant-..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Button onClick={handleSaveApiKey} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your stored data. These actions cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        {/* About & Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              About & Updates
            </CardTitle>
            <CardDescription>
              App version and update management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Expense Tracker</p>
                <p className="text-sm text-muted-foreground">
                  Version {appVersion}
                </p>
              </div>
              {window.electronAPI && (
                <Button
                  variant="outline"
                  onClick={handleCheckUpdates}
                  disabled={isCheckingUpdates}
                >
                  {isCheckingUpdates ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check for Updates
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Update Status */}
            {updateStatus && (
              <div className={`p-3 rounded-lg flex items-center gap-3 ${
                updateStatus.status === 'downloaded'
                  ? 'bg-green-500/10 text-green-500'
                  : updateStatus.status === 'error'
                    ? 'bg-destructive/10 text-destructive'
                    : updateStatus.status === 'available' || updateStatus.status === 'downloading'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-muted text-muted-foreground'
              }`}>
                {updateStatus.status === 'downloaded' && <CheckCircle2 className="h-5 w-5" />}
                {updateStatus.status === 'error' && <AlertCircle className="h-5 w-5" />}
                {updateStatus.status === 'downloading' && <Download className="h-5 w-5 animate-pulse" />}
                {updateStatus.status === 'available' && <Download className="h-5 w-5" />}
                {updateStatus.status === 'not-available' && <CheckCircle2 className="h-5 w-5" />}

                <div className="flex-1">
                  <p className="text-sm font-medium">{updateStatus.message}</p>
                  {updateStatus.status === 'downloading' && updateStatus.percent !== undefined && (
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${updateStatus.percent}%` }}
                      />
                    </div>
                  )}
                </div>

                {updateStatus.status === 'downloaded' && (
                  <Button size="sm" onClick={handleInstallUpdate}>
                    Restart & Update
                  </Button>
                )}
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
              <p>Built with React, TypeScript, Electron, and Tailwind CSS</p>
              <p>Data stored locally using IndexedDB</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
