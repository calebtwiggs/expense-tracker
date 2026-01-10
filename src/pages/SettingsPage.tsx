import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Key, Moon, Sun, DollarSign, Trash2, RefreshCw, Download, CheckCircle2, AlertCircle, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PatchNotesPopover } from '@/components/PatchNotesPopover';
import { useUIStore } from '@/stores/useUIStore';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { db } from '@/db/database';
import { toast } from '@/hooks/useToast';
import { exportAllData, downloadAsJson, downloadAsCsv, importData } from '@/lib/exportData';

export function SettingsPage() {
  const { theme, setTheme, hasApiKey, setHasApiKey } = useUIStore();
  const { budgetLimit, setBudgetLimit } = useExpenseStore();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budgetLimit?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  useEffect(() => {
    // Get app version on mount
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then(setAppVersion);
    }

    // Check if API key is configured (securely stored)
    if (window.electronAPI?.hasApiKey) {
      window.electronAPI.hasApiKey().then(setHasApiKey);
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
  }, [setHasApiKey]);

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
      if (window.electronAPI) {
        const result = await window.electronAPI.setApiKey(apiKeyInput);
        if (result.success) {
          setHasApiKey(true);
          setApiKeyInput('');
          toast({
            title: 'API key saved',
            description: 'Your Claude API key has been securely stored.',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to save API key.',
            variant: 'destructive',
          });
        }
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save API key.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveApiKey = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.setApiKey('');
      if (result.success) {
        setHasApiKey(false);
        toast({
          title: 'API key removed',
          description: 'Your Claude API key has been deleted.',
        });
      }
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

  const handleExportJson = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      downloadAsJson(data);
      toast({
        title: 'Export successful',
        description: 'Your data has been downloaded as JSON.',
      });
    } catch {
      toast({
        title: 'Export failed',
        description: 'Could not export your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      downloadAsCsv(data);
      toast({
        title: 'Export successful',
        description: 'Your expenses have been downloaded as CSV.',
      });
    } catch {
      toast({
        title: 'Export failed',
        description: 'Could not export your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await importData(file);
      if (result.success) {
        toast({
          title: 'Import successful',
          description: result.message + '. Reloading...',
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({
          title: 'Import failed',
          description: result.message,
          variant: 'destructive',
        });
        setIsImporting(false);
      }
    } catch {
      toast({
        title: 'Import failed',
        description: 'Could not read the backup file.',
        variant: 'destructive',
      });
      setIsImporting(false);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await db.expenses.clear();
      await db.savingsGoals.clear();
      await db.savingsContributions.clear();
      await db.monthlyRecords.clear();
      toast({
        title: 'Data cleared',
        description: 'All your data has been deleted. Reloading...',
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to clear data. Please try again.',
        variant: 'destructive',
      });
      setIsClearing(false);
      setShowClearDataDialog(false);
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
            {hasApiKey ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">API Key Configured</p>
                    <p className="text-xs text-muted-foreground">
                      Securely stored in system keychain
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

        {/* Export & Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export & Backup
            </CardTitle>
            <CardDescription>
              Export your data for backup or use in other applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleExportJson}
                disabled={isExporting}
              >
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCsv}
                disabled={isExporting}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Expenses as CSV
              </Button>
            </div>
            <div className="pt-4 border-t">
              <Label htmlFor="import-file" className="text-sm font-medium">
                Restore from Backup
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Import a previously exported JSON backup file.
              </p>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="max-w-xs"
                />
                {isImporting && (
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Upload className="h-4 w-4 mr-1 animate-pulse" />
                    Importing...
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions. Please be careful.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setShowClearDataDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={showClearDataDialog}
          onOpenChange={setShowClearDataDialog}
          title="Delete All Data"
          description="Are you sure you want to delete ALL your data? This includes all expenses, savings goals, and contribution history. This action cannot be undone."
          confirmLabel="Delete Everything"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={handleClearData}
          isLoading={isClearing}
        />

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
                  Version {appVersion} (Beta)
                </p>
                <PatchNotesPopover currentVersion={appVersion} />
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
