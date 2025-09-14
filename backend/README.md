# OffCampus Housing Backend

A Node.js/Express backend server with Stripe payment processing and Supabase integration.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `env-template.txt` to `.env` and fill in your credentials:

```bash
cp env-template.txt .env
```

Required environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key (sk_test_...)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key (not anon key!)

### 3. Database Setup
Run the SQL schema in your Supabase SQL Editor:
```sql
-- Run supabase-payment-schema.sql in Supabase
```

### 4. Get Your Stripe Keys

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com)**
2. **Get API Keys**:
   - Go to Developers → API keys
   - Copy your **Publishable key** (pk_test_...)
   - Copy your **Secret key** (sk_test_...)

3. **Set up Webhooks**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://your-backend-url.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret (whsec_...)

### 5. Run Locally
```bash
npm run dev
```

Server runs on http://localhost:3000

Test health check: http://localhost:3000/health

## 📱 Frontend Integration

Update your `app.json`:
```json
{
  "extra": {
    "stripePublishableKey": "pk_test_your_actual_stripe_key",
    "backendUrl": "https://your-deployed-backend.herokuapp.com/api"
  }
}
```

## 🌐 Deployment Options

### Option 1: Heroku (Recommended)
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_test_your_key
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_SERVICE_KEY=your_service_key

# Deploy
git init
git add .
git commit -m "Initial backend setup"
heroku git:remote -a your-app-name
git push heroku main
```

### Option 2: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 3: Render
1. Connect your GitHub repo to Render
2. Set environment variables in Render dashboard
3. Deploy automatically

## 🧪 Testing

### Test Payment Flow
```bash
# Create payment intent
curl -X POST http://localhost:3000/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "currency": "usd",
    "description": "Test payment",
    "userId": "test-user-id"
  }'
```

### Test Health Check
```bash
curl http://localhost:3000/health
```

## 📊 API Endpoints

- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/confirm` - Confirm payment and create listing
- `GET /api/payment/history/:userId` - Get payment history
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `GET /health` - Health check

## 🔒 Security Features

- CORS protection
- Rate limiting (100 requests/15 minutes)
- Helmet security headers
- Environment variable validation
- Row Level Security with Supabase
- Webhook signature verification

## 📝 Notes

- Uses Stripe test mode by default
- All amounts are in cents (USD)
- Payments are tracked in Supabase
- Webhooks handle payment status updates
- Service role key required for backend operations
