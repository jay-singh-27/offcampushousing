-- OffCampus Housing Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('tenant', 'landlord')) NOT NULL,
  phone VARCHAR(20),
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colleges table
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  state_code VARCHAR(2) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United States',
  website TEXT,
  type VARCHAR(50),
  coordinates JSONB, -- {latitude: number, longitude: number}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for search performance
  UNIQUE(name, city, state)
);

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rent INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(2,1) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
  images TEXT[], -- Array of image URLs
  amenities TEXT[], -- Array of amenity strings
  available BOOLEAN DEFAULT TRUE,
  available_from DATE,
  lease_term VARCHAR(50),
  utilities_included BOOLEAN DEFAULT FALSE,
  pets_allowed BOOLEAN DEFAULT FALSE,
  parking_included BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User searches table (for analytics and recommendations)
CREATE TABLE user_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  search_query VARCHAR(255),
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  filters JSONB, -- Store search filters as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_colleges_name ON colleges USING GIN (to_tsvector('english', name));
CREATE INDEX idx_colleges_city ON colleges (city);
CREATE INDEX idx_colleges_state_code ON colleges (state_code);

CREATE INDEX idx_properties_rent ON properties (rent);
CREATE INDEX idx_properties_bedrooms ON properties (bedrooms);
CREATE INDEX idx_properties_city ON properties (city);
CREATE INDEX idx_properties_college_id ON properties (college_id);
CREATE INDEX idx_properties_available ON properties (available);
CREATE INDEX idx_properties_landlord_id ON properties (landlord_id);

CREATE INDEX idx_user_searches_user_id ON user_searches (user_id);
CREATE INDEX idx_user_searches_college_id ON user_searches (college_id);
CREATE INDEX idx_user_searches_created_at ON user_searches (created_at DESC);

-- Insert some popular colleges
INSERT INTO colleges (name, city, state, state_code, website, type, coordinates) VALUES
('Harvard University', 'Cambridge', 'Massachusetts', 'MA', 'https://www.harvard.edu', 'private', '{"latitude": 42.3736, "longitude": -71.1097}'),
('Massachusetts Institute of Technology', 'Cambridge', 'Massachusetts', 'MA', 'https://www.mit.edu', 'private', '{"latitude": 42.3601, "longitude": -71.0942}'),
('Stanford University', 'Stanford', 'California', 'CA', 'https://www.stanford.edu', 'private', '{"latitude": 37.4275, "longitude": -122.1697}'),
('University of California, Berkeley', 'Berkeley', 'California', 'CA', 'https://www.berkeley.edu', 'public', '{"latitude": 37.8719, "longitude": -122.2585}'),
('University of California, Los Angeles', 'Los Angeles', 'California', 'CA', 'https://www.ucla.edu', 'public', '{"latitude": 34.0689, "longitude": -118.4452}'),
('Columbia University', 'New York', 'New York', 'NY', 'https://www.columbia.edu', 'private', '{"latitude": 40.8075, "longitude": -73.9626}'),
('New York University', 'New York', 'New York', 'NY', 'https://www.nyu.edu', 'private', '{"latitude": 40.7295, "longitude": -73.9965}'),
('University of Chicago', 'Chicago', 'Illinois', 'IL', 'https://www.uchicago.edu', 'private', '{"latitude": 41.7886, "longitude": -87.5987}'),
('Northwestern University', 'Evanston', 'Illinois', 'IL', 'https://www.northwestern.edu', 'private', '{"latitude": 42.0564, "longitude": -87.6753}'),
('Boston University', 'Boston', 'Massachusetts', 'MA', 'https://www.bu.edu', 'private', '{"latitude": 42.3505, "longitude": -71.1054}'),
('University of Southern California', 'Los Angeles', 'California', 'CA', 'https://www.usc.edu', 'private', '{"latitude": 34.0224, "longitude": -118.2851}'),
('University of Washington', 'Seattle', 'Washington', 'WA', 'https://www.washington.edu', 'public', '{"latitude": 47.6553, "longitude": -122.3035}'),
('University of Texas at Austin', 'Austin', 'Texas', 'TX', 'https://www.utexas.edu', 'public', '{"latitude": 30.2849, "longitude": -97.7341}'),
('University of Michigan', 'Ann Arbor', 'Michigan', 'MI', 'https://www.umich.edu', 'public', '{"latitude": 42.2780, "longitude": -83.7382}'),
('University of Pennsylvania', 'Philadelphia', 'Pennsylvania', 'PA', 'https://www.upenn.edu', 'private', '{"latitude": 39.9522, "longitude": -75.1932}'),
('Sacred Heart University', 'Fairfield', 'Connecticut', 'CT', 'https://www.sacredheart.edu', 'private', '{"latitude": 41.1543, "longitude": -73.2482}');

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Properties are visible to all, but only landlords can edit their own
CREATE POLICY "Properties are viewable by all" ON properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Landlords can insert properties" ON properties FOR INSERT TO authenticated WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "Landlords can update own properties" ON properties FOR UPDATE TO authenticated USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can delete own properties" ON properties FOR DELETE TO authenticated USING (auth.uid() = landlord_id);

-- User searches are private to each user
CREATE POLICY "Users can view own searches" ON user_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own searches" ON user_searches FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Colleges are readable by all
CREATE POLICY "Colleges are viewable by all" ON colleges FOR SELECT TO authenticated USING (true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
