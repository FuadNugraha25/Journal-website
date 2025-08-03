import type { Trade, TradePair, TradeType } from './types';

// In-memory store for trades to act as a mock database.
let trades: Trade[] = [
  { id: '1', pair: 'XAUUSD', type: 'buy', openPrice: 1900.50, closePrice: 1905.75, closeDate: new Date('2023-10-26T10:00:00Z'), profit: 5.25 },
  { id: '2', pair: 'GBPJPY', type: 'sell', openPrice: 182.30, closePrice: 181.90, closeDate: new Date('2023-10-26T12:30:00Z'), profit: 40 },
  { id: '3', pair: 'EURUSD', type: 'buy', openPrice: 1.0560, closePrice: 1.0540, closeDate: new Date('2023-10-27T08:45:00Z'), profit: -20 },
  { id: '4', pair: 'XAUUSD', type: 'sell', openPrice: 1910.00, closePrice: 1902.00, closeDate: new Date('2023-10-27T14:00:00Z'), profit: 8.00 },
  { id: '5', pair: 'GBPJPY', type: 'buy', openPrice: 182.50, closePrice: 183.50, closeDate: new Date('2023-10-28T11:00:00Z'), profit: 100 },
  { id: '6', pair: 'EURUSD', type: 'buy', openPrice: 1.0600, closePrice: 1.0650, closeDate: new Date('2023-10-29T09:20:00Z'), profit: 50 },
  { id: '7', pair: 'XAUUSD', type: 'buy', openPrice: 1920.10, closePrice: 1915.50, closeDate: new Date('2023-10-30T16:00:00Z'), profit: -4.60 },
];

// Simulate fetching data from a database.
export async function getTrades(): Promise<Trade[]> {
  // sort by date descending
  return [...trades].sort((a, b) => b.closeDate.getTime() - a.closeDate.getTime());
}

// Simulate adding data to a database.
export async function addTrade(tradeData: Omit<Trade, 'id' | 'profit'>): Promise<Trade> {
  const profit = calculateProfit(tradeData.type, tradeData.openPrice, tradeData.closePrice, tradeData.pair);

  const newTrade: Trade = {
    ...tradeData,
    id: (trades.length + 1).toString(),
    profit,
  };
  trades.push(newTrade);
  return newTrade;
}

// Simplified profit calculation. For real-world apps, this would be more complex.
// For simplicity here, we assume profit is pip/point difference.
function calculateProfit(type: TradeType, open: number, close: number, pair: TradePair) {
    const multiplier = pair === 'GBPJPY' ? 100 : (pair === 'EURUSD' ? 10000 : 100);
    if (type === 'buy') {
        return (close - open) * multiplier;
    } else {
        return (open - close) * multiplier;
    }
}
