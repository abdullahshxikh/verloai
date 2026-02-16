# RevenueCat Integration Guide for Verlo AI

## Overview
This document provides a complete guide to the RevenueCat SDK integration in the Verlo AI app, including setup, usage, and best practices.

## Installation

The following packages have been installed:
```bash
npm install --save react-native-purchases react-native-purchases-ui
```

## Configuration

### 1. Environment Variables
Add your RevenueCat API key to `.env.local`:
```
EXPO_PUBLIC_REVENUECAT_API_KEY=test_NqidyBvteZZVGYlsqhIgRcuuEod
```

### 2. Provider Setup
The `RevenueCatProvider` has been added to the app's provider hierarchy in `app/_layout.tsx`:

```typescript
<AuthProvider>
  <TracksProvider>
    <OnboardingProvider>
      <ProgressProvider>
        <RevenueCatProvider>
          <AppGate />
        </RevenueCatProvider>
      </ProgressProvider>
    </OnboardingProvider>
  </TracksProvider>
</AuthProvider>
```

## Core Features

### 1. RevenueCat Provider (`lib/RevenueCatProvider.tsx`)

The provider manages all subscription-related functionality:

#### Available Hooks
```typescript
const {
  customerInfo,        // Current customer info from RevenueCat
  offerings,           // Available subscription offerings
  isProMember,         // Boolean: true if user has active "Verlo ai Pro" entitlement
  loading,             // Boolean: true while initializing
  purchasePackage,     // Function to purchase a package
  restorePurchases,    // Function to restore previous purchases
  showPaywall,         // Function to show RevenueCat's native paywall UI
  showCustomerCenter,  // Function to show RevenueCat's Customer Center
} = useRevenueCat();
```

#### Key Functions

**Purchase a Package:**
```typescript
const handlePurchase = async () => {
  const pkg = offerings?.current?.availablePackages?.find(p => p.identifier === 'monthly');
  if (pkg) {
    const { customerInfo, error, userCancelled } = await purchasePackage(pkg);
    
    if (userCancelled) {
      // User cancelled, do nothing
      return;
    }
    
    if (error) {
      // Handle error
      Alert.alert('Purchase Failed', error.message);
    } else if (customerInfo?.entitlements.active["Verlo ai Pro"]) {
      // Unlock that great "pro" content
      Alert.alert('Success!', 'Welcome to Pro!');
    }
  }
};
```

**Restore Purchases:**
```typescript
const handleRestore = async () => {
  const { customerInfo, error } = await restorePurchases();
  if (error) {
    Alert.alert('No purchases found');
  } else {
    Alert.alert('Purchases restored!');
  }
};
```

**Show Native Paywall:**
```typescript
const handleShowPaywall = async () => {
  await showPaywall();
  // Paywall will automatically handle purchases
  // Check isProMember after dismissal
};
```

**Show Customer Center:**
```typescript
const handleManageSubscription = async () => {
  await showCustomerCenter();
  // Customer can manage their subscription, cancel, etc.
};
```

### 2. Entitlement Checking

The entitlement ID is configured as **"Verlo ai Pro"** in `lib/RevenueCatProvider.tsx`.

Check if user has Pro access:
```typescript
const { isProMember } = useRevenueCat();

if (isProMember) {
  // User has active Pro subscription
  // Grant access to premium features
} else {
  // User is on free plan
  // Show upgrade prompts
}
```

### 3. Product Configuration

Configure these products in your RevenueCat dashboard:

| Product ID | Type | Description |
|------------|------|-------------|
| `monthly` | Subscription | Monthly subscription |
| `yearly` | Subscription | Annual subscription (best value) |
| `lifetime` | Non-consumable | One-time lifetime purchase |

### 4. Paywall Screen (`app/paywall.tsx`)

The paywall screen has been completely revamped with RevenueCat integration:

**Features:**
- Displays available subscription packages from RevenueCat
- Shows pricing and trial information
- Supports both native paywall UI and custom UI
- Handles purchase flow and errors
- Restore purchases functionality
- Free tier option

**Usage:**
```typescript
// Navigate to paywall
router.push('/paywall');

// After successful purchase, user is redirected to main app
```

### 5. Profile Screen Integration (`app/(tabs)/profile.tsx`)

The profile screen now shows subscription status:

**Features:**
- Displays "Pro" or "Free" badge based on subscription status
- Pro members can tap to open Customer Center
- Free users can tap to upgrade
- Visual indicators (Crown icon for Pro members)

## Best Practices

### 1. Error Handling

