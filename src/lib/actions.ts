'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addTrade } from './data';
import type { TradePair, TradeType, TradeSession, TradeStrategy } from './types';

const tradeSchema = z.object({
  pair: z.enum(['XAUUSD', 'GBPJPY', 'EURUSD']),
  type: z.enum(['buy', 'sell']),
  openPrice: z.coerce.number().positive('Open price must be positive'),
  closePrice: z.coerce.number().positive('Close price must be positive'),
  closeDate: z.coerce.date(),
  strategy: z.enum(["Scalping", "Swing Trading", "Day Trading", "Position Trading"]),
  session: z.enum(['Asian', 'London', 'New York']),
});

export type FormState = {
  message: string;
  errors?: {
    pair?: string[];
    type?: string[];
    openPrice?: string[];
    closePrice?: string[];
    closeDate?: string[];
    strategy?: string[];
    session?: string[];
  };
};

export async function addTradeAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = tradeSchema.safeParse({
    pair: formData.get('pair'),
    type: formData.get('type'),
    openPrice: formData.get('openPrice'),
    closePrice: formData.get('closePrice'),
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
      openPrice: validatedFields.data.openPrice,
      closePrice: validatedFields.data.closePrice,
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
