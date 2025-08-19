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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import styles from './trades-table.module.css';
import { supabase } from '@/lib/supabase';

type FilterState = {
  pair: string;
  type: string;
  outcome: string;
  session: string;
};

export function TradesTable({ trades }: { trades: Trade[] }) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState<Partial<Trade>>({});
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
              <SelectItem value="cp">Cut Profit</SelectItem>
              <SelectItem value="cl">Cut Loss</SelectItem>
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
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
          {selectedTrade && (
            <>
              <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="font-headline flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Trade Details - {selectedTrade.pair}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    {editing ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditing(false);
                            setEditValues({});
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!selectedTrade) return;
                            const id = selectedTrade.id;
                            // Build update payload mapping to Supabase columns
                            const payload: any = {
                              pair: editValues.pair ?? selectedTrade.pair,
                              type: editValues.type ?? selectedTrade.type,
                              profit: editValues.profit ?? selectedTrade.profit,
                              outcome: editValues.outcome ?? selectedTrade.outcome,
                              risk_reward_ratio: editValues.riskRewardRatio ?? selectedTrade.riskRewardRatio,
                              close_date: (editValues.closeDate ?? selectedTrade.closeDate).toISOString(),
                              strategy: editValues.strategy ?? selectedTrade.strategy,
                              session: editValues.session ?? selectedTrade.session,
                              image: editValues.image ?? selectedTrade.image,
                              lot_size: editValues.lotSize ?? selectedTrade.lotSize,
                              risk_size: editValues.riskSize ?? selectedTrade.riskSize,
                            };
                            const { error } = await supabase.from('trades').update(payload).eq('id', id);
                            if (!error) {
                              // Update local selectedTrade state
                              const updated: Trade = {
                                id,
                                pair: payload.pair,
                                type: payload.type,
                                profit: payload.profit,
                                outcome: payload.outcome,
                                riskRewardRatio: payload.risk_reward_ratio,
                                closeDate: new Date(payload.close_date),
                                strategy: payload.strategy,
                                session: payload.session,
                                image: payload.image,
                                lotSize: payload.lot_size,
                                riskSize: payload.risk_size,
                              };
                              setSelectedTrade(updated);
                              setEditing(false);
                            } else {
                              console.error('Failed to update trade', error);
                              alert('Failed to update trade');
                            }
                          }}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!selectedTrade) return;
                            setEditValues({ ...selectedTrade });
                            setEditing(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" disabled title="Delete coming soon">
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DialogHeader>
              
              <div 
                className={`flex-1 overflow-y-scroll px-6 pb-6 ${styles.scrollableContent}`}
              >
                <div className="grid gap-6 pb-4">
                {/* Trade Image */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Trade Screenshot</h3>
                  <div className="border rounded-lg overflow-hidden bg-muted/20">
                    {selectedTrade.image ? (
                      <button
                        type="button"
                        onClick={() => setImagePreviewUrl(selectedTrade.image as string)}
                        className="w-full group cursor-pointer"
                        aria-label="Open full-size screenshot"
                      >
                        <Image 
                          src={selectedTrade.image} 
                          alt={`Trade ${selectedTrade.id}`} 
                          width={800} 
                          height={400} 
                          className="w-full h-auto object-contain transition-transform group-hover:scale-[1.01]"
                        />
                      </button>
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
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Type:</span>
                          {editing ? (
                            <select
                              className="min-w-[140px] bg-background border rounded px-2 py-1 text-sm"
                              value={(editValues.type ?? selectedTrade.type) as string}
                              onChange={(e) => setEditValues(v => ({ ...v, type: e.target.value as any }))}
                            >
                              <option value="buy">buy</option>
                              <option value="sell">sell</option>
                            </select>
                          ) : (
                            <Badge variant={selectedTrade.type === 'buy' ? 'secondary' : 'default'} className={cn(selectedTrade.type === 'buy' ? "bg-green-800/50 text-green-300 border-green-700/60" : "bg-red-800/50 text-red-300 border-red-700/60")}>
                              {selectedTrade.type === 'buy' ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                              {selectedTrade.type}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Strategy:</span>
                          {editing ? (
                            <input
                              type="text"
                              className="min-w-[140px] w-[200px] bg-background border rounded px-2 py-1 text-sm"
                              value={(editValues.strategy ?? selectedTrade.strategy) as string}
                              onChange={(e) => setEditValues(v => ({ ...v, strategy: e.target.value as any }))}
                            />
                          ) : (
                            <span className="font-medium">{selectedTrade.strategy}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Session:</span>
                          {editing ? (
                            <input
                              type="text"
                              className="min-w-[140px] w-[200px] bg-background border rounded px-2 py-1 text-sm"
                              value={(editValues.session ?? selectedTrade.session) as string}
                              onChange={(e) => setEditValues(v => ({ ...v, session: e.target.value as any }))}
                            />
                          ) : (
                            <span className="font-medium">{selectedTrade.session}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Risk Management</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Lot Size:</span>
                          {editing ? (
                            <input
                              type="number"
                              step="0.01"
                              className="min-w-[140px] bg-background border rounded px-2 py-1 text-sm text-right font-mono"
                              value={String(editValues.lotSize ?? selectedTrade.lotSize)}
                              onChange={(e) => setEditValues(v => ({ ...v, lotSize: parseFloat(e.target.value) }))}
                            />
                          ) : (
                            <span className="font-medium font-mono">{selectedTrade.lotSize}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Risk Size:</span>
                          {editing ? (
                            <input
                              type="number"
                              step="0.01"
                              className="min-w-[140px] bg-background border rounded px-2 py-1 text-sm text-right font-mono"
                              value={String(editValues.riskSize ?? selectedTrade.riskSize)}
                              onChange={(e) => setEditValues(v => ({ ...v, riskSize: parseFloat(e.target.value) }))}
                            />
                          ) : (
                            <span className="font-medium font-mono">${selectedTrade.riskSize}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">Results</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Outcome:</span>
                          {editing ? (
                            <select
                              className="min-w-[140px] bg-background border rounded px-2 py-1 text-sm"
                              value={(editValues.outcome ?? selectedTrade.outcome) as string}
                              onChange={(e) => setEditValues(v => ({ ...v, outcome: e.target.value as any }))}
                            >
                              <option value="tp">tp</option>
                              <option value="sl">sl</option>
                              <option value="breakeven">breakeven</option>
                              <option value="cp">cp</option>
                              <option value="cl">cl</option>
                            </select>
                          ) : (
                            <Badge className={cn(getOutcomeBadge(selectedTrade.outcome), "uppercase")}>
                              {selectedTrade.outcome === 'breakeven' ? 'BE' : selectedTrade.outcome}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">P/L:</span>
                          {editing ? (
                            <input
                              type="number"
                              step="0.01"
                              className="min-w-[140px] bg-background border rounded px-2 py-1 text-sm text-right font-mono"
                              value={String(editValues.profit ?? selectedTrade.profit)}
                              onChange={(e) => setEditValues(v => ({ ...v, profit: parseFloat(e.target.value) }))}
                            />
                          ) : (
                            <span className={cn(
                              'font-semibold font-mono',
                              getOutcomeStyles(selectedTrade.outcome)
                            )}>
                              {selectedTrade.profit >= 0 ? '+' : ''}${selectedTrade.profit.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">R/R Ratio:</span>
                          {editing ? (
                            <div className="flex items-center gap-1">
                              <Ratio className="h-3 w-3 text-muted-foreground" />
                              <input
                                type="number"
                                step="0.01"
                                className="min-w-[100px] bg-background border rounded px-2 py-1 text-sm text-right font-mono"
                                value={String(editValues.riskRewardRatio ?? selectedTrade.riskRewardRatio)}
                                onChange={(e) => setEditValues(v => ({ ...v, riskRewardRatio: parseFloat(e.target.value) }))}
                              />
                            </div>
                          ) : (
                            <span className="font-medium font-mono flex items-center gap-1">
                              <Ratio className="h-3 w-3 text-muted-foreground" />
                              {selectedTrade.riskRewardRatio.toFixed(2)}R
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">Close Date:</span>
                          {editing ? (
                            <input
                              type="date"
                              className="min-w-[160px] bg-background border rounded px-2 py-1 text-sm"
                              value={format(editValues.closeDate ?? selectedTrade.closeDate, 'yyyy-MM-dd')}
                              onChange={(e) => {
                                const date = new Date(e.target.value + 'T00:00:00');
                                setEditValues(v => ({ ...v, closeDate: date }));
                              }}
                            />
                          ) : (
                            <span className="font-medium">{format(selectedTrade.closeDate, 'PPP')}</span>
                          )}
                        </div>
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

      {/* Image Fullscreen Preview Dialog */}
      <Dialog open={!!imagePreviewUrl} onOpenChange={(open) => !open && setImagePreviewUrl(null)}>
        <DialogContent className="w-[95vw] max-w-[1200px] max-h-[95vh] p-0 bg-black">
          <div className="relative w-full h-[85vh]">
            {imagePreviewUrl && (
              <Image
                src={imagePreviewUrl}
                alt="Trade Screenshot Preview"
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 95vw, 1200px"
                priority
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
