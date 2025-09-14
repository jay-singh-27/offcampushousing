import axios from 'axios';
import { BACKEND_CONFIG } from '../config/stripe';

const API_BASE_URL = BACKEND_CONFIG.baseUrl;

interface PaymentIntentRequest {
  amount: number; // Amount in cents
  currency: string;
  description?: string;
}

interface PaymentIntentResponse {
  client_secret: string;
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export class PaymentService {
  private static async makeRequest<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authorization header with user token
          // 'Authorization': `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`PaymentService error (${endpoint}):`, error);
      throw new Error('Payment service error');
    }
  }

  static async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    // For development/demo purposes, return a properly formatted mock response
    // This matches Stripe's client secret format: pi_xxx_secret_xxx
    return new Promise((resolve) => {
      setTimeout(() => {
        const timestamp = Date.now();
        resolve({
          client_secret: `pi_${timestamp}_secret_${timestamp}mock`,
          id: `pi_${timestamp}`,
          amount: request.amount,
          currency: request.currency,
          status: 'requires_payment_method',
        });
      }, 500);
    });

    // For actual Stripe integration, uncomment this and set up your backend:
    // return this.makeRequest<PaymentIntentResponse>('/payment/create-intent', request);
  }

  static async confirmPayment(paymentIntentId: string): Promise<{ success: boolean }> {
    // For development/demo purposes, return success
    // In production, this should make an actual API call to your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });

    // Uncomment this for actual API integration:
    // return this.makeRequest<{ success: boolean }>('/payment/confirm', {
    //   paymentIntentId,
    // });
  }

  static async getPaymentHistory(): Promise<any[]> {
    // For development/demo purposes, return empty array
    // In production, this should make an actual API call to your backend
    return [];

    // Uncomment this for actual API integration:
    // return this.makeRequest<any[]>('/payment/history');
  }
}
