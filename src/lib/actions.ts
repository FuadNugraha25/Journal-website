'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addTrade } from './data';
import type { TradePair, TradeType, TradeSession, TradeStrategy } from './types';

const tradeSchema = z.object({
  pair: z.enum(['XAUUSD', 'GBPJPY', 'EURUSD']),
  type: z.enum(['buy', 'sell']),
  profit: z.coerce.number(),
  riskRewardRatio: z.coerce.number().positive('Risk/Reward Ratio must be positive'),
  closeDate: z.coerce.date(),
  strategy: z.enum(["Scalping", "Swing Trading", "Day Trading", "Position Trading"]),
  session: z.enum(['Asian', 'London', 'New York']),
});

export type FormState = {
  message: string;
  errors?: {
    pair?: string[];
    type?: string[];
    profit?: string[];
    riskRewardRatio?: string[];
    closeDate?: string[];
    strategy?: string[];
    session?: string[];
  };
};

export async function addTradeAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = tradeSchema.safeParse({
    pair: formData.get('pair'),
    type: formData.get('type'),
    profit: formData.get('profit'),
    riskRewardRatio: formData.get('riskRewardRatio'),
    closeDate: new Date(formData.get('closeDate') as string),
    strategy: formData.get('strategy'),
    session: formData.get('session'),
  });
  
  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addTrade({
      pair: validatedFields.data.pair as TradePair,
      type: validatedFields.data.type as TradeType,
      profit: validatedFields.data.profit,
      riskRewardRatio: validatedFields.data.riskRewardRatio,
      closeDate: validatedFields.data.closeDate,
      strategy: validatedFields.data.strategy as TradeStrategy,
      session: validatedFields.data.session as TradeSession,
    });

    revalidatePath('/');
    return { message: 'Trade added successfully.' };
  } catch (e) {
    return { message: 'Failed to add trade.' };
  }
}
