import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { STRIPE_CONFIG } from './src/config/stripe';
import { supabase } from './src/config/supabase';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Handle deep links for email confirmation
    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep link received:', url);
      
      // Parse the URL for Supabase auth tokens
      if (url.includes('#access_token=') || url.includes('?access_token=')) {
        try {
          // Extract tokens from URL manually since getSessionFromUrl might not be available
          const urlParams = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
          const accessToken = urlParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token');
          
          if (accessToken) {
            console.log('✅ Email confirmation successful via deep link');
            // The auth state change listener will handle the session update
          }
        } catch (error) {
          console.error('❌ Deep link auth error:', error);
        }
      }
    };

    // Listen for deep links when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Handle deep link when app is opened from link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, []);

  const linking = {
    prefixes: ['offcampushousing://', 'exp://192.168.4.59:8081'],
    config: {
      screens: {
        Welcome: 'welcome',
        Login: 'login',
        Register: 'register',
        Main: 'main',
        ListingDetails: 'listing/:listingId',
        CreateListing: 'create-listing',
        Payment: 'payment',
      },
    },
  };

  return (
    <StripeProvider publishableKey={STRIPE_CONFIG.publishableKey}>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </StripeProvider>
  );
}
