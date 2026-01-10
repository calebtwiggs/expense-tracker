import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, useDayPicker } from 'react-day-picker';
import { format, addMonths, subMonths, isSameMonth, isAfter, startOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  disableFuture?: boolean;
};

const DisableFutureContext = React.createContext(false);

function CustomCaption({ calendarMonth }: { calendarMonth: { date: Date } }) {
  const { goToMonth } = useDayPicker();
  const disableFuture = React.useContext(DisableFutureContext);
  const today = new Date();

  const isCurrentMonth = isSameMonth(calendarMonth.date, today);
  const isFutureMonth = isAfter(startOfMonth(calendarMonth.date), startOfMonth(today));
  const disableNext = disableFuture && (isCurrentMonth || isFutureMonth);

  const handlePreviousMonth = () => {
    goToMonth(subMonths(calendarMonth.date, 1));
  };

  const handleNextMonth = () => {
    if (!disableNext) {
      goToMonth(addMonths(calendarMonth.date, 1));
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 pt-1">
      <Button
        variant="outline"
        className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        onClick={handlePreviousMonth}
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium px-2">
        {format(calendarMonth.date, 'MMMM yyyy')}
      </span>
      <Button
        variant="outline"
        className={cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          disableNext && "opacity-20 cursor-not-allowed hover:opacity-20"
        )}
        onClick={handleNextMonth}
        disabled={disableNext}
        type="button"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  disableFuture = false,
  disabled,
  ...props
}: CalendarProps) {
  const today = new Date();

  // Combine any existing disabled matcher with future dates if disableFuture is true
  const disabledMatcher = disableFuture
    ? (date: Date) => {
        const isDateDisabled = typeof disabled === 'function'
          ? disabled(date)
          : disabled instanceof Date
            ? date.getTime() === disabled.getTime()
            : Array.isArray(disabled)
              ? disabled.some(d => d instanceof Date && date.getTime() === d.getTime())
              : false;
        return isDateDisabled || isAfter(date, today);
      }
    : disabled;

  return (
    <DisableFutureContext.Provider value={disableFuture}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn('p-3', className)}
        hideNavigation
        disabled={disabledMatcher}
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          month: 'space-y-4',
          month_grid: 'w-full border-collapse space-y-1',
          weekdays: 'flex',
          weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
          week: 'flex w-full mt-2',
          day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
          day_button: cn(
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground',
            'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
          ),
          range_end: 'day-range-end',
          selected:
            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          today: 'bg-accent text-accent-foreground',
          outside:
            'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
          disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
          range_middle:
            'aria-selected:bg-accent aria-selected:text-accent-foreground',
          hidden: 'invisible',
          ...classNames,
        }}
        components={{
          MonthCaption: CustomCaption,
        }}
        {...props}
      />
    </DisableFutureContext.Provider>
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
