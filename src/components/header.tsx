import { Flame } from 'lucide-react';
import { NewTradeDialog } from './new-trade-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[3px]">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold font-headline text-primary">TradeFlow</h1>
        </div>
        <NewTradeDialog />
      </div>
    </header>
  );
}
