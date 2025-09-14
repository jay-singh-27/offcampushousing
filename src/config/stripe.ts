import Constants from 'expo-constants';

// Get Stripe configuration from app.json
export const STRIPE_CONFIG = {
  publishableKey: Constants.expoConfig?.extra?.stripePublishableKey || 'pk_test_your_key_here',
  merchantIdentifier: 'merchant.com.offcampushousing.app',
  urlScheme: 'offcampus',
};

export const BACKEND_CONFIG = {
  baseUrl: Constants.expoConfig?.extra?.backendUrl || 'http://localhost:3000/api',
};

// Stripe pricing
export const PRICING = {
  LISTING_FEE: 25, // $25 for 30-day listing
  FEATURED_LISTING: 50, // $50 for featured listing
  PREMIUM_LISTING: 75, // $75 for premium listing with top placement
};
