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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const getTradesForDate = (date: Date) => {
    return trades.filter(trade => isSameDay(trade.closeDate, date));
  };

  const getMonthlyStats = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const monthTrades = trades.filter(trade => 
      trade.closeDate >= monthStart && trade.closeDate <= monthEnd
    );

    if (monthTrades.length === 0) return null;

    // Best day (highest total profit)
    const dailyProfits: Record<string, number> = {};
    monthTrades.forEach(trade => {
      const dayKey = format(trade.closeDate, 'yyyy-MM-dd');
      dailyProfits[dayKey] = (dailyProfits[dayKey] || 0) + trade.profit;
    });

    const bestDay = Object.entries(dailyProfits).reduce((best, [day, profit]) => 
      profit > best.profit ? { day, profit } : best, 
      { day: '', profit: -Infinity }
    );

    // Worst trade (lowest profit)
    const worstTrade = monthTrades.reduce((worst, trade) => 
      trade.profit < worst.profit ? trade : worst, 
      monthTrades[0]
    );

    return {
      totalTrades: monthTrades.length,
      bestDay: bestDay.day ? { date: new Date(bestDay.day), profit: bestDay.profit } : null,
      worstTrade
    };
  };

  const handleDateClick = (date: Date) => {
    const dayTrades = getTradesForDate(date);
    if (dayTrades.length > 0) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  };

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
    <div className="w-full max-w-2xl">
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
          <div key={day} className="p-1 text-center text-xs font-medium text-muted-foreground border-b border-r border-border aspect-square flex items-center justify-center">
            {day}
          </div>
        ))}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="border-b border-r border-border aspect-square" />
        ))}
        {daysInMonth.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const stats = dailyStats[dayKey];
          return (
            <div
              key={day.toString()}
              className={cn(
                'p-1 flex flex-col border-b border-r border-border aspect-square',
                stats && stats.tradeCount > 0 ? (stats.totalProfit > 0 ? 'bg-green-800/20' : 'bg-red-800/20') : '',
                isToday(day) ? 'bg-accent text-accent-foreground' : '',
                selectedDate && isSameDay(day, selectedDate) ? 'bg-blue-800/20' : '',
                stats && stats.tradeCount > 0 ? 'cursor-pointer hover:bg-opacity-80 hover:scale-105 transition-all duration-200 ease-in-out' : ''
              )}
              onClick={() => handleDateClick(day)}
            >
              <span className={cn('text-xs font-semibold', isToday(day) ? 'text-blue-500' : '')}>{format(day, 'd')}</span>
              {stats && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                  <p className={cn('font-bold text-xs leading-tight', stats.totalProfit > 0 ? 'text-green-400' : 'text-red-400')}>
                    {formatCurrency(stats.totalProfit)}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">{stats.tradeCount} trade{stats.tradeCount > 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Monthly Summary */}
      {(() => {
        const monthlyStats = getMonthlyStats();
        if (!monthlyStats) return null;
        
        return (
          <div className="mt-6 p-4 border border-border rounded-lg bg-muted/20">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
              {format(currentMonth, 'MMMM yyyy')} Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Total Trades</span>
                <span className="font-bold text-lg">{monthlyStats.totalTrades}</span>
              </div>
              {monthlyStats.bestDay && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Best Day</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-400">{formatCurrency(monthlyStats.bestDay.profit)}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(monthlyStats.bestDay.date, 'MMM dd')}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Worst Trade</span>
                <div className="flex items-center gap-2">
                  <span className={cn('font-bold', monthlyStats.worstTrade.profit > 0 ? 'text-green-400' : 'text-red-400')}>
                    {formatCurrency(monthlyStats.worstTrade.profit)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(monthlyStats.worstTrade.closeDate, 'MMM dd')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Trade Details'}</DialogTitle>
          </DialogHeader>
          {selectedDate && (
            <div className="mt-4">
              {getTradesForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getTradesForDate(selectedDate).map((trade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{trade.pair}</span>
                          <span className={cn('text-xs px-2 py-1 rounded', trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                            {trade.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {trade.strategy} • {trade.session} • {format(trade.closeDate, 'HH:mm')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn('font-bold text-lg', trade.profit > 0 ? 'text-green-400' : 'text-red-400')}>
                          {formatCurrency(trade.profit)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          R:R {trade.riskRewardRatio}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No trades for this date</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
