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
import { TrendingUp, TrendingDown, Ratio } from 'lucide-react';

export function TradesTable({ trades }: { trades: Trade[] }) {
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
                <TableHead>Close Date</TableHead>
                <TableHead>R/R</TableHead>
                <TableHead className="text-right">P/L</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {trades.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
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
                    <TableCell>{format(trade.closeDate, 'PP')}</TableCell>
                    <TableCell className="font-mono text-xs flex items-center gap-1">
                      <Ratio className="h-3 w-3 text-muted-foreground" />
                      {trade.riskRewardRatio.toFixed(2)}R
                    </TableCell>
                    <TableCell
                    className={cn(
                        'text-right font-semibold',
                        trade.profit >= 0 ? 'text-green-400' : 'text-destructive'
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