Always handle errors gracefully:
```typescript
const { customerInfo, error } = await purchasePackage(pkg);

if (error) {
  if (error.userCancelled) {
    // User cancelled - don't show error
    return;
  }
  // Show user-friendly error message
  Alert.alert('Purchase Failed', error.message);
}
```

### 2. Customer Info Updates

The provider automatically listens for customer info updates:
```typescript
// This happens automatically in RevenueCatProvider
Purchases.addCustomerInfoUpdateListener((info) => {
  setCustomerInfo(info);
  updateProStatus(info);
});
```

### 3. User Identification

The SDK is configured to use the authenticated user's ID:
```typescript
Purchases.configure({
  apiKey: REVENUECAT_API_KEY,
  appUserID: user?.id, // Links purchases to your user
});
```

### 4. Testing

**Test Mode:**
- The API key provided (`test_NqidyBvteZZVGYlsqhIgRcuuEod`) is a test key
- Use sandbox accounts for testing purchases
- Enable debug logs in development:
  ```typescript
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  ```

### 5. Production Checklist

Before going to production:
1. ✅ Replace test API key with production key
2. ✅ Configure products in RevenueCat dashboard
3. ✅ Set up App Store Connect / Google Play Console
4. ✅ Test purchase flow end-to-end
5. ✅ Test restore purchases
6. ✅ Verify entitlement checking
7. ✅ Test subscription cancellation
8. ✅ Configure webhooks (optional)

## RevenueCat Dashboard Setup

### 1. Create Products

In your RevenueCat dashboard:
1. Go to **Products** → **Add Product**
2. Create products matching your Product IDs:
   - Monthly subscription
   - Yearly subscription
   - Lifetime purchase

### 2. Create Offering

1. Go to **Offerings** → **Create Offering**
2. Add your products to the offering
3. Mark one as "current" offering
4. Configure package identifiers to match your code

### 3. Create Entitlement

1. Go to **Entitlements** → **Create Entitlement**
2. Name it exactly: **"Verlo ai Pro"**
3. Attach your subscription products to this entitlement

### 4. Configure App

1. Go to **Apps** → **Add App**
2. Add your iOS/Android app
3. Configure bundle IDs
4. Add your API keys (separate for iOS/Android if needed)

## Advanced Features

### 1. Introductory Pricing

Products can have intro prices (free trials):
```typescript
const pkg = offerings?.current?.availablePackages?.[0];
if (pkg?.product.introPrice) {
  console.log('Trial:', pkg.product.introPrice.priceString);
  console.log('Period:', pkg.product.introPrice.period);
}
```

### 2. Promotional Offers

Check for promotional offers:
```typescript
if (pkg?.product.discounts) {
  // Handle promotional pricing
}
```

### 3. Customer Attributes

Set custom attributes:
```typescript
await Purchases.setAttributes({
  'user_level': '5',
  'preferred_track': 'social',
});
```

### 4. Webhooks

Configure webhooks in RevenueCat dashboard to:
- Sync subscription status to your backend
- Handle subscription events
- Update user records

## Troubleshooting

### Issue: Offerings not loading
**Solution:** Check that:
- API key is correct
- Products are configured in RevenueCat dashboard
- Current offering is set
- Network connection is available

### Issue: Purchases not working
**Solution:** Verify:
- App Store Connect / Google Play Console setup
- Sandbox test accounts configured
- Product IDs match exactly
- Bundle IDs match

### Issue: Entitlements not updating
**Solution:**
- Check entitlement ID matches exactly ("Verlo ai Pro")
- Verify products are attached to entitlement
- Call `await Purchases.getCustomerInfo()` to refresh

## Support

- **RevenueCat Docs:** https://www.revenuecat.com/docs
- **React Native SDK:** https://www.revenuecat.com/docs/getting-started/installation/reactnative
- **Paywalls:** https://www.revenuecat.com/docs/tools/paywalls
- **Customer Center:** https://www.revenuecat.com/docs/tools/customer-center

## Summary

The RevenueCat integration is now complete with:
- ✅ SDK installed and configured
- ✅ Provider managing subscription state
- ✅ Entitlement checking for "Verlo ai Pro"
- ✅ Native paywall UI support
- ✅ Customer Center for subscription management
- ✅ Product configuration (monthly, yearly, lifetime)
- ✅ Purchase and restore functionality
- ✅ Error handling and best practices
- ✅ Profile screen integration
- ✅ Paywall screen with RevenueCat offerings

You can now test the integration and configure your products in the RevenueCat dashboard!
