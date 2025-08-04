'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Trade, TradePair } from '@/lib/types';
import { StatsCard } from './stats-card';
import { PerformanceChart } from './performance-chart';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DollarSign, Percent, Banknote, Trophy, Target, TrendingUp, TrendingDown, CircleDollarSign } from 'lucide-react';
import { getInitialCapital } from '@/lib/data';

type Filter = {
  pair: 'all' | TradePair;
};

export function DashboardLayout({ initialTrades }: { initialTrades: Trade[] }) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [filters, setFilters] = useState<Filter>({ pair: 'all' });
  const [initialCapital, setInitialCapital] = useState<number | null>(null);

  useEffect(() => {
    getInitialCapital().then(setInitialCapital);
  }, []);

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (filters.pair === 'all') return true;
      return trade.pair === filters.pair;
    });
  }, [trades, filters]);

  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    if (totalTrades === 0) {
      return { netProfit: 0, grossProfit: 0, roi: 0, winRate: 0, totalTrades: 0, avgPnl: 0, bestStrategyByWinRate: { name: 'N/A', winRate: 0}, bestStrategyByAvgRR: { name: 'N/A', avgRR: 0 } };
    }
    const netProfit = filteredTrades.reduce((acc, trade) => acc + trade.profit, 0);
    const winningTradesList = filteredTrades.filter((trade) => trade.profit > 0);
    
    const grossProfit = winningTradesList.reduce((acc, trade) => acc + trade.profit, 0);
    
    const winRate = (winningTradesList.length / totalTrades) * 100;
    const avgPnl = netProfit / totalTrades;
    const roi = initialCapital && initialCapital > 0 ? (netProfit / initialCapital) * 100 : 0;


    const tradesByStrategy = filteredTrades.reduce((acc, trade) => {
        if (!acc[trade.strategy]) {
            acc[trade.strategy] = [];
        }
        acc[trade.strategy].push(trade);
        return acc;
    }, {} as Record<string, Trade[]>);

    let bestStrategyByWinRate = { name: 'N/A', winRate: 0 };
    let bestStrategyByAvgRR = { name: 'N/A', avgRR: 0 };

    let maxWinRate = -1;
    let maxAvgRR = -Infinity;

    for (const strategy in tradesByStrategy) {
        const strategyTrades = tradesByStrategy[strategy];
        const totalStrategyTrades = strategyTrades.length;
        if(totalStrategyTrades === 0) continue;
        
        const winningStrategyTrades = strategyTrades.filter(t => t.profit > 0).length;
        const strategyWinRate = (winningStrategyTrades / totalStrategyTrades) * 100;

        if (strategyWinRate > maxWinRate) {
            maxWinRate = strategyWinRate;
            bestStrategyByWinRate = { name: strategy, winRate: strategyWinRate };
        }

        const totalRR = strategyTrades.reduce((acc, t) => acc + t.riskRewardRatio, 0);
        const avgRR = totalRR / totalStrategyTrades;

        if (avgRR > maxAvgRR) {
            maxAvgRR = avgRR;
            bestStrategyByAvgRR = { name: strategy, avgRR: avgRR };
        }
    }


    return {
      netProfit,
      grossProfit,
      roi,
      winRate,
      totalTrades,
      avgPnl,
      bestStrategyByWinRate,
      bestStrategyByAvgRR,
    };
  }, [filteredTrades, initialCapital]);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Initial Capital" value={initialCapital !== null ? initialCapital.toFixed(2) : '...'} icon={Banknote} prefix="$" />
        <StatsCard title="Net Profit" value={stats.netProfit.toFixed(2)} icon={DollarSign} prefix="$" />
        <StatsCard title="Gross Profit" value={stats.grossProfit.toFixed(2)} icon={TrendingUp} prefix="$" />
        <StatsCard title="Win Rate" value={stats.winRate.toFixed(2)} icon={Percent} suffix="%" />
        <StatsCard title="ROI" value={stats.roi.toFixed(2)} icon={CircleDollarSign} suffix="%" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard title="Best Strategy (Win Rate)" value={`${stats.bestStrategyByWinRate.name} (${stats.bestStrategyByWinRate.winRate.toFixed(1)}%)`} icon={Trophy} />
        <StatsCard title="Best Strategy (Avg. R/R)" value={`${stats.bestStrategyByAvgRR.name} (${stats.bestStrategyByAvgRR.avgRR.toFixed(2)}R)`} icon={Target} />
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
    </div>
  );
}
