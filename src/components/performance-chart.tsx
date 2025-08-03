'use client';

import { useMemo } from 'react';
import type { Trade } from '@/lib/types';
import { format } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const chartConfig = {
  pnl: {
    label: 'P/L',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function PerformanceChart({ trades }: { trades: Trade[] }) {
  const chartData = useMemo(() => {
    if (trades.length === 0) return [];
    
    const sortedTrades = [...trades].sort((a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime());
    
    let cumulativePnl = 0;
    return sortedTrades.map((trade) => {
      cumulativePnl += trade.profit;
      return {
        date: format(new Date(trade.closeDate), 'MMM d'),
        pnl: cumulativePnl,
      };
    });
  }, [trades]);

  if (trades.length === 0) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <p className="text-muted-foreground">No data to display. Add some trades!</p>
        </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 5,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value}
        />
        <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `$${value}`}
        />
        <ChartTooltip
          cursor={true}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Line
          dataKey="pnl"
          type="monotone"
          stroke="var(--color-pnl)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
