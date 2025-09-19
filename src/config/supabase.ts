import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get Supabase credentials from app.json extra config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enable URL session detection for deep links
    flowType: 'pkce', // Use PKCE flow for mobile apps
  },
});

// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  user_type: 'tenant' | 'landlord';
  phone?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  state_code: string;
  country: string;
  website?: string;
  type?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  college_id?: string;
  landlord_id: string;
  images: string[];
  amenities: string[];
  available: boolean;
  available_from: string;
  lease_term: string;
  utilities_included: boolean;
  pets_allowed: boolean;
  parking_included: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSearch {
  id: string;
  user_id: string;
  search_query: string;
  college_id?: string;
  filters: Record<string, any>;
  created_at: string;
}
