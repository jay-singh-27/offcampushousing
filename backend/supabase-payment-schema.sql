-- Additional schema for payment tracking
-- Run this in your Supabase SQL Editor

-- Payment intents table for tracking Stripe payments
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

-- Add payment_intent_id to properties table
ALTER TABLE properties ADD COLUMN payment_intent_id VARCHAR(255);
CREATE INDEX idx_properties_payment_intent_id ON properties (payment_intent_id);

-- RLS policies for payment_intents
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment intents" ON payment_intents 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage payment intents" ON payment_intents 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_payment_intents_updated_at 
BEFORE UPDATE ON payment_intents 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
