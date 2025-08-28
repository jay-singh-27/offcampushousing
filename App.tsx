import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { HybridPaymentService } from './src/services/HybridPaymentService';

const prefix = Linking.createURL('/');

export default function App() {
  useEffect(() => {
    // Handle deep links when app is opened from external sources
    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      
      // Check if it's a payment return URL
      if (url.includes('payment/success') || url.includes('payment/cancel')) {
        const result = HybridPaymentService.handleStripeReturn(url);
        
        if (result.success && result.sessionId) {
          // Validate the payment
          const validation = await HybridPaymentService.validateStripePayment(result.sessionId);
          
          if (validation.success) {
            Alert.alert(
              'Payment Successful! 🎉',
              'Your listing has been published and will be visible to tenants within a few minutes.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert(
              'Payment Verification Failed',
              'There was an issue verifying your payment. Please contact support.',
              [{ text: 'OK' }]
            );
          }
        } else {
          Alert.alert(
            'Payment Cancelled',
            'Your payment was cancelled. You can try again from the listing page.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    // Subscribe to incoming links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Handle the case where the app was opened by a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, []);

  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        Main: '',
        Payment: 'payment/:listingId/:amount',
        WebPayment: 'webpayment/:listingId/:amount',
      },
    },
  };

  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
