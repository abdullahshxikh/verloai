import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
    CustomerInfo,
    PurchasesOffering,
    PurchasesOfferings,
    PurchasesPackage,
    LOG_LEVEL,
} from 'react-native-purchases';
import { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useAuth } from './AuthProvider';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';
const ENTITLEMENT_ID = 'Verlo ai Pro'; // Your entitlement identifier

interface RevenueCatContextType {
    customerInfo: CustomerInfo | null;
    offerings: PurchasesOfferings | null;
    isProMember: boolean;
    loading: boolean;
    purchasePackage: (pkg: PurchasesPackage) => Promise<{ customerInfo: CustomerInfo | null; error: any; userCancelled: boolean }>;
    restorePurchases: () => Promise<{ customerInfo: CustomerInfo | null; error: any }>;
    showPaywall: () => void;
    showCustomerCenter: () => void;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
    const [isProMember, setIsProMember] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initialize RevenueCat SDK
    useEffect(() => {
        const initializeRevenueCat = async () => {
            try {
                // Enable debug logs in development
                if (__DEV__) {
                    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
                }

                // Configure SDK
                Purchases.configure({
                    apiKey: REVENUECAT_API_KEY,
                    appUserID: user?.id, // Optional: Set user ID for cross-platform tracking
                });

                console.log('✅ RevenueCat initialized successfully');

                // Load initial customer info and offerings
                await Promise.all([
                    loadCustomerInfo(),
                    loadOfferings(),
                ]);
            } catch (error) {
                console.error('❌ RevenueCat initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeRevenueCat();
    }, [user?.id]);

    // Listen for customer info updates
    useEffect(() => {
        Purchases.addCustomerInfoUpdateListener((info) => {
            console.log('📱 Customer info updated:', info);
            setCustomerInfo(info);
            updateProStatus(info);
        });
        // Note: RevenueCat SDK manages listener cleanup automatically
    }, []);

    // Load customer info
    const loadCustomerInfo = async () => {
        try {
            const info = await Purchases.getCustomerInfo();
            setCustomerInfo(info);
            updateProStatus(info);
            console.log('📊 Customer info loaded:', info);
        } catch (error) {
            console.error('❌ Error loading customer info:', error);
        }
    };

    // Load offerings
    const loadOfferings = async () => {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings) {
                setOfferings(offerings);
                console.log('🎁 Offerings loaded:', offerings);
            } else {
                console.warn('⚠️ No offerings found');
            }
        } catch (error) {
            console.error('❌ Error loading offerings:', error);
        }
    };

    // Update pro membership status
    const updateProStatus = (info: CustomerInfo) => {
        const isPro = typeof info.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
        setIsProMember(isPro);
        console.log(`🔐 Pro status: ${isPro ? 'Active' : 'Inactive'}`);
    };

    // Purchase a package
    const purchasePackage = async (pkg: PurchasesPackage) => {
        try {
            console.log('🛒 Initiating purchase:', pkg.identifier);
            const { customerInfo } = await Purchases.purchasePackage(pkg);
            setCustomerInfo(customerInfo);
            updateProStatus(customerInfo);
            console.log('✅ Purchase successful');
            return { customerInfo, error: null, userCancelled: false };
        } catch (error: any) {
            console.error('❌ Purchase error:', error);

            // Handle user cancellation gracefully
            if (error.userCancelled) {
                console.log('ℹ️ User cancelled purchase');
                return { customerInfo: null, error: null, userCancelled: true };
            }

            return { customerInfo: null, error, userCancelled: false };
        }
    };

    // Restore purchases
    const restorePurchases = async () => {
        try {
            console.log('🔄 Restoring purchases...');
            const info = await Purchases.restorePurchases();
            setCustomerInfo(info);
            updateProStatus(info);
            console.log('✅ Purchases restored');
            return { customerInfo: info, error: null };
        } catch (error) {
            console.error('❌ Restore error:', error);
            return { customerInfo: null, error };
        }
    };

    // Show RevenueCat Paywall (requires react-native-purchases-ui)
    const showPaywall = async () => {
        try {
            const RevenueCatUI = (await import('react-native-purchases-ui')).default;

            const paywallResult = await RevenueCatUI.presentPaywall({
                offering: offerings?.current || undefined,
            });

            console.log('💳 Paywall result:', paywallResult);

            // Refresh customer info after paywall dismissal
            if (paywallResult !== PAYWALL_RESULT.CANCELLED) {
                await loadCustomerInfo();
            }
        } catch (error) {
            console.error('❌ Paywall error:', error);
        }
    };

    // Show Customer Center (requires react-native-purchases-ui)
    const showCustomerCenter = async () => {
        try {
            const RevenueCatUI = (await import('react-native-purchases-ui')).default;

            await RevenueCatUI.presentCustomerCenter();

            // Refresh customer info after customer center dismissal
            await loadCustomerInfo();
        } catch (error) {
            console.error('❌ Customer Center error:', error);
        }
    };

    return (
        <RevenueCatContext.Provider
            value={{
                customerInfo,
                offerings,
                isProMember,
                loading,
                purchasePackage,
                restorePurchases,
                showPaywall,
                showCustomerCenter,
            }}
        >
            {children}
        </RevenueCatContext.Provider>
    );
}

export function useRevenueCat() {
    const context = useContext(RevenueCatContext);
    if (context === undefined) {
        throw new Error('useRevenueCat must be used within a RevenueCatProvider');
    }
    return context;
}
