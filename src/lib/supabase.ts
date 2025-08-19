import { createClient } from '@supabase/supabase-js'

// For now using direct values, but you should move these to environment variables
// Add to your .env.local file:
// NEXT_PUBLIC_SUPABASE_URL=https://fetknpehixicsreetdiy.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZldGtucGVoaXhpY3NyZWV0ZGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjI0NzMsImV4cCI6MjA2OTkzODQ3M30.V8WZf8LXZnourOJVnCUcmUfr6_LpLa4bWE6hjsRWTU8

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fetknpehixicsreetdiy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZldGtucGVoaXhpY3NyZWV0ZGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjI0NzMsImV4cCI6MjA2OTkzODQ3M30.V8WZf8LXZnourOJVnCUcmUfr6_LpLa4bWE6hjsRWTU8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your existing Trade interface
export type Database = {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string
          pair: 'XAUUSD' | 'GBPJPY' | 'EURUSD'
          type: 'buy' | 'sell'
          profit: number
          outcome: 'tp' | 'sl' | 'breakeven' | 'cp' | 'cl'
          risk_reward_ratio: number
          close_date: string
          strategy: string
          session: 'Asian' | 'London' | 'New York'
          image: string | null
          lot_size: number
          risk_size: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pair: 'XAUUSD' | 'GBPJPY' | 'EURUSD'
          type: 'buy' | 'sell'
          profit: number
          outcome: 'tp' | 'sl' | 'breakeven' | 'cp' | 'cl'
          risk_reward_ratio: number
          close_date: string
          strategy: string
          session: 'Asian' | 'London' | 'New York'
          image?: string | null
          lot_size: number
          risk_size: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pair?: 'XAUUSD' | 'GBPJPY' | 'EURUSD'
          type?: 'buy' | 'sell'
          profit?: number
          outcome?: 'tp' | 'sl' | 'breakeven' | 'cp' | 'cl'
          risk_reward_ratio?: number
          close_date?: string
          strategy?: string
          session?: 'Asian' | 'London' | 'New York'
          image?: string | null
          lot_size?: number
          risk_size?: number
          created_at?: string
          updated_at?: string
        }
      }
      strategies: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
