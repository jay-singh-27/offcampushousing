-- Fix RLS policies for users table
-- Run this in your Supabase SQL Editor

-- Add INSERT policy for users table
CREATE POLICY "Users can insert own data" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Also ensure we have the correct policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Recreate policies with correct permissions
CREATE POLICY "Users can view own data" ON users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users 
FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to read their own data and insert new records
CREATE POLICY "Users can insert own data during registration" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);
