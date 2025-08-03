'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addTrade, getStrategies } from './data';
import type { TradePair, TradeType, TradeSession, TradeStrategy, TradeOutcome } from './types';

const tradeSchema = z.object({
  pair: z.enum(['XAUUSD', 'GBPJPY', 'EURUSD']),
  type: z.enum(['buy', 'sell']),
  profit: z.coerce.number(),
  outcome: z.enum(['tp', 'sl', 'breakeven']),
  riskRewardRatio: z.coerce.number(),
  closeDate: z.coerce.date(),
  strategy: z.string(),
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
    outcome?: string[];
  };
};

export async function addTradeAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const strategies = await getStrategies();
  const dynamicTradeSchema = tradeSchema.extend({
    strategy: z.enum(strategies as [string, ...string[]]),
  })

  const validatedFields = dynamicTradeSchema.safeParse({
    pair: formData.get('pair'),
    type: formData.get('type'),
    profit: formData.get('profit'),
    riskRewardRatio: formData.get('riskRewardRatio'),
    closeDate: new Date(formData.get('closeDate') as string),
    strategy: formData.get('strategy'),
    session: formData.get('session'),
    outcome: formData.get('outcome'),
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
      outcome: validatedFields.data.outcome as TradeOutcome,
    });

    revalidatePath('/');
    revalidatePath('/settings/strategies');
    return { message: 'Trade added successfully.' };
  } catch (e) {
    return { message: 'Failed to add trade.' };
  }
}
