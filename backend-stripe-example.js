// Example backend implementation for Stripe Checkout Sessions
// This should be hosted on your server (Node.js/Express)

const express = require('express');
const stripe = require('stripe')('sk_test_your_stripe_secret_key_here'); // Replace with your secret key
const cors = require('cors');

const app = express();

// Enable CORS for your mobile app
app.use(cors({
  origin: ['https://yourdomain.com', 'exp://192.168.1.100:19000'], // Add your development URLs
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Create Stripe Checkout Session
app.post('/api/payments/create-checkout-session', async (req, res) => {
  try {
    const { amount, currency, description, metadata, success_url, cancel_url } = req.body;

    // Validate required fields
    if (!amount || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: 'OffCampus Housing - Listing Fee',
              description: description,
              images: ['https://yourdomain.com/logo.png'], // Optional: Add your logo
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: metadata || {},
      success_url: success_url,
      cancel_url: cancel_url,
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
      // Customize the checkout page
      payment_intent_data: {
        description: description,
        metadata: metadata || {},
      },
      // Optional: Add customer email if you have it
      // customer_email: 'user@example.com',
    });

    res.json({
      id: session.id,
      url: session.url,
      payment_status: session.payment_status,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Validate Stripe Checkout Session
app.get('/api/payments/validate-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'], // Expand to get payment intent details
    });

    res.json({
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent?.id,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      customer_details: session.customer_details,
    });

  } catch (error) {
    console.error('Error validating session:', error);
    res.status(500).json({ 
      error: 'Failed to validate session',
      details: error.message 
    });
  }
});

// Webhook endpoint for Stripe events (optional but recommended)
app.post('/api/payments/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = 'whsec_your_webhook_secret_here'; // Replace with your webhook secret

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment succeeded for session:', session.id);
      
      // Here you would:
      // 1. Create the listing in your database
      // 2. Send confirmation email
      // 3. Update your app's state
      // 4. Send push notification to user
      
      break;
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      console.log('Payment failed:', paymentIntent.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;

/* 
DEPLOYMENT INSTRUCTIONS:

1. Install dependencies:
   npm install express stripe cors

2. Set environment variables:
   - STRIPE_SECRET_KEY=sk_live_your_secret_key
   - STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   - PORT=3000

3. Deploy to your preferred platform:
   - Heroku
   - AWS Lambda
   - Google Cloud Functions
   - Vercel
   - Railway
   - DigitalOcean App Platform

4. Update the API_BASE_URL in HybridPaymentService.ts to your deployed URL

5. Configure Stripe webhook endpoint:
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: https://yourdomain.com/api/payments/webhook
   - Select events: checkout.session.completed, payment_intent.payment_failed

6. Test with Stripe CLI (development):
   stripe listen --forward-to localhost:3000/api/payments/webhook
*/
