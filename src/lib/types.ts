export type TradePair = "XAUUSD" | "GBPJPY" | "EURUSD";
export type TradeType = "buy" | "sell";

export interface Trade {
  id: string;
  pair: TradePair;
  type: TradeType;
  openPrice: number;
  closePrice: number;
  closeDate: Date;
  profit: number;
}
