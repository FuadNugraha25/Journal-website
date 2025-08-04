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
import { TrendingUp, TrendingDown, Ratio, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import Image from 'next/image';

export function TradesTable({ trades }: { trades: Trade[] }) {
  
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
        return 'bg-green-800/50 text-green-300 border-green-700/60';
      case 'sl':
      case 'cl':
        return 'bg-red-800/50 text-red-300 border-red-700/60';
      case 'breakeven':
        return 'bg-yellow-800/50 text-yellow-300 border-yellow-700/60';
      default:
        return 'bg-secondary';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Trade History</CardTitle>
        <CardDescription>A log of your recent trading activity.</CardDescription>
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
                <TableHead>Image</TableHead>
                <TableHead className="text-right">P/L</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {trades.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                            No trades found.
                        </TableCell>
                    </TableRow>
                )}
                {trades.map((trade) => (
                <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.pair}</TableCell>
                    <TableCell>
                    <Badge variant={trade.type === 'buy' ? 'secondary' : 'default'} className={cn(trade.type === 'buy' ? "bg-green-800/50 text-green-300 border-green-700/60" : "bg-red-800/50 text-red-300 border-red-700/60", "hover:bg-card")}>
                        {trade.type === 'buy' ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                        {trade.type}
                    </Badge>
                    </TableCell>
                    <TableCell>{trade.strategy}</TableCell>
                    <TableCell>{trade.session}</TableCell>
                    <TableCell>
                        <Badge className={cn(getOutcomeBadge(trade.outcome), "uppercase")}>
                            {trade.outcome}
                        </Badge>
                    </TableCell>
                    <TableCell>{format(trade.closeDate, 'PP')}</TableCell>
                    <TableCell className="font-mono text-xs flex items-center gap-1">
                      <Ratio className="h-3 w-3 text-muted-foreground" />
                      {trade.riskRewardRatio.toFixed(2)}R
                    </TableCell>
                    <TableCell>
                      {trade.image && (
                        <Dialog>
                          <DialogTrigger asChild>
                             <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                                <ImageIcon className="h-4 w-4" />
                                View
                              </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                              <Image src={trade.image} alt={`Trade ${trade.id}`} width={1200} height={800} className="rounded-md" />
                          </DialogContent>
                        </Dialog>
                      )}
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
    </Card>
  );
}
