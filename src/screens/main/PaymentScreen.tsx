import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { RootStackParamList } from '../../types';
import { CustomButton } from '../../components/common/CustomButton';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { PaymentService } from '../../services/PaymentService';
import { PropertyService } from '../../services/PropertyService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const { listingId, amount } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSheetInitialized, setPaymentSheetInitialized] = useState(false);

  const initializePaymentSheet = async () => {
    try {
      setIsLoading(true);
      
      // Create payment intent on the server
      const paymentIntent = await PaymentService.createPaymentIntent({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        description: 'Listing fee for property posting',
      });

      // Initialize the payment sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'OffCampus Housing',
        paymentIntentClientSecret: paymentIntent.client_secret,
        defaultBillingDetails: {
          name: 'Landlord',
        },
        allowsDelayedPaymentMethods: false,
        returnURL: 'offcampus://payment-return',
      });

      if (error) {
        throw new Error(error.message);
      }

      setPaymentSheetInitialized(true);
    } catch (error) {
      console.error('Payment sheet initialization failed:', error);
      Alert.alert('Payment Error', 'Failed to initialize payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentSheetInitialized) {
      await initializePaymentSheet();
      return;
    }

    try {
      setIsLoading(true);
      
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code !== 'Canceled') {
          Alert.alert('Payment Failed', error.message);
        }
        return;
      }

      // Payment successful
      await handlePaymentSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
      Alert.alert('Payment Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      console.log('💰 Payment successful, creating listing...');
      
      // Get the listing data from AsyncStorage (stored when user filled the form)
      const listingDataJson = await AsyncStorage.getItem('pendingListingData');
      if (!listingDataJson) {
        throw new Error('No listing data found. Please go back and fill the form again.');
      }

      const listingData = JSON.parse(listingDataJson);
      console.log('📋 Retrieved listing data:', listingData);

      // Create the property in Supabase
      const property = await PropertyService.createProperty({
        title: listingData.title,
        description: listingData.description,
        rent: parseFloat(listingData.rent),
        bedrooms: parseInt(listingData.bedrooms),
        bathrooms: parseFloat(listingData.bathrooms),
        address: listingData.address,
        city: listingData.city,
        state: listingData.state,
        zip_code: listingData.zipCode,
        images: listingData.images || [],
        amenities: listingData.amenities || [],
        available_from: listingData.availableDate,
        lease_term: '12 months', // Default value
        utilities_included: false,
        pets_allowed: false,
        parking_included: false,
      });

      console.log('🏠 Listing created successfully:', property.id);
      
      // Clear the pending listing data
      await AsyncStorage.removeItem('pendingListingData');
      
      Alert.alert(
        'Payment Successful! 🎉',
        'Your listing has been published and will be visible to tenants within a few minutes.',
        [
          {
            text: 'View My Listings',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
              // Navigate to My Listings tab
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Payment was successful but there was an issue creating your listing. Please contact support.');
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={32} color="#007AFF" />
            <Text style={styles.cardTitle}>Listing Fee</Text>
          </View>

          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Landlord Listing Fee (30 days)</Text>
              <Text style={styles.summaryValue}>${amount}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${amount}</Text>
            </View>
          </View>

          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>What's included:</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                <Text style={styles.benefitText}>30-day listing visibility</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                <Text style={styles.benefitText}>Unlimited photo uploads</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                <Text style={styles.benefitText}>Contact form for inquiries</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                <Text style={styles.benefitText}>Search visibility boost</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#28A745" />
                <Text style={styles.benefitText}>Analytics dashboard</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.securitySection}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#28A745" />
            <Text style={styles.securityTitle}>Secure Payment</Text>
          </View>
          <Text style={styles.securityText}>
            Your payment is processed securely through Stripe. We never store your payment information.
          </Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By proceeding with payment, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title={paymentSheetInitialized ? `Pay $${amount}` : 'Initialize Payment'}
          onPress={handlePayment}
          disabled={isLoading}
          style={styles.payButton}
        />
        
        <TouchableOpacity onPress={handleGoBack} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {isLoading && <LoadingOverlay message="Processing payment..." />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
  },
  orderSummary: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  benefitsSection: {
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  securitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  termsSection: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  payButton: {
    marginBottom: 12,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
});

export default PaymentScreen;
