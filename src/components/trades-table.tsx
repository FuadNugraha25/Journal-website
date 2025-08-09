'use client';

import type { Trade } from '@/lib/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Ratio, Eye, Filter, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type FilterState = {
  pair: string;
  type: string;
  outcome: string;
  session: string;
};

export function TradesTable({ trades }: { trades: Trade[] }) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    pair: 'all',
    type: 'all',
    outcome: 'all',
    session: 'all'
  });
  
  // Filter trades to only show the 3 specific pairs
  const allowedPairs = ['XAUUSD', 'GBPJPY', 'EURUSD'];
  let filteredTrades = trades.filter(trade => allowedPairs.includes(trade.pair));
  
  // Apply filters
  if (filters.pair !== 'all') {
    filteredTrades = filteredTrades.filter(trade => trade.pair === filters.pair);
  }
  if (filters.type !== 'all') {
    filteredTrades = filteredTrades.filter(trade => trade.type === filters.type);
  }
  if (filters.outcome !== 'all') {
    filteredTrades = filteredTrades.filter(trade => trade.outcome === filters.outcome);
  }
  if (filters.session !== 'all') {
    filteredTrades = filteredTrades.filter(trade => trade.session === filters.session);
  }
  
  const getOutcomeStyles = (outcome: Trade['outcome']) => {
    switch (outcome) {
      case 'tp':
      case 'cp':
        return 'text-green-400';
      case 'sl':
      case 'cl':
        return 'text-red-400';
      case 'breakeven':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  }

  const getOutcomeBadge = (outcome: Trade['outcome']) => {
     switch (outcome) {
      case 'tp':
      case 'cp':
        return 'bg-green-800/50 text-green-300 border-green-700/60 hover:bg-green-800/50 hover:text-green-300';
      case 'sl':
      case 'cl':
        return 'bg-red-800/50 text-red-300 border-red-700/60 hover:bg-red-800/50 hover:text-red-300';
      case 'breakeven':
        return 'bg-yellow-800/50 text-yellow-300 border-yellow-700/60 hover:bg-yellow-800/50 hover:text-yellow-300';
      default:
        return 'bg-secondary hover:bg-secondary';
    }
  }

  const clearFilters = () => {
    setFilters({
      pair: 'all',
      type: 'all',
      outcome: 'all',
      session: 'all'
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== 'all');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline">Trade History</CardTitle>
            <CardDescription>A log of your recent trading activity.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters</span>
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Select value={filters.pair} onValueChange={(value) => setFilters(prev => ({ ...prev, pair: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Pair" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pairs</SelectItem>
              <SelectItem value="XAUUSD">XAU/USD</SelectItem>
              <SelectItem value="GBPJPY">GBP/JPY</SelectItem>
              <SelectItem value="EURUSD">EUR/USD</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.outcome} onValueChange={(value) => setFilters(prev => ({ ...prev, outcome: value }))}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="tp">Take Profit</SelectItem>
              <SelectItem value="sl">Stop Loss</SelectItem>
              <SelectItem value="cp">Close Profit</SelectItem>
              <SelectItem value="cl">Close Loss</SelectItem>
              <SelectItem value="breakeven">Breakeven</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.session} onValueChange={(value) => setFilters(prev => ({ ...prev, session: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Session" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="Asian">Asian</SelectItem>
              <SelectItem value="London">London</SelectItem>
              <SelectItem value="New York">New York</SelectItem>
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-1">
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
        
        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Showing {filteredTrades.length} of {trades.filter(trade => allowedPairs.includes(trade.pair)).length} trades</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Pair</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>R/R</TableHead>

                <TableHead className="text-right">P/L</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredTrades.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                            No trades found.
                        </TableCell>
                    </TableRow>
                )}
                {filteredTrades.map((trade) => (
                <TableRow 
                  key={trade.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedTrade(trade)}
                >
                    <TableCell className="font-medium">{trade.pair}</TableCell>
                    <TableCell>
                    <Badge variant={trade.type === 'buy' ? 'secondary' : 'default'} className={cn(trade.type === 'buy' ? "bg-green-800/50 text-green-300 border-green-700/60 hover:bg-green-800/50 hover:text-green-300" : "bg-red-800/50 text-red-300 border-red-700/60 hover:bg-red-800/50 hover:text-red-300")}>
                        {trade.type === 'buy' ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                        {trade.type}
                    </Badge>
                    </TableCell>
                    <TableCell>{trade.strategy}</TableCell>
                    <TableCell>{trade.session}</TableCell>
                    <TableCell>
                        <Badge className={cn(getOutcomeBadge(trade.outcome), "uppercase")}>
                            {trade.outcome === 'breakeven' ? 'BE' : trade.outcome}
                        </Badge>
                    </TableCell>
                    <TableCell>{format(trade.closeDate, 'PP')}</TableCell>
                    <TableCell className="font-mono text-xs flex items-center gap-1">
                      <Ratio className="h-3 w-3 text-muted-foreground" />
                      {trade.riskRewardRatio.toFixed(2)}R
                    </TableCell>

                    <TableCell
                    className={cn(
                        'text-right font-semibold',
                        getOutcomeStyles(trade.outcome)
                    )}
                    >
                    {trade.profit >= 0 ? '+' : ''}
                    ${trade.profit.toFixed(2)}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
      
      {/* Trade Details Dialog */}
      <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTrade && (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Trade Details - {selectedTrade.pair}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-6">
                {/* Trade Image */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Trade Screenshot</h3>
                  <div className="border rounded-lg overflow-hidden bg-muted/20">
                    {selectedTrade.image ? (
                      <Image 
                        src={selectedTrade.image} 
                        alt={`Trade ${selectedTrade.id}`} 
                        width={800} 
                        height={400} 
                        className="w-full h-auto object-contain" 
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/60">
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 mx-auto bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                            <Eye className="h-8 w-8 text-muted-foreground/60" />
                          </div>
                          <p className="text-sm text-muted-foreground">Trade Screenshot</p>
                          <p className="text-xs text-muted-foreground/60">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Trade Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Basic Info</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Pair:</span>
                          <span className="font-medium">{selectedTrade.pair}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Type:</span>
                          <Badge variant={selectedTrade.type === 'buy' ? 'secondary' : 'default'} className={cn(selectedTrade.type === 'buy' ? "bg-green-800/50 text-green-300 border-green-700/60" : "bg-red-800/50 text-red-300 border-red-700/60")}>
                            {selectedTrade.type === 'buy' ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                            {selectedTrade.type}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Strategy:</span>
                          <span className="font-medium">{selectedTrade.strategy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Session:</span>
                          <span className="font-medium">{selectedTrade.session}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Risk Management</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Lot Size:</span>
                          <span className="font-medium font-mono">{selectedTrade.lotSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Risk Size:</span>
                          <span className="font-medium font-mono">${selectedTrade.riskSize}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Results</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Outcome:</span>
                          <Badge className={cn(getOutcomeBadge(selectedTrade.outcome), "uppercase")}>
                            {selectedTrade.outcome === 'breakeven' ? 'BE' : selectedTrade.outcome}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">P/L:</span>
                          <span className={cn(
                            'font-semibold font-mono',
                            getOutcomeStyles(selectedTrade.outcome)
                          )}>
                            {selectedTrade.profit >= 0 ? '+' : ''}${selectedTrade.profit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">R/R Ratio:</span>
                          <span className="font-medium font-mono flex items-center gap-1">
                            <Ratio className="h-3 w-3 text-muted-foreground" />
                            {selectedTrade.riskRewardRatio.toFixed(2)}R
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Close Date:</span>
                          <span className="font-medium">{format(selectedTrade.closeDate, 'PPP')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
