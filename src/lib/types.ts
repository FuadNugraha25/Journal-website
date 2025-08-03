export type TradePair = "XAUUSD" | "GBPJPY" | "EURUSD";
export type TradeType = "buy" | "sell";
export type TradeSession = "Asian" | "London" | "New York";
export type TradeStrategy = "Scalping" | "Swing Trading" | "Day Trading" | "Position Trading";

export interface Trade {
  id: string;
  pair: TradePair;
  type: TradeType;
  profit: number;
  riskRewardRatio: number;
  closeDate: Date;
  strategy: TradeStrategy;
  session: TradeSession;
}
