import type { Trade, TradePair, TradeType, TradeSession, TradeStrategy, TradeOutcome } from './types';

// In-memory store for trades to act as a mock database.
let trades: Trade[] = [
  { id: '1', pair: 'XAUUSD', type: 'buy', profit: 525, riskRewardRatio: 2.5, closeDate: new Date('2023-10-26T10:00:00Z'), strategy: 'Scalping', session: 'London', outcome: 'tp' },
  { id: '2', pair: 'GBPJPY', type: 'sell', profit: 40, riskRewardRatio: 2, closeDate: new Date('2023-10-26T12:30:00Z'), strategy: 'Day Trading', session: 'London', outcome: 'tp' },
  { id: '3', pair: 'EURUSD', type: 'buy', profit: -20, riskRewardRatio: -1, closeDate: new Date('2023-10-27T08:45:00Z'), strategy: 'Swing Trading', session: 'New York', outcome: 'sl' },
  { id: '4', pair: 'XAUUSD', type: 'sell', profit: 800, riskRewardRatio: 4, closeDate: new Date('2023-10-27T14:00:00Z'), strategy: 'Scalping', session: 'New York', outcome: 'tp' },
  { id: '5', pair: 'GBPJPY', type: 'buy', profit: 100, riskRewardRatio: 1.5, closeDate: new Date('2023-10-28T11:00:00Z'), strategy: 'Position Trading', session: 'Asian', outcome: 'tp' },
  { id: '6', pair: 'EURUSD', type: 'buy', profit: 50, riskRewardRatio: 3, closeDate: new Date('2023-10-29T09:20:00Z'), strategy: 'Day Trading', session: 'London', outcome: 'tp' },
  { id: '7', pair: 'XAUUSD', type: 'buy', profit: -460, riskRewardRatio: -1, closeDate: new Date('2023-10-30T16:00:00Z'), strategy: 'Scalping', session: 'New York', outcome: 'sl' },
];

// Simulate fetching data from a database.
export async function getTrades(): Promise<Trade[]> {
  // sort by date descending
  return [...trades].sort((a, b) => b.closeDate.getTime() - a.closeDate.getTime());
}

// Simulate adding data to a database.
export async function addTrade(tradeData: Omit<Trade, 'id'>): Promise<Trade> {
  const newTrade: Trade = {
    ...tradeData,
    id: (trades.length + 1).toString(),
  };
  trades.push(newTrade);
  return newTrade;
}
