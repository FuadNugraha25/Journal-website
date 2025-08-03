'use client';

import { useMemo, useState } from 'react';
import type { Trade, TradePair } from '@/lib/types';
import { StatsCard } from './stats-card';
import { PerformanceChart } from './performance-chart';
import { TradesTable } from './trades-table';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DollarSign, Percent, BarChart, ArrowRightLeft } from 'lucide-react';

type Filter = {
  pair: 'all' | TradePair;
};

export function DashboardLayout({ initialTrades }: { initialTrades: Trade[] }) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [filters, setFilters] = useState<Filter>({ pair: 'all' });

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (filters.pair === 'all') return true;
      return trade.pair === filters.pair;
    });
  }, [trades, filters]);

  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    if (totalTrades === 0) {
      return { totalPnl: 0, winRate: 0, totalTrades: 0, avgPnl: 0 };
    }
    const totalPnl = filteredTrades.reduce((acc, trade) => acc + trade.profit, 0);
    const winningTrades = filteredTrades.filter((trade) => trade.profit > 0).length;
    const winRate = (winningTrades / totalTrades) * 100;
    const avgPnl = totalPnl / totalTrades;
    return {
      totalPnl,
      winRate,
      totalTrades,
      avgPnl,
    };
  }, [filteredTrades]);

  const handleFilterChange = (pair: 'all' | TradePair) => {
    setFilters({ pair });
  };
  
  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-headline tracking-tight">Performance Overview</h2>
            <div className="w-[180px]">
                 <Select onValueChange={handleFilterChange} defaultValue="all">
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by pair" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Pairs</SelectItem>
                        <SelectItem value="XAUUSD">XAU/USD</SelectItem>
                        <SelectItem value="GBPJPY">GBP/JPY</SelectItem>
                        <SelectItem value="EURUSD">EUR/USD</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total P/L" value={stats.totalPnl.toFixed(2)} icon={DollarSign} prefix="$" />
        <StatsCard title="Win Rate" value={stats.winRate.toFixed(2)} icon={Percent} suffix="%" />
        <StatsCard title="Total Trades" value={stats.totalTrades.toString()} icon={BarChart} />
        <StatsCard title="Avg. P/L / Trade" value={stats.avgPnl.toFixed(2)} icon={ArrowRightLeft} prefix="$" />
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Cumulative P/L</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] p-2">
            <PerformanceChart trades={filteredTrades} />
          </CardContent>
        </Card>
      </div>

      <div>
        <TradesTable trades={filteredTrades} />
      </div>
    </div>
  );
}
