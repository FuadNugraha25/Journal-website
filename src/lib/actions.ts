'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addTrade, getStrategies, updateInitialCapital, updateStrategies } from './data';
import type { TradePair, TradeType, TradeSession, TradeStrategy, TradeOutcome } from './types';

const tradeSchema = z.object({
  pair: z.enum(['XAUUSD', 'GBPJPY', 'EURUSD']),
  type: z.enum(['buy', 'sell']),
  profit: z.coerce.number(),
  outcome: z.enum(['tp', 'sl', 'breakeven', 'cp', 'cl']),
  riskRewardRatio: z.coerce.number(),
  closeDate: z.coerce.date(),
  strategy: z.string(),
  session: z.enum(['Asian', 'London', 'New York']),
  image: z.string().optional(),
  lotSize: z.coerce.number().min(0.01, { message: 'Lot size is required and must be greater than 0.' }),
  riskSize: z.coerce.number().min(0.01, { message: 'Risk size is required and must be greater than 0.' }),
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
    image?: string[];
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
    image: formData.get('image'),
    lotSize: formData.get('lotSize'),
    riskSize: formData.get('riskSize'),
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
      image: validatedFields.data.image,
      lotSize: validatedFields.data.lotSize,
      riskSize: validatedFields.data.riskSize,
    });

    revalidatePath('/');
    revalidatePath('/settings/strategies');
    return { message: 'Trade added successfully.' };
  } catch (e) {
    return { message: 'Failed to add trade.' };
  }
}

export async function updateStrategiesAction(strategies: string[]): Promise<{ message: string }> {
  try {
    const validatedStrategies = z.array(z.string().min(1)).safeParse(strategies);
    if (!validatedStrategies.success) {
      return { message: 'Invalid strategy list.' };
    }
    await updateStrategies(validatedStrategies.data);
    revalidatePath('/settings/strategies');
    revalidatePath('/');
    return { message: 'Strategies updated successfully.' };
  } catch (e) {
    return { message: 'Failed to update strategies.' };
  }
}

export async function updateInitialCapitalAction(capital: number): Promise<{ message: string }> {
    try {
        const validatedCapital = z.number().min(0).safeParse(capital);
        if(!validatedCapital.success) {
            return { message: "Invalid capital amount" };
        }
        await updateInitialCapital(validatedCapital.data);
        revalidatePath('/');
        revalidatePath('/settings/strategies');
        return { message: 'Initial capital updated successfully.' };
    } catch (e) {
        return { message: 'Failed to update initial capital.' };
    }
}
