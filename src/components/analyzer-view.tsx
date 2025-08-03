'use client';

import { useState, useTransition } from 'react';
import type { Trade } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wand2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { aiTradeAnalyzer } from '@/ai/flows/ai-trade-analyzer';
import { format } from 'date-fns';

export function AnalyzerView({ trades }: { trades: Trade[] }) {
  const [isPending, startTransition] = useTransition();
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = () => {
    setError(null);
    setReport(null);
    startTransition(async () => {
      if (trades.length < 5) {
        setError("You need at least 5 trades to get a meaningful analysis.");
        return;
      }

      const tradingHistory = trades
        .map(
          (t) =>
            `Pair: ${t.pair}, Type: ${t.type}, P/L: ${t.profit.toFixed(2)}, R/R: ${t.riskRewardRatio}, Date: ${format(t.closeDate, 'yyyy-MM-dd')}`
        )
        .join('\n');

      try {
        const result = await aiTradeAnalyzer({ tradingHistory });
        setReport(result.analysisReport);
      } catch (e) {
        console.error(e);
        setError('An unexpected error occurred while generating the report.');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          AI Trade Analyzer
        </CardTitle>
        <CardDescription>
          Get personalized insights and suggestions based on your trading history.
          Our AI will analyze your patterns to help you improve.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-start">
          <Button onClick={handleAnalysis} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPending && <ReportSkeleton />}

        {report && (
          <Card className="bg-background/50">
            <CardHeader>
              <CardTitle className="font-headline">Your Analysis Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert prose-sm md:prose-base max-w-none whitespace-pre-wrap rounded-md bg-muted/50 p-4 font-mono text-sm text-foreground">
                {report}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
