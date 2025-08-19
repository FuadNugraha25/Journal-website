// Test file to verify Supabase connection
// You can run this to test if your Supabase integration is working
// Remove this file after testing

import { supabase } from './supabase';
import { getTrades, addTrade, getStrategies } from './data';

export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test 1: Check Supabase client connection
    const { data, error } = await supabase.from('trades').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    console.log('✅ Supabase client connected successfully');

    // Test 2: Check if strategies are loaded
    const strategies = await getStrategies();
    console.log('✅ Strategies loaded:', strategies);

    // Test 3: Check if trades can be fetched (should be empty initially)
    const trades = await getTrades();
    console.log('✅ Trades fetched:', trades.length, 'trades found');

    // Test 4: Try adding a test trade (uncomment to test)
    /*
    const testTrade = {
      pair: 'XAUUSD' as const,
      type: 'buy' as const,
      profit: 100,
      outcome: 'tp' as const,
      riskRewardRatio: 2,
      closeDate: new Date(),
      strategy: 'Scalping',
      session: 'London' as const,
      image: null,
      lotSize: 0.1,
      riskSize: 50,
    };
    
    const newTrade = await addTrade(testTrade);
    console.log('✅ Test trade added:', newTrade.id);
    */

    console.log('🎉 All Supabase tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return false;
  }
}

// Call this function in your browser console to test
// testSupabaseConnection();
