// Import Supabase data functions
import {
  getTrades as getSupabaseTrades,
  addTrade as addSupabaseTrade,
  getStrategies as getSupabaseStrategies,
  updateStrategies as updateSupabaseStrategies,
  addStrategy as addSupabaseStrategy,
  getInitialCapital as getSupabaseInitialCapital,
  initializeDefaultData
} from './supabase-data';
// Use server-only admin client for writes to settings
// IMPORTANT: Do not statically import the admin module here, since this file is imported by client components.
// We'll dynamically import it within server-only functions to avoid leaking server envs to the client.

import type { Trade, TradeStrategy } from './types';

// Export Supabase functions with the same interface
export async function getTrades(): Promise<Trade[]> {
  return getSupabaseTrades();
}

export async function addTrade(tradeData: Omit<Trade, 'id'>): Promise<Trade> {
  return addSupabaseTrade(tradeData);
}

export async function getStrategies(): Promise<TradeStrategy[]> {
  return getSupabaseStrategies();
}

export async function updateStrategies(newStrategies: TradeStrategy[]): Promise<void> {
  return updateSupabaseStrategies(newStrategies);
}

export async function addStrategy(strategy: TradeStrategy): Promise<void> {
  return addSupabaseStrategy(strategy);
}

export async function getInitialCapital(): Promise<number> {
  return getSupabaseInitialCapital();
}

export async function updateInitialCapital(newCapital: number): Promise<void> {
  // This must only run on the server. The admin client uses the service role key.
  if (typeof window !== 'undefined') {
    throw new Error('updateInitialCapital must be called on the server');
  }
  const { updateInitialCapital: adminUpdate } = await import('./supabase-admin-data');
  return adminUpdate(newCapital);
}

// Initialize default data when needed
export async function initializeData(): Promise<void> {
  return initializeDefaultData();
}
