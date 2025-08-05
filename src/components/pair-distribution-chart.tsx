'use client';

import { useMemo } from 'react';
import type { Trade } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

const chartConfig = {
  trades: {
    label: 'Trades',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

// Colors specifically for the 3 pairs
const PAIR_COLORS = {
  XAUUSD: 'hsl(var(--chart-2))', // Gold
  GBPJPY: 'hsl(var(--chart-3))', // Blue
  EURUSD: 'hsl(var(--chart-4))', // Green
};

// Fallback colors if needed
const FALLBACK_COLORS = [
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

export function PairDistributionChart({ trades }: { trades: Trade[] }) {
  const chartData = useMemo(() => {
    if (trades.length === 0) return [];
    
    // Define the valid pairs
    const validPairs = ['XAUUSD', 'GBPJPY', 'EURUSD'] as const;
    
    const pairCounts: Record<string, number> = {};
    
    // Only count trades with valid pairs
    trades.forEach((trade) => {
      if (validPairs.includes(trade.pair as any)) {
        pairCounts[trade.pair] = (pairCounts[trade.pair] || 0) + 1;
      }
    });

    return Object.entries(pairCounts)
      .map(([pair, count], index) => ({
        name: pair,
        value: count,
        color: PAIR_COLORS[pair as keyof typeof PAIR_COLORS] || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
        percentage: ((count / trades.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);
  }, [trades]);

  if (trades.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No data to display. Add some trades!</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <PieChart
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
          }}
        >
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Pair
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {data.name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Trades
                        </span>
                        <span className="font-bold">
                          {data.value} ({data.percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ChartContainer>
      
      {/* Color Legend */}
      <div className="mt-4 flex justify-center gap-4 text-xs">
        {Object.entries(PAIR_COLORS).map(([pair, color]) => (
          <div key={pair} className="flex items-center gap-1">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="text-muted-foreground">{pair}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 