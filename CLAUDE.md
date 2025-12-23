# Expense Tracker

A personal finance application for tracking monthly expenses, categorizing spending, and visualizing financial data through interactive graphs. Maintains historical records organized by month and year.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **Charts:** Recharts for data visualization
- **State:** Zustand for lightweight state management
- **Storage:** IndexedDB via Dexie.js for local persistence
- **Testing:** Vitest + React Testing Library

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui primitives
│   ├── charts/       # Graph components (pie, line, bar)
│   │   ├── SavingsProgressChart.tsx   # Pie chart of goal distribution
│   │   ├── SavingsTrendChart.tsx      # Line chart of savings over time
│   │   └── GoalTimelineChart.tsx      # Gantt-style timeline for events
│   ├── forms/        # Input forms for expenses
│   └── savings/      # Savings goals components
│       ├── SavingsGoalCard.tsx         # Individual goal display
│       ├── SavingsGoalForm.tsx         # Create/edit goal form
│       ├── SavingsGoalList.tsx         # List with filters
│       ├── SavingsAllocationModal.tsx  # Prompt to allocate savings
│       ├── GoalProgressBar.tsx         # Reusable progress bar
│       ├── GoalTimeline.tsx            # Timeline view component
│       └── SavingsDashboard.tsx        # Full savings overview
├── pages/            # Route-level page components
│   └── SavingsPage.tsx                 # Savings goals page
├── hooks/            # Custom React hooks
│   ├── useSavingsGoal.ts
│   └── useSavingsCalculations.ts
├── stores/           # Zustand state stores
│   └── useSavingsGoalStore.ts
├── lib/              # Utilities and helpers
│   └── savingsCalculations.ts          # Smart calculation utilities
├── db/               # Database schema and operations
└── types/            # TypeScript type definitions
    └── savingsGoal.types.ts
```

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint and format check
```

## Core Data Models

```typescript
interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;           // Full date for the expense
  createdAt: Date;
}

type ExpenseCategory = 
  | 'housing' | 'utilities' | 'groceries' | 'transportation'
  | 'healthcare' | 'entertainment' | 'dining' | 'shopping'
  | 'subscriptions' | 'education' | 'savings' | 'other';

interface MonthlyRecord {
  id: string;           // Format: "YYYY-MM" (e.g., "2025-12")
  year: number;
  month: number;        // 1-12
  expenses: Expense[];
  totalSpent: number;
  totalSaved: number;   // Sum of 'savings' category expenses
  budgetLimit?: number;
}

// Savings Goal Types
type SavingsGoalType = 'monthly' | 'event';
type SavingsGoalStatus = 'active' | 'paused' | 'completed' | 'cancelled';
type EventGoalCategory =
  | 'vacation' | 'vehicle' | 'emergency_fund' | 'home_improvement'
  | 'electronics' | 'education' | 'wedding' | 'medical' | 'custom';

interface SavingsGoal {
  id: string;
  type: SavingsGoalType;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;        // Calculated from contributions
  status: SavingsGoalStatus;
  createdAt: Date;
  updatedAt: Date;

  // Monthly goal fields (type='monthly')
  rolloverEnabled: boolean;     // Shortfalls roll to next month
  startMonth: string;           // Format: "YYYY-MM"

  // Event goal fields (type='event')
  category?: EventGoalCategory;
  targetDate?: Date;            // Deadline to reach goal
  priority?: 'low' | 'medium' | 'high';
}

interface SavingsContribution {
  id: string;
  expenseId: string;            // References Expense where category='savings'
  goalId: string;               // References SavingsGoal.id
  amount: number;               // Portion allocated to this goal
  date: Date;
  createdAt: Date;
}
```

## Key Features

1. **Expense Input** – Form to add expenses with amount, category, date, and description
2. **Category Breakdown** – Pie chart showing spending distribution by category
3. **Monthly Trends** – Line/bar charts comparing spending across months
4. **Historical Records** – Browse and filter expenses by month/year
5. **Budget Tracking** – Optional monthly budget limits with visual indicators
6. **Savings Goals** – Track monthly and event-based savings goals:
   - Monthly goals with automatic rollover of shortfalls
   - Event goals (vacation, car, etc.) with target dates
   - Smart calculation of required monthly savings
   - Allocation prompt when adding savings expenses
   - Full dashboard with progress bars, pie chart, trends, and timeline

## Coding Standards

- **Components:** Functional components with TypeScript props interfaces
- **Naming:** PascalCase for components, camelCase for functions/variables
- **Styling:** Tailwind utility classes; extract to `cn()` helper for conditional classes
- **State:** Keep component state minimal; lift shared state to Zustand stores
- **Forms:** Use react-hook-form with zod validation schemas
- **Dates:** Use date-fns for all date manipulation

## File Naming

- Components: `ComponentName.tsx`
- Hooks: `useHookName.ts`
- Stores: `useStoreName.ts`
- Types: `modelName.types.ts`
- Utils: `utilityName.ts`

## UI/UX Guidelines

- Dark mode by default with light mode toggle
- Mobile-first responsive design
- Use shadcn/ui components as base primitives
- Consistent spacing using Tailwind's spacing scale
- Charts should use a cohesive color palette for categories
- Form validation with inline error messages
- Confirm dialogs for destructive actions (delete expense)

## Error Handling

- Wrap async operations in try/catch
- Display user-friendly toast notifications for errors
- Log errors to console in development only
- Validate all user input before processing

## Testing Approach

- Unit tests for utility functions and hooks
- Integration tests for form submissions and data flow
- Component tests for critical UI interactions
- Mock IndexedDB for database operation tests

## Savings Goals Behavior

### Monthly Goals
- Set a recurring monthly savings target
- Shortfalls automatically roll over (save $50 less → next month needs $50 more)
- Track progress with visual indicators

### Event Goals
- Set a target amount and deadline (e.g., $3000 for vacation by June 2026)
- Auto-calculate required monthly savings: `(target - current) / monthsRemaining`
- Priority levels (low, medium, high) for allocation suggestions
- Visual timeline showing all event goals with deadlines

### Savings Allocation
- When adding an expense with category='savings', prompt modal appears
- User can split the amount across multiple active goals
- Unallocated savings tracked separately

### Visualizations
- **Progress Bars** – Per-goal progress with percentage
- **Pie Chart** – Distribution of savings across goals
- **Line Chart** – Savings trends over time (monthly totals)
- **Timeline** – Gantt-style view of event goals with deadlines and progress







