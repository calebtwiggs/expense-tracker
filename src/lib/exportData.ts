import { db } from '@/db/database';
import { format } from 'date-fns';

export interface ExportData {
  version: string;
  exportedAt: string;
  expenses: unknown[];
  savingsGoals: unknown[];
  savingsContributions: unknown[];
  monthlyRecords: unknown[];
}

export async function exportAllData(): Promise<ExportData> {
  const [expenses, savingsGoals, savingsContributions, monthlyRecords] = await Promise.all([
    db.expenses.toArray(),
    db.savingsGoals.toArray(),
    db.savingsContributions.toArray(),
    db.monthlyRecords.toArray(),
  ]);

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    expenses,
    savingsGoals,
    savingsContributions,
    monthlyRecords,
  };
}

export function downloadAsJson(data: ExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `expense-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAsCsv(data: ExportData): void {
  // Export expenses as CSV
  const expenses = data.expenses as Array<{
    date: string;
    category: string;
    amount: number;
    description: string;
  }>;

  if (expenses.length === 0) {
    return;
  }

  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const rows = expenses.map(e => [
    format(new Date(e.date), 'yyyy-MM-dd'),
    e.category,
    e.amount.toString(),
    `"${(e.description || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `expense-tracker-expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as ExportData;

    if (!data.version || !data.expenses) {
      return { success: false, message: 'Invalid backup file format' };
    }

    // Clear existing data
    await Promise.all([
      db.expenses.clear(),
      db.savingsGoals.clear(),
      db.savingsContributions.clear(),
      db.monthlyRecords.clear(),
    ]);

    // Import new data
    if (data.expenses.length > 0) {
      await db.expenses.bulkAdd(data.expenses as never[]);
    }
    if (data.savingsGoals?.length > 0) {
      await db.savingsGoals.bulkAdd(data.savingsGoals as never[]);
    }
    if (data.savingsContributions?.length > 0) {
      await db.savingsContributions.bulkAdd(data.savingsContributions as never[]);
    }
    if (data.monthlyRecords?.length > 0) {
      await db.monthlyRecords.bulkAdd(data.monthlyRecords as never[]);
    }

    return {
      success: true,
      message: `Imported ${data.expenses.length} expenses and ${data.savingsGoals?.length || 0} goals`
    };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, message: 'Failed to parse backup file' };
  }
}
