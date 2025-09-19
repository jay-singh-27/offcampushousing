export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'landlord' | 'tenant';
  phone?: string;
  profileImage?: string;
  createdAt: Date;
}

export interface Listing {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  college?: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  available: boolean;
  availableDate: string; // Changed from Date to string to match database format
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string; // Changed from Date to string to match database format
  updatedAt: string; // Changed from Date to string to match database format
  featured: boolean;
}

// Property interface from Supabase
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
  college?: string; // College name for display
  landlord_id: string;
  images: string[];
  amenities: string[];
  available: boolean;
  available_from: string;
  lease_term?: string;
  utilities_included: boolean;
  pets_allowed: boolean;
  parking_included: boolean;
  payment_intent_id?: string;
  coordinates?: { latitude: number; longitude: number };
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  location: string;
  college?: string;
  maxRent?: number;
  minRent?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ListingDetails: { listingId: string };
  CreateListing: undefined;
  Payment: { listingId: string; amount: number };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  MyListings: undefined;
  Profile: undefined;
};
