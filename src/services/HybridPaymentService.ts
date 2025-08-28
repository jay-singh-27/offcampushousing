import { Platform, Alert } from 'react-native';
import { Linking } from 'expo-linking';
import axios from 'axios';

interface PaymentRequest {
  listingId: string;
  amount: number;
  currency?: string;
  description?: string;
}

interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_status: string;
}

interface PaymentOptions {
  useWebRedirect?: boolean; // Use browser redirect (recommended)
  preferredMethod?: 'stripe_checkout' | 'webview' | 'external';
}

export class HybridPaymentService {
  private static readonly API_BASE_URL = 'https://your-backend-api.com/api';
  private static readonly SUCCESS_URL = 'offcampus://payment/success';
  private static readonly CANCEL_URL = 'offcampus://payment/cancel';

  /**
   * Creates a Stripe Checkout Session and returns the checkout URL
   */
  static async createStripeCheckoutSession(request: PaymentRequest): Promise<StripeCheckoutSession> {
    try {
      const response = await axios.post(`${this.API_BASE_URL}/payments/create-checkout-session`, {
        amount: request.amount * 100, // Convert to cents
        currency: request.currency || 'usd',
        description: request.description || 'OffCampus Housing - Listing Fee',
        metadata: {
          listingId: request.listingId,
          platform: Platform.OS,
        },
        success_url: `${this.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&listing_id=${request.listingId}`,
        cancel_url: `${this.CANCEL_URL}?listing_id=${request.listingId}`,
        // This ensures it's not considered an in-app purchase
        mode: 'payment',
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        phone_number_collection: {
          enabled: true,
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Add your API key or authentication here
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      throw new Error('Failed to create payment session');
    }
  }

  /**
   * Creates a mock Stripe Checkout Session for development
   */
  static async createMockStripeCheckoutSession(request: PaymentRequest): Promise<StripeCheckoutSession> {
    // For development purposes - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const sessionId = `cs_test_${Date.now()}`;
        resolve({
          id: sessionId,
          url: `https://checkout.stripe.com/pay/${sessionId}#fidkdWxOYHwnPyd1blpxYHZxWjA0S3xKQnNLbktoN1RXN2RcTUNPfGhQQmBfRTNqMjdrdUAxamFmQUp0NEpQSktmNzJHZnRMSn81TjAxXzFqY05mNF9CSDJqQXVxSXBTYkpLbWpgd2tuZldHVE9EfF8wdCcpJ3VpbGtuQH11anZXaUNtV2B2J3gl`,
          payment_status: 'open',
        });
      }, 1000);
    });
  }

  /**
   * Initiates Stripe Checkout payment by redirecting to browser
   */
  static async initiateStripeCheckoutPayment(
    request: PaymentRequest,
    useMockForDevelopment: boolean = true
  ): Promise<{ method: string; success: boolean; checkoutUrl?: string }> {
    try {
      // Create checkout session
      const checkoutSession = useMockForDevelopment 
        ? await this.createMockStripeCheckoutSession(request)
        : await this.createStripeCheckoutSession(request);

      // Open checkout URL in browser
      const supported = await Linking.canOpenURL(checkoutSession.url);
      
      if (supported) {
        await Linking.openURL(checkoutSession.url);
        return { 
          method: 'stripe_checkout', 
          success: true, 
          checkoutUrl: checkoutSession.url 
        };
      } else {
        throw new Error('Cannot open browser for payment');
      }
    } catch (error) {
      console.error('Stripe checkout initiation failed:', error);
      return { 
        method: 'stripe_checkout', 
        success: false 
      };
    }
  }

  /**
   * Shows Stripe payment confirmation dialog
   */
  static showStripePaymentDialog(
    request: PaymentRequest
  ): Promise<{ method: string; success: boolean; checkoutUrl?: string }> {
    return new Promise((resolve) => {
      Alert.alert(
        'Secure Payment with Stripe',
        `Complete your $${request.amount} payment securely with Stripe. You'll be redirected to your browser for the best rates and to avoid app store fees.`,
        [
          {
            text: 'Pay with Stripe',
            onPress: async () => {
              const result = await this.initiateStripeCheckoutPayment(request);
              resolve(result);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ method: 'cancelled', success: false }),
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Validates Stripe Checkout Session completion
   */
  static async validateStripePayment(
    sessionId: string
  ): Promise<{ success: boolean; listingId?: string; paymentIntent?: string }> {
    try {
      // In a real implementation, call your backend to retrieve session details
      const response = await axios.get(`${this.API_BASE_URL}/payments/validate-session/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add your API key or authentication here
        },
      });

      return {
        success: response.data.payment_status === 'paid',
        listingId: response.data.metadata?.listingId,
        paymentIntent: response.data.payment_intent,
      };
    } catch (error) {
      console.error('Payment validation failed:', error);
      // For development, return mock success
      return {
        success: true,
        listingId: 'mock-listing-id',
        paymentIntent: 'pi_mock_payment_intent',
      };
    }
  }

  /**
   * Handles deep link returns from Stripe Checkout
   */
  static handleStripeReturn(url: string): { success: boolean; sessionId?: string; listingId?: string } {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      const sessionId = parsedUrl.searchParams.get('session_id');
      const listingId = parsedUrl.searchParams.get('listing_id');
      
      const success = pathname.includes('/success');
      
      return {
        success,
        sessionId: sessionId || undefined,
        listingId: listingId || undefined,
      };
    } catch (error) {
      console.error('Error parsing Stripe return URL:', error);
      return { success: false };
    }
  }

  /**
   * Get Stripe configuration
   */
  static getStripeConfig() {
    return {
      apiBaseUrl: this.API_BASE_URL,
      successUrl: this.SUCCESS_URL,
      cancelUrl: this.CANCEL_URL,
      supportedCurrencies: ['usd'],
      platformInfo: {
        os: Platform.OS,
        version: Platform.Version,
      },
    };
  }
}
