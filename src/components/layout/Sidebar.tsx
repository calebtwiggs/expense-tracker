import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  History,
  Settings,
  Wallet,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AddSavingsModal } from '@/components/savings/AddSavingsModal';
import { PatchNotesPopover } from '@/components/PatchNotesPopover';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/savings', icon: PiggyBank, label: 'Savings' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Expense Tracker</h1>
            <p className="text-xs text-muted-foreground">Manage your finances</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <div key={to} className="flex items-center gap-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
            {label === 'Savings' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsAddSavingsOpen(true)}
                title="Add Savings"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </nav>

      <AddSavingsModal
        isOpen={isAddSavingsOpen}
        onClose={() => setIsAddSavingsOpen(false)}
      />

      <div className="p-4 border-t border-border">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          <p>Expense Tracker v1.0</p>
          <p>Developed by: Caleb Twiggs</p>
          <p>Beta Version</p>
          <PatchNotesPopover currentVersion="1.0.0" />
        </div>
      </div>
    </aside>
  );
}
