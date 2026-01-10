import { ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useExpenseStore } from '@/stores/useExpenseStore';
import { useUIStore } from '@/stores/useUIStore';

interface HeaderProps {
  title: string;
  showMonthSelector?: boolean;
}

export function Header({ title, showMonthSelector = false }: HeaderProps) {
  const { currentMonth, setCurrentMonth } = useExpenseStore();
  const { theme, setTheme } = useUIStore();

  const currentDate = new Date(currentMonth.year, currentMonth.month - 1);

  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentDate, 1);
    setCurrentMonth(prevMonth.getFullYear(), prevMonth.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    setCurrentMonth(nextMonth.getFullYear(), nextMonth.getMonth() + 1);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">{title}</h1>

        {showMonthSelector && (
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
