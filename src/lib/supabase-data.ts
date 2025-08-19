import { supabase } from './supabase';
import type { Trade, TradePair, TradeType, TradeSession, TradeStrategy, TradeOutcome } from './types';

// Supabase-integrated data functions

export async function getTrades(): Promise<Trade[]> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('close_date', { ascending: false });

  if (error) {
    console.error('Error fetching trades:', error);
    throw new Error('Failed to fetch trades');
  }

  // Transform Supabase data to match your Trade interface
  return data.map(trade => ({
    id: trade.id,
    pair: trade.pair as TradePair,
    type: trade.type as TradeType,
    profit: trade.profit,
    outcome: trade.outcome as TradeOutcome,
    riskRewardRatio: trade.risk_reward_ratio,
    closeDate: new Date(trade.close_date),
    strategy: trade.strategy as TradeStrategy,
    session: trade.session as TradeSession,
    image: trade.image,
    lotSize: trade.lot_size,
    riskSize: trade.risk_size,
  }));
}

export async function addTrade(tradeData: Omit<Trade, 'id'>): Promise<Trade> {
  // Transform data to match Supabase schema (snake_case)
  const supabaseTradeData = {
    pair: tradeData.pair,
    type: tradeData.type,
    profit: tradeData.profit,
    outcome: tradeData.outcome,
    risk_reward_ratio: tradeData.riskRewardRatio,
    close_date: tradeData.closeDate.toISOString(),
    strategy: tradeData.strategy,
    session: tradeData.session,
    image: tradeData.image,
    lot_size: tradeData.lotSize,
    risk_size: tradeData.riskSize,
  };

  const { data, error } = await supabase
    .from('trades')
    .insert([supabaseTradeData])
    .select()
    .single();

  if (error) {
    console.error('Error adding trade:', error);
    throw new Error('Failed to add trade');
  }

  // Transform back to your Trade interface
  return {
    id: data.id,
    pair: data.pair as TradePair,
    type: data.type as TradeType,
    profit: data.profit,
    outcome: data.outcome as TradeOutcome,
    riskRewardRatio: data.risk_reward_ratio,
    closeDate: new Date(data.close_date),
    strategy: data.strategy as TradeStrategy,
    session: data.session as TradeSession,
    image: data.image,
    lotSize: data.lot_size,
    riskSize: data.risk_size,
  };
}

export async function getStrategies(): Promise<TradeStrategy[]> {
  const { data, error } = await supabase
    .from('strategies')
    .select('name')
    .order('name');

  if (error) {
    console.error('Error fetching strategies:', error);
    // Return default strategies if database fails
    return ["Scalping", "Swing Trading", "Day Trading", "Position Trading"];
  }

  return data.map(strategy => strategy.name as TradeStrategy);
}

export async function updateStrategies(newStrategies: TradeStrategy[]): Promise<void> {
  // First, clear existing strategies
  const { error: deleteError } = await supabase
    .from('strategies')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.error('Error clearing strategies:', deleteError);
    throw new Error('Failed to update strategies');
  }

  // Then insert new strategies
  const strategiesData = newStrategies.map(name => ({ name }));
  const { error: insertError } = await supabase
    .from('strategies')
    .insert(strategiesData);

  if (insertError) {
    console.error('Error inserting strategies:', insertError);
    throw new Error('Failed to update strategies');
  }
}

export async function addStrategy(strategy: TradeStrategy): Promise<void> {
  const { error } = await supabase
    .from('strategies')
    .insert([{ name: strategy }]);

  if (error) {
    console.error('Error adding strategy:', error);
    throw new Error('Failed to add strategy');
  }
}

export async function getInitialCapital(): Promise<number> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'initial_capital')
    .single();

  if (error) {
    console.error('Error fetching initial capital:', error);
    // Return default value if not found
    return 10000;
  }

  return parseFloat(data.value);
}

export async function updateInitialCapital(newCapital: number): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert(
      [
        {
          key: 'initial_capital',
          value: newCapital.toString(),
        },
      ],
      { onConflict: 'key' }
    );

  if (error) {
    console.error('Error updating initial capital:', error);
    throw new Error('Failed to update initial capital');
  }
}

// Helper function to initialize default data (run this once to populate your database)
export async function initializeDefaultData(): Promise<void> {
  // Check if strategies exist
  const { data: existingStrategies } = await supabase
    .from('strategies')
    .select('name')
    .limit(1);

  if (!existingStrategies || existingStrategies.length === 0) {
    // Insert default strategies
    const defaultStrategies: TradeStrategy[] = ["Scalping", "Swing Trading", "Day Trading", "Position Trading"];
    await updateStrategies(defaultStrategies);
  }

  // Check if initial capital is set
  const { data: existingCapital } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'initial_capital')
    .single();

  if (!existingCapital) {
    // Set default initial capital
    await updateInitialCapital(10000);
  }

  console.log('Default data initialized successfully');
}
