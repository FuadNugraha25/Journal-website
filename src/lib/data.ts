import type { Trade, TradePair, TradeType, TradeSession, TradeStrategy, TradeOutcome } from './types';

let strategies: TradeStrategy[] = ["Scalping", "Swing Trading", "Day Trading", "Position Trading"];
let initialCapital = 10000;

// In-memory store for trades to act as a mock database.
let trades: Trade[] = [
  { id: '1', pair: 'XAUUSD', type: 'buy', profit: 525, riskRewardRatio: 2.5, closeDate: new Date('2025-08-01T10:00:00Z'), strategy: 'Scalping', session: 'London', outcome: 'tp' },
  { id: '2', pair: 'GBPJPY', type: 'sell', profit: -40, riskRewardRatio: -1, closeDate: new Date('2025-08-01T12:30:00Z'), strategy: 'Day Trading', session: 'London', outcome: 'sl' },
  { id: '3', pair: 'EURUSD', type: 'buy', profit: 150, riskRewardRatio: 1.5, closeDate: new Date('2025-08-02T08:45:00Z'), strategy: 'Swing Trading', session: 'New York', outcome: 'cp' },
  { id: '4', pair: 'XAUUSD', type: 'sell', profit: -100, riskRewardRatio: -0.5, closeDate: new Date('2025-08-02T14:00:00Z'), strategy: 'Scalping', session: 'New York', outcome: 'cl' },
  { id: '5', pair: 'GBPJPY', type: 'buy', profit: 0, riskRewardRatio: 0, closeDate: new Date('2025-08-03T11:00:00Z'), strategy: 'Position Trading', session: 'Asian', outcome: 'breakeven' },
  { id: '6', pair: 'EURUSD', type: 'buy', profit: 50, riskRewardRatio: 3, closeDate: new Date('2025-08-03T09:20:00Z'), strategy: 'Day Trading', session: 'London', outcome: 'tp' },
  { id: '7', pair: 'XAUUSD', type: 'buy', profit: -460, riskRewardRatio: -1, closeDate: new Date('2025-08-04T16:00:00Z'), strategy: 'Scalping', session: 'New York', outcome: 'sl' },
  { id: '8', pair: 'GBPJPY', type: 'sell', profit: 320, riskRewardRatio: 2.1, closeDate: new Date('2025-08-05T13:15:00Z'), strategy: 'Day Trading', session: 'London', outcome: 'tp' },
  { id: '9', pair: 'EURUSD', type: 'buy', profit: -75, riskRewardRatio: -0.8, closeDate: new Date('2025-08-06T10:45:00Z'), strategy: 'Swing Trading', session: 'New York', outcome: 'sl' },
  { id: '10', pair: 'XAUUSD', type: 'buy', profit: 180, riskRewardRatio: 1.8, closeDate: new Date('2025-08-07T08:30:00Z'), strategy: 'Scalping', session: 'Asian', outcome: 'tp' },
  { id: '11', pair: 'GBPJPY', type: 'sell', profit: -120, riskRewardRatio: -1.2, closeDate: new Date('2025-08-08T15:20:00Z'), strategy: 'Position Trading', session: 'London', outcome: 'sl' },
  { id: '12', pair: 'EURUSD', type: 'buy', profit: 95, riskRewardRatio: 1.9, closeDate: new Date('2025-08-09T11:10:00Z'), strategy: 'Day Trading', session: 'New York', outcome: 'tp' },
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

export async function getStrategies(): Promise<TradeStrategy[]> {
  return [...new Set(strategies)];
}

export async function updateStrategies(newStrategies: TradeStrategy[]): Promise<void> {
  strategies = [...new Set(newStrategies)];
}

export async function addStrategy(strategy: TradeStrategy): Promise<void> {
  strategies.push(strategy);
}

export async function getInitialCapital(): Promise<number> {
    return initialCapital;
}

export async function updateInitialCapital(newCapital: number): Promise<void> {
    initialCapital = newCapital;
}
