import { Zap } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';

export function PremiumAutomationPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Automation" />

      <div className="flex-1 overflow-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Automation</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Automated expense tracking, recurring transactions, and smart categorization.
                Coming soon in a future update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
