 const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for backend operations
);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Webhook endpoint MUST come before express.json() middleware
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Webhook event received:', event.type);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update payment status in database
      await supabase
        .from('payment_intents')
        .update({ 
          status: 'succeeded',
          updated_at: new Date().toISOString()
        })
        .eq('payment_intent_id', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      await supabase
        .from('payment_intents')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_intent_id', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// JSON middleware for all other routes
app.use(express.json());

// Auth callback endpoint for email confirmation
app.get('/auth/callback', (req, res) => {
  const { access_token, refresh_token, expires_in, token_type } = req.query;
  
  if (access_token) {
    // Redirect to mobile app with tokens
    const deepLinkUrl = `offcampushousing://auth/callback?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}&token_type=${token_type}`;
    
    res.redirect(deepLinkUrl);
  } else {
    // Show a simple success page
    res.send(`
      <html>
        <head>
          <title>Email Confirmed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
            .success { color: #28a745; font-size: 48px; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; line-height: 1.6; }
            .button { display: inline-block; background: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅</div>
            <h1>Email Confirmed!</h1>
            <p>Your email has been successfully confirmed. You can now return to the OffCampus Housing app and log in.</p>
            <a href="offcampushousing://auth/confirmed" class="button">Open App</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Payment endpoints
app.post('/api/payment/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', description, userId, listingData } = req.body;

    // Validate required fields
    if (!amount || amount < 50) { // Minimum $0.50
      return res.status(400).json({ error: 'Invalid amount. Minimum $0.50 required.' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure it's an integer (cents)
      currency,
      description: description || 'OffCampus Housing - Landlord Listing Fee',
      metadata: {
        userId,
        listingTitle: listingData?.title || '',
        timestamp: new Date().toISOString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store payment intent in Supabase for tracking
    await supabase
      .from('payment_intents')
      .insert([{
        payment_intent_id: paymentIntent.id,
        user_id: userId,
        amount: amount,
        currency: currency,
        status: paymentIntent.status,
        description: description,
        listing_data: listingData,
        created_at: new Date().toISOString()
      }]);

    res.json({
      client_secret: paymentIntent.client_secret,
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error.message 
    });
  }
});

// Confirm payment and create listing
app.post('/api/payment/confirm', async (req, res) => {
  try {
    const { paymentIntentId, userId } = req.body;

    if (!paymentIntentId || !userId) {
      return res.status(400).json({ error: 'Payment Intent ID and User ID are required.' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed successfully.' });
    }

    // Get payment data from Supabase
    const { data: paymentData, error: paymentError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .eq('user_id', userId)
      .single();

    if (paymentError || !paymentData) {
      return res.status(404).json({ error: 'Payment record not found.' });
    }

    // Create the property listing
    if (paymentData.listing_data) {
      const { data: listing, error: listingError } = await supabase
        .from('properties')
        .insert([{
          ...paymentData.listing_data,
          landlord_id: userId,
          payment_intent_id: paymentIntentId,
          available: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (listingError) {
        console.error('Error creating listing:', listingError);
        return res.status(500).json({ error: 'Payment succeeded but failed to create listing.' });
      }

      // Update payment status
      await supabase
        .from('payment_intents')
        .update({ 
          status: 'succeeded',
          listing_id: listing.id,
          updated_at: new Date().toISOString()
        })
        .eq('payment_intent_id', paymentIntentId);

      res.json({
        success: true,
        paymentIntent: paymentIntent,
        listing: listing,
        message: 'Payment successful and listing created!'
      });
    } else {
      res.json({
        success: true,
        paymentIntent: paymentIntent,
        message: 'Payment successful!'
      });
    }

  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      message: error.message 
    });
  }
});

// Get payment history for user
app.get('/api/payment/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: payments, error } = await supabase
      .from('payment_intents')
      .select(`
        *,
        property:listing_id (
          title,
          city,
          state,
          rent
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ payments });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment history',
      message: error.message 
    });
  }
});


// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 OffCampus Housing Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Stripe integration: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL ? 'Connected' : 'Not connected'}`);
});
