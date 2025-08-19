'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Trade, TradePair } from '@/lib/types';
import { StatsCard } from './stats-card';
import { PerformanceChart } from './performance-chart';
import { PairDistributionChart } from './pair-distribution-chart';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DollarSign, Percent, Banknote, Trophy, Target, TrendingUp, TrendingDown, CircleDollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { getInitialCapital } from '@/lib/data';
import { TradeCalendar } from './trade-calendar';
import { MonthlyWinLossChart } from './monthly-win-loss-chart';

type Filter = {
  pair: 'all' | TradePair;
};

export function DashboardLayout({ initialTrades }: { initialTrades: Trade[] }) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [filters, setFilters] = useState<Filter>({ pair: 'all' });
  const [initialCapital, setInitialCapital] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh capital when the component mounts or when refreshKey changes
  useEffect(() => {
    const fetchCapital = async () => {
      const capital = await getInitialCapital();
      setInitialCapital(capital);
    };
    fetchCapital();
  }, [refreshKey]);

  // Listen for custom event to refresh capital
  useEffect(() => {
    const handleCapitalUpdated = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('capitalUpdated', handleCapitalUpdated);
    return () => {
      window.removeEventListener('capitalUpdated', handleCapitalUpdated);
    };
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
      return { netProfit: 0, grossProfit: 0, roi: 0, winRate: 0, totalTrades: 0, avgPnl: 0, bestStrategyByWinRate: { name: 'N/A', winRate: 0}, bestStrategyByAvgRR: { name: 'N/A', avgRR: 0 }, averageProfit: 0, averageLoss: 0, biggestProfit: 0, biggestLoss: 0 };
    }
    const netProfit = filteredTrades.reduce((acc, trade) => acc + trade.profit, 0);
    const winningTradesList = filteredTrades.filter((trade) => trade.profit > 0);
    const losingTradesList = filteredTrades.filter((trade) => trade.profit < 0);
    
    const grossProfit = winningTradesList.reduce((acc, trade) => acc + trade.profit, 0);
    const grossLoss = losingTradesList.reduce((acc, trade) => acc + trade.profit, 0);

    const averageProfit = winningTradesList.length > 0 ? grossProfit / winningTradesList.length : 0;
    const averageLoss = losingTradesList.length > 0 ? grossLoss / losingTradesList.length : 0;

    const biggestProfit = Math.max(0, ...filteredTrades.map(t => t.profit));
    const biggestLoss = Math.min(0, ...filteredTrades.map(t => t.profit));
    
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
      averageProfit,
      averageLoss,
      biggestProfit,
      biggestLoss
    };
  }, [filteredTrades, initialCapital]);

  const handleFilterChange = (pair: 'all' | TradePair) => {
    setFilters({ pair });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 flex flex-col gap-4">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <StatsCard title="Initial Capital" value={initialCapital !== null ? initialCapital.toFixed(2) : '...'} icon={Banknote} prefix="$" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <StatsCard title="Net Profit" value={stats.netProfit.toFixed(2)} icon={DollarSign} prefix="$" />
        <StatsCard title="Gross Profit" value={stats.grossProfit.toFixed(2)} icon={TrendingUp} prefix="$" />
        <StatsCard title="Win Rate" value={Math.round(stats.winRate).toString()} icon={Percent} suffix="%" />
        <StatsCard title="ROI" value={stats.roi.toFixed(2)} icon={CircleDollarSign} suffix="%" />
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <StatsCard title="Avg. Profit" value={stats.averageProfit.toFixed(2)} icon={ArrowUpCircle} prefix="$" />
        <StatsCard title="Avg. Loss" value={stats.averageLoss.toFixed(2)} icon={ArrowDownCircle} prefix="$" />
        <StatsCard title="Biggest Profit" value={stats.biggestProfit.toFixed(2)} icon={TrendingUp} prefix="$" />
        <StatsCard title="Biggest Loss" value={stats.biggestLoss.toFixed(2)} icon={TrendingDown} prefix="$" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard title="Best Strategy (Win Rate)" value={`${stats.bestStrategyByWinRate.name} (${Math.round(stats.bestStrategyByWinRate.winRate)}%)`} icon={Trophy} />
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

      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Trade Distribution by Pair</CardTitle>
            <CardDescription>
              Number of trades taken for each currency pair
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-2">
            <PairDistributionChart trades={filteredTrades} />
          </CardContent>
        </Card>
      </div>
      </div>
       <div className="lg:col-span-2">
         <Card>
           <CardHeader>
             <CardTitle className="font-headline">Trading Calendar</CardTitle>
             <CardDescription>
               An overview of your trading activity by day.
             </CardDescription>
           </CardHeader>
           <CardContent className="p-2">
             <TradeCalendar trades={initialTrades} />
           </CardContent>
         </Card>
          {/* Monthly Win/Loss Chart Section */}
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Monthly Win/Loss</CardTitle>
                <CardDescription>Wins go upward, losses go downward (Jan–Dec)</CardDescription>
              </CardHeader>
              <CardContent className="h-[260px] p-2">
                <MonthlyWinLossChart trades={initialTrades} />
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}
