# Hybrid Payment Implementation Guide

## Overview

This implementation creates a hybrid payment system for the OffCampus Housing app that allows users to pay through a web interface instead of native mobile payments, avoiding Apple's 30% commission on in-app purchases.

## Architecture

### 1. Payment Flow Options

- **Web Payment (Recommended)**: Opens WebView inside the app
- **External Browser**: Opens payment page in external browser
- **Native Payment**: Fallback to original Stripe implementation

### 2. Key Components

#### WebPaymentScreen.tsx
- Renders payment page in WebView
- Handles navigation and communication between web and native
- Manages payment completion callbacks

#### HybridPaymentService.ts
- Central service for payment method selection
- Handles URL generation and routing
- Manages payment validation and callbacks

#### Web Payment Template
- Self-contained HTML payment page
- Mobile-optimized responsive design
- Communicates with mobile app via postMessage API

## Setup Instructions

### 1. Host Your Payment Page

1. Upload `web-payment-template.html` to your website
2. Update the `WEB_PAYMENT_URL` in `HybridPaymentService.ts`:
   ```typescript
   private static readonly WEB_PAYMENT_URL = 'https://your-domain.com/payment';
   ```

### 2. Configure Payment Processing

The template includes a mock payment flow. For production:

1. **Integrate with Stripe Web Elements**:
   ```html
   <script src="https://js.stripe.com/v3/"></script>
   ```

2. **Add PayPal SDK**:
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
   ```

3. **Set up backend endpoints** for payment processing

### 3. Update Backend Integration

Update `HybridPaymentService.ts` to call your actual payment APIs:

```typescript
static async validatePaymentCompletion(paymentId: string): Promise<{success: boolean}> {
  const response = await fetch('/api/payments/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId })
  });
  return response.json();
}
```

### 4. Configure Deep Links

In `app.json`, ensure your app can handle return URLs:

```json
{
  "expo": {
    "scheme": "offcampus"
  }
}
```

## Benefits

### Cost Savings
- **Avoid 30% App Store fees** on payments
- **Lower payment processing rates** (typically 2.9% vs 30%)
- **Direct relationship** with payment processors

### User Experience
- **Familiar web payment interface**
- **Support for more payment methods** (bank transfers, regional options)
- **Better conversion rates** due to trusted web checkout

### Compliance
- **Follows App Store guidelines** by not processing digital goods through IAP
- **Legitimate use case** for physical services (room listings)
- **Better for subscription services** and recurring payments

## Security Considerations

### 1. HTTPS Required
- All payment pages must use HTTPS
- Certificate validation in WebView

### 2. Input Validation
- Validate all payment data on backend
- Use proper PCI-compliant payment processors

### 3. Domain Whitelist
- Restrict WebView to your payment domain
- Block navigation to external sites

## Testing

### 1. Test Payment Flow
```bash
npm run ios
# Navigate to Create Listing > Payment
# Select "Web Payment (Recommended)"
```

### 2. Test Return URLs
- Verify success/failure callbacks work
- Test deep link handling
- Validate error handling

### 3. Cross-Platform Testing
- Test on iOS and Android
- Verify WebView behavior
- Test external browser fallback

## Production Checklist

- [ ] Upload payment page to production domain
- [ ] Configure SSL certificate
- [ ] Set up payment processor (Stripe/PayPal)
- [ ] Update API endpoints in service
- [ ] Test payment flows thoroughly
- [ ] Configure analytics tracking
- [ ] Set up error monitoring
- [ ] Prepare customer support documentation

## Troubleshooting

### Common Issues

1. **WebView not loading**: Check URL and network connectivity
2. **Payment not completing**: Verify return URL configuration
3. **Deep links not working**: Check app scheme configuration

### Debug Mode

Enable debug logging in `HybridPaymentService.ts`:

```typescript
private static DEBUG = __DEV__;

private static log(message: string, data?: any) {
  if (this.DEBUG) {
    console.log(`[HybridPayment] ${message}`, data);
  }
}
```

## Legal Considerations

- Ensure compliance with local payment regulations
- Update privacy policy to cover payment data handling
- Review App Store guidelines for your specific use case
- Consider PCI DSS compliance requirements

## Support

For issues with this implementation:
1. Check the troubleshooting section
2. Review payment processor documentation
3. Test with different payment methods
4. Verify network connectivity and SSL certificates
