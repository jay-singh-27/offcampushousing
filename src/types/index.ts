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
  availableDate: Date;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
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
