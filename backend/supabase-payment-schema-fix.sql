-- Fixed Payment Schema - handles existing tables
-- Run this in your Supabase SQL Editor

-- Drop existing payment_intents table if it exists (be careful with production data!)
DROP TABLE IF EXISTS payment_intents CASCADE;

-- Recreate payment_intents table
CREATE TABLE payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL,
  description TEXT,
  listing_data JSONB, -- Store listing data before creation
  listing_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_payment_intents_payment_intent_id ON payment_intents (payment_intent_id);
CREATE INDEX idx_payment_intents_user_id ON payment_intents (user_id);
CREATE INDEX idx_payment_intents_status ON payment_intents (status);
CREATE INDEX idx_payment_intents_created_at ON payment_intents (created_at DESC);

-- Add payment_intent_id to properties table (only if column doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'payment_intent_id') THEN
        ALTER TABLE properties ADD COLUMN payment_intent_id VARCHAR(255);
    END IF;
END $$;

-- Create index for payment_intent_id on properties
DROP INDEX IF EXISTS idx_properties_payment_intent_id;
CREATE INDEX idx_properties_payment_intent_id ON properties (payment_intent_id);

-- RLS policies for payment_intents
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own payment intents" ON payment_intents;
DROP POLICY IF EXISTS "Service role can manage payment intents" ON payment_intents;

-- Create new policies
CREATE POLICY "Users can view own payment intents" ON payment_intents 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payment intents" ON payment_intents 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger for updated_at (only create if function exists)
DROP TRIGGER IF EXISTS update_payment_intents_updated_at ON payment_intents;
CREATE TRIGGER update_payment_intents_updated_at 
BEFORE UPDATE ON payment_intents 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
