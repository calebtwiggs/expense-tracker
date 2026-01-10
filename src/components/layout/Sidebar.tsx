import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  History,
  Settings,
  Wallet,
  Plus,
  Crown,
  ChevronDown,
  Sparkles,
  Zap,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AddSavingsModal } from '@/components/savings/AddSavingsModal';
import { PatchNotesModal } from '@/components/PatchNotesModal';

const navItemsTop = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/savings', icon: PiggyBank, label: 'Savings' },
  { to: '/history', icon: History, label: 'History' },
];

const navItemsBottom = [
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const premiumSubItems = [
  { to: '/premium/ai-tips', icon: Bot, label: 'AI Spending Tips', comingSoon: true },
  { to: '/premium/insights', icon: Sparkles, label: 'Smart Insights', comingSoon: true },
  { to: '/premium/automation', icon: Zap, label: 'Automation', comingSoon: true },
];

export function Sidebar() {
  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const location = useLocation();

  const isPremiumActive = location.pathname.startsWith('/premium');

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
        {/* Top nav items: Dashboard, Expenses, Savings, History */}
        {navItemsTop.map(({ to, icon: Icon, label }) => (
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

        {/* Premium Features with Dropdown - between History and Settings */}
        <div>
          <button
            onClick={() => setIsPremiumOpen(!isPremiumOpen)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors',
              isPremiumActive
                ? 'bg-blue-600 text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5" />
              <span className="font-medium">Premium Features</span>
              <span className="text-xs opacity-70">(Coming Soon)</span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isPremiumOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isPremiumOpen && (
            <div className="mt-1 ml-2 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {premiumSubItems.map(({ to, icon: Icon, label, comingSoon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                  {comingSoon && (
                    <span className="text-xs opacity-70">(Coming Soon)</span>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Bottom nav items: Settings */}
        {navItemsBottom.map(({ to, icon: Icon, label }) => (
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
          </div>
        ))}
      </nav>

      <AddSavingsModal
        isOpen={isAddSavingsOpen}
        onClose={() => setIsAddSavingsOpen(false)}
      />

      <div className="p-4 border-t border-border">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          <p>Expense Tracker v{__APP_VERSION__}</p>
          <p>Developed by: Caleb Twiggs</p>
          <p>Beta Version</p>
          <PatchNotesModal currentVersion={__APP_VERSION__} />
        </div>
      </div>
    </aside>
  );
}
