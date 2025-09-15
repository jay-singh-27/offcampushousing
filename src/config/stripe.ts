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

// Stripe product configuration
export const STRIPE_PRODUCTS = {
  LANDLORD_LISTING_FEE: {
    productId: 'prod_T3YbVPokdJmKAk',
    priceId: '', // We'll fetch this dynamically
    amount: 100, // $100.00 USD
    description: 'Landlord Listing Fee',
  }
};

// Legacy pricing (kept for reference)
export const PRICING = {
  LISTING_FEE: 100, // Updated to match Stripe product - $100 for 30-day listing
  FEATURED_LISTING: 150, // $150 for featured listing
  PREMIUM_LISTING: 200, // $200 for premium listing with top placement
};
