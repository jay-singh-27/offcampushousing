import axios from 'axios';
import { BACKEND_CONFIG } from '../config/stripe';
import { supabase } from '../config/supabase';

const API_BASE_URL = BACKEND_CONFIG.baseUrl;

interface PaymentIntentRequest {
  amount: number; // Amount in cents
  currency: string;
  description?: string;
  userId: string;
  listingData?: any;
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
    try {
      // Get current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Make request to backend
      const response = await this.makeRequest<PaymentIntentResponse>('/payment/create-intent', {
        ...request,
        userId: user.id
      });

      return response;
    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      throw error;
    }
  }

  static async confirmPayment(paymentIntentId: string): Promise<{ success: boolean }> {
    try {
      // Get current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await this.makeRequest<{ success: boolean }>('/payment/confirm', { 
        paymentIntentId,
        userId: user.id 
      });
      
      return response;
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      throw error;
    }
  }

  static async getPaymentHistory(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await this.makeRequest<{ payments: any[] }>(`/payment/history/${user.id}`);
      return response.payments;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

}
