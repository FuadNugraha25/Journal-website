-- Supabase SQL Schema for Fuad's Journal Trading App
-- Run this in your Supabase SQL editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pair VARCHAR(10) NOT NULL CHECK (pair IN ('XAUUSD', 'GBPJPY', 'EURUSD')),
  type VARCHAR(4) NOT NULL CHECK (type IN ('buy', 'sell')),
  profit DECIMAL(10,2) NOT NULL,
  outcome VARCHAR(10) NOT NULL CHECK (outcome IN ('tp', 'sl', 'breakeven', 'cp', 'cl')),
  risk_reward_ratio DECIMAL(5,2) NOT NULL,
  close_date TIMESTAMPTZ NOT NULL,
  strategy VARCHAR(50) NOT NULL,
  session VARCHAR(10) NOT NULL CHECK (session IN ('Asian', 'London', 'New York')),
  image TEXT,
  lot_size DECIMAL(5,2) NOT NULL,
  risk_size DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(50) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default strategies
INSERT INTO strategies (name) VALUES 
  ('Scalping'),
  ('Swing Trading'),
  ('Day Trading'),
  ('Position Trading')
ON CONFLICT (name) DO NOTHING;

-- Insert default initial capital setting
INSERT INTO settings (key, value) VALUES 
  ('initial_capital', '10000')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_close_date ON trades(close_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_pair ON trades(pair);
CREATE INDEX IF NOT EXISTS idx_trades_outcome ON trades(outcome);
CREATE INDEX IF NOT EXISTS idx_trades_session ON trades(session);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- No sample trades - start with a clean database
