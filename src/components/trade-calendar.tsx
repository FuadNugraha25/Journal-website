'use client';

import { useMemo, useState } from 'react';
import type { Trade } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type DailyStats = {
  totalProfit: number;
  tradeCount: number;
};

function formatCurrency(value: number) {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function DayCell({ date, stats }: { date: Date, stats: DailyStats | undefined }) {
  if (!stats || stats.tradeCount === 0) {
    return <div className="h-full w-full p-2 text-left">{format(date, 'd')}</div>;
  }

  return (
    <div className={cn(
      "h-full w-full p-2 flex flex-col justify-between text-left",
      stats.totalProfit > 0 ? 'bg-green-800/20' : 'bg-red-800/20'
    )}>
      <span className="font-bold">{format(date, 'd')}</span>
      <div className="text-right">
        <p className={cn(
          "font-bold text-sm",
          stats.totalProfit > 0 ? 'text-green-400' : 'text-red-400'
        )}>
          {formatCurrency(stats.totalProfit)}
        </p>
        <p className="text-xs text-muted-foreground">{stats.tradeCount} trades</p>
      </div>
    </div>
  )
}

export function TradeCalendar({ trades }: { trades: Trade[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dailyStats = useMemo(() => {
    const stats: Record<string, DailyStats> = {};
    trades.forEach((trade) => {
      const day = format(trade.closeDate, 'yyyy-MM-dd');
      if (!stats[day]) {
        stats[day] = { totalProfit: 0, tradeCount: 0 };
      }
      stats[day].totalProfit += trade.profit;
      stats[day].tradeCount += 1;
    });
    return stats;
  }, [trades]);
  
  return (
    <Calendar
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        components={{
            DayContent: ({ date }) => {
                const dayKey = format(date, 'yyyy-MM-dd');
                return <DayCell date={date} stats={dailyStats[dayKey]} />;
            },
        }}
        classNames={{
            day: 'h-24 w-full p-0 text-left align-top',
            day_selected: '',
            day_today: 'bg-accent text-accent-foreground',
            head_cell: 'w-full',
            row: 'w-full flex'
        }}
    />
  );
}
