import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../types';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

type WebPaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WebPayment'>;
type WebPaymentScreenRouteProp = RouteProp<RootStackParamList, 'WebPayment'>;

const WebPaymentScreen: React.FC = () => {
  const navigation = useNavigation<WebPaymentScreenNavigationProp>();
  const route = useRoute<WebPaymentScreenRouteProp>();
  const webViewRef = useRef<WebView>(null);
  
  const { listingId, amount } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Your web payment URL - replace with your actual payment page
  const PAYMENT_BASE_URL = 'https://your-website.com/payment';
  const paymentUrl = `${PAYMENT_BASE_URL}?listingId=${listingId}&amount=${amount}&platform=mobile`;

  const handleNavigationStateChange = (navState: any) => {
    setCurrentUrl(navState.url);
    setCanGoBack(navState.canGoBack);
    
    // Check for payment completion URLs
    if (navState.url.includes('/payment/success')) {
      handlePaymentSuccess();
    } else if (navState.url.includes('/payment/cancel') || navState.url.includes('/payment/failure')) {
      handlePaymentFailure();
    }
  };

  const handlePaymentSuccess = () => {
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
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handlePaymentFailure = () => {
    Alert.alert(
      'Payment Failed',
      'Your payment could not be processed. Please try again.',
      [
        {
          text: 'Try Again',
          onPress: () => {
            webViewRef.current?.reload();
          },
        },
        {
          text: 'Go Back',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ]
    );
  };

  const handleGoBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      Alert.alert(
        'Exit Payment',
        'Are you sure you want to exit the payment process?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Exit', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  const handleRefresh = () => {
    webViewRef.current?.reload();
  };

  const onError = (error: any) => {
    console.error('WebView error:', error);
    Alert.alert(
      'Connection Error',
      'Unable to load the payment page. Please check your internet connection and try again.',
      [
        { text: 'Retry', onPress: handleRefresh },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]
    );
  };

  const onLoadStart = () => {
    setIsLoading(true);
  };

  const onLoadEnd = () => {
    setIsLoading(false);
  };

  // Inject JavaScript to handle mobile-specific behavior
  const injectedJavaScript = `
    // Add mobile-specific styles
    document.body.style.fontSize = '16px';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // Prevent zoom on input focus (iOS)
    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    // Add payment completion handlers
    window.addEventListener('message', function(event) {
      if (event.data.type === 'PAYMENT_SUCCESS') {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'PAYMENT_SUCCESS'}));
      } else if (event.data.type === 'PAYMENT_FAILURE') {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'PAYMENT_FAILURE'}));
      }
    });
    
    true; // Required for injected JavaScript
  `;

  const onMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'PAYMENT_SUCCESS') {
        handlePaymentSuccess();
      } else if (message.type === 'PAYMENT_FAILURE') {
        handlePaymentFailure();
      }
    } catch (error) {
      console.log('Message parsing error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.urlBar}>
        <Ionicons name="lock-closed" size={16} color="#28A745" />
        <Text style={styles.urlText} numberOfLines={1}>
          {currentUrl || 'Loading secure payment page...'}
        </Text>
      </View>

      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onError={onError}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          onMessage={onMessage}
          injectedJavaScript={injectedJavaScript}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mixedContentMode="compatibility"
          allowsFullscreenVideo={false}
          bounces={false}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          decelerationRate="normal"
          // Security settings
          allowsBackForwardNavigationGestures={false}
          allowFileAccess={false}
          allowFileAccessFromFileURLs={false}
          allowUniversalAccessFromFileURLs={false}
          // Performance settings
          cacheEnabled={true}
          incognito={false}
          style={styles.webView}
        />
      </View>

      {isLoading && (
        <LoadingOverlay message="Loading secure payment page..." />
      )}
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
  refreshButton: {
    padding: 4,
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  urlText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default WebPaymentScreen;
