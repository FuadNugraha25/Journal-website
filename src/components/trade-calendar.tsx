'use client';

import { useMemo, useState } from 'react';
import type { Trade } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subMonths,
  addMonths,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

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

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startingDayOfWeek = getDay(startOfMonth(currentMonth));
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-t border-l border-border">
        {daysOfWeek.map((day) => (
          <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground border-b border-r border-border">
            {day}
          </div>
        ))}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="border-b border-r border-border" />
        ))}
        {daysInMonth.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const stats = dailyStats[dayKey];
          return (
            <div
              key={day.toString()}
              className={cn(
                'h-28 p-2 flex flex-col border-b border-r border-border',
                stats && stats.tradeCount > 0 ? (stats.totalProfit > 0 ? 'bg-green-800/20' : 'bg-red-800/20') : '',
                isToday(day) ? 'bg-accent text-accent-foreground' : ''
              )}
            >
              <span className={cn('font-semibold', isToday(day) ? 'text-blue-500' : '')}>{format(day, 'd')}</span>
              {stats && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <p className={cn('font-bold text-lg', stats.totalProfit > 0 ? 'text-green-400' : 'text-red-400')}>
                    {formatCurrency(stats.totalProfit)}
                  </p>
                  <p className="text-sm text-muted-foreground">{stats.tradeCount} trade{stats.tradeCount > 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
