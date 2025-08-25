# OffCampus Housing - React Native App

A modern iOS app for off-campus housing, similar to JumpOffCampus.com, built with React Native and Expo.

## Features

### For Tenants (Free)
- 🔍 Search listings by zip code, city, or college
- 📍 Location-based property discovery
- 💾 Save favorite properties
- 📞 Contact landlords directly
- 🗺️ Interactive maps with property locations
- 🏫 College-specific search filters

### For Landlords (Paid)
- 🏠 Create and manage property listings
- 💳 Stripe payment integration for listing fees ($25/listing)
- 📸 Upload multiple property photos
- 🏷️ Add amenities and property details
- 📊 View listing analytics
- ⚡ Toggle listing availability

### General Features
- 🔐 Secure user authentication
- 👥 User type differentiation (Tenant/Landlord)
- 🎨 Modern, responsive UI design
- 📱 iOS-optimized experience
- 🔄 Real-time data updates

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **Payment**: Stripe React Native SDK
- **Maps**: React Native Maps
- **Storage**: AsyncStorage
- **State Management**: React Context
- **UI Components**: Custom component library

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (buttons, inputs, etc.)
│   ├── forms/           # Form-specific components
│   └── listings/        # Listing-related components
├── contexts/            # React Context providers
├── navigation/          # Navigation configuration
├── screens/             # Screen components
│   ├── auth/           # Authentication screens
│   └── main/           # Main app screens
├── services/            # API and external services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and mock data
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Stripe account (for payment processing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd offcampushousing
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up Stripe:
   - Create a Stripe account at https://stripe.com
   - Get your publishable key from the Stripe dashboard
   - Replace the placeholder in `App.tsx`:
   ```typescript
   const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_actual_stripe_key_here';
   ```

4. Start the development server:
```bash
npm start
# or
yarn start
```

5. Run on iOS Simulator:
```bash
npm run ios
# or
yarn ios
```

## Configuration

### Stripe Setup

1. **Development**: Use Stripe test keys for development
2. **Production**: Replace with live keys before deployment

### Backend Integration

The app currently uses mock data for development. To integrate with a real backend:

1. Update API endpoints in `src/services/PaymentService.ts`
2. Implement authentication API calls in `src/contexts/AuthContext.tsx`
3. Replace mock data in `src/utils/mockData.ts` with actual API calls

### Maps Configuration

The app uses React Native Maps. For iOS:
1. No additional setup required for basic functionality
2. For advanced features, configure API keys in `app.json`

## Key Components

### Authentication System
- User registration with type selection (Tenant/Landlord)
- Secure login/logout functionality
- Persistent authentication state

### Listing Management
- Create listings with photos and amenities
- Search and filter functionality
- Detailed listing views with maps

### Payment Integration
- Stripe payment sheet integration
- Secure payment processing for listing fees
- Payment confirmation and error handling

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Use consistent naming conventions

### Component Structure
- Keep components modular and reusable
- Use proper prop typing with TypeScript
- Implement loading and error states
- Follow accessibility guidelines

### State Management
- Use React Context for global state
- Keep local state minimal
- Implement proper data flow patterns

## Deployment

### iOS App Store

1. **Build for Production**:
```bash
expo build:ios
```

2. **Configure App Store Connect**:
   - Set up app metadata
   - Upload screenshots
   - Configure pricing and availability

3. **Submit for Review**:
   - Ensure compliance with App Store guidelines
   - Test thoroughly on physical devices
   - Submit for Apple review

### Backend Requirements

For production deployment, you'll need:
- User authentication API
- Listing management API
- Payment processing backend (Stripe webhooks)
- Image storage service
- Database for listings and users

## Testing

Run tests with:
```bash
npm test
# or
yarn test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ using React Native and Expo
