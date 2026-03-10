import {
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  acknowledgePurchaseAndroid,
  requestPurchase,
  requestSubscription,
  fetchProducts,
  initConnection,
  endConnection,
  getAvailablePurchases,
  getSubscriptions,
  flushFailedPurchasesCachedAsPendingAndroid,
  ErrorCode,
  getProducts,
} from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import AxiosBase from './AxiosBase';
import { useWalletStore } from '../store/useWalletStore';
import moment from 'moment';
import { useAuthStore } from '../store/useAuthStore';
// adjust path
const productIds =
  Platform.select({
    ios: [
      'com.astroma.single.1',
      'com.astroma.pack.10',
      'com.astroma.monthly.100',
      'com.astroma.monthly.200',
      'com.astroma.monthly.50',
      'monthly_50',
      'monthly_100'
    ],
    android: [
      'com.astroma.single.1',
      'com.astroma.pack.10',
      'com.astroma.monthly.100',
      'com.astroma.monthly.200',
      'com.astroma.monthly.50',
      'monthly_50',
      // 'monthly_100'
    ],
  }) || [];

/** Only pass non-empty string SKUs to the IAP library (it throws on undefined). */
const validSkus = (ids: (string | undefined | null)[]): string[] =>
  ids.filter((id): id is string => typeof id === 'string' && id.length > 0);

let purchaseUpdateSubscription = null;
let purchaseErrorSubscription = null;
let isInitialized = false;
let hasShownModal = false;

export const initializeIAP = async () => {
  try {
    if (isInitialized) {
      console.log('IAP already initialized');
      return true;
    }

    console.log('Initializing IAP connection...');
    await initConnection();

    if (Platform.OS === 'android') {
      try {
        await flushFailedPurchasesCachedAsPendingAndroid();
        console.log('Flushed failed purchases on Android');
      } catch (error) {
        console.log('Error flushing failed purchases:', error);
      }
    }

    isInitialized = true;
    console.log('IAP initialized successfully');
    return true;
  } catch (error) {
    console.log('IAP initialization error:', error);
    isInitialized = false;
    throw new Error(`Failed to initialize IAP: ${error.message}`);
  }
};

// ============== BACKEND VERIFICATION ==============
const verifyPurchaseWithBackend = async purchase => {
  console.log('verifyPurchaseWithBackend : ', purchase);
  try {
    const purchaseData = {
      platform: Platform.OS,
      productId: purchase.productId,
      transactionId: purchase.transactionId,
      transactionReceipt: purchase.transactionReceipt,
      purchaseToken: purchase.purchaseToken,
      packageName: purchase.packageNameAndroid,
      dataAndroid: purchase.dataAndroid
        ? JSON.parse(purchase.dataAndroid)
        : null,
      signatureAndroid: purchase.signatureAndroid,
    };
    console.log('payload', purchaseData);

    // 1) Verify purchase with backend
    const res = await AxiosBase.post('/subscription/', {data: JSON.stringify(purchaseData)});

    if (!res?.success) {
      console.log('Backend verification failed:', res?.message);
      return false;
    }

    console.log('Purchase verified successfully by backend');

    // 2) Refresh wallet details (sequentially)
    await useWalletStore.getState().getWalletDetails({ silent: true });

    // 3) Fetch latest coins and update availableCoins (sequentially)
    try {
      const coinsResponse = await AxiosBase.get('/subscription/coins');
      console.log('Coins response:', coinsResponse);

      if (coinsResponse?.success && typeof coinsResponse?.result === 'number') {
        useWalletStore.getState().setAvailableCoins(coinsResponse.result);
      }
    } catch (coinsError) {
      console.error('Error fetching coins after purchase:', coinsError);
    }

    return true;
  } catch (error) {
    console.error('Backend verification error:', error?.response);
    console.warn('Backend verification failed, assuming valid for now');
    return true;
  }
};

export const resetModalFlag = () => {
  hasShownModal = false;
};

const handlePurchaseUpdate = async (purchase, onSuccess) => {
  console.log('handlepurchaderun purchase : ', purchase);
  try {
    if (purchase.transactionReceipt) {
      const isValid = await verifyPurchaseWithBackend(purchase);

      if (!isValid) {
        console.log('Purchase verification failed');
        useAuthStore.getState().setLoading(false);
        return false;
      }

      try {
        if (Platform.OS === 'ios') {
          await finishTransaction({ purchase });
          useAuthStore.getState().setLoading(false);
          console.log('iOS transaction finished');
        } else if (Platform.OS === 'android') {
          if (purchase.purchaseToken) {
            await acknowledgePurchaseAndroid({
              token: purchase.purchaseToken,
            });
            console.log('Android purchase acknowledged');
            useAuthStore.getState().setLoading(false);
          }
        }
      } catch (ackError) {
        useAuthStore.getState().setLoading(false);
        console.error('Error acknowledging purchase:', ackError);
      }

      // Extract plan details based on productId
      const productId = purchase.productId;
      let planName = 'Free Plan';
      let minutesAllowed = 0;

      if (productId.includes('apprentice')) {
        planName = 'Apprentice';
        minutesAllowed = 30;
      } else if (productId.includes('visionary')) {
        planName = 'Visionary';
        minutesAllowed = 120;
      } else if (productId.includes('legacy')) {
        planName = 'Legacy';
        minutesAllowed = 300;
      }
      // TODO: Save subscription info in store (Zustand)
      // Note: Redux store was removed, need to implement with Zustand if needed
      // store.dispatch(
      //   setSubscription({
      //     planId: productId,
      //     minutesAllowed,
      //     expiryDate: moment().add(1, 'month').toISOString(),
      //     transactionId: purchase.transactionId,
      //     receipt: purchase.transactionReceipt,
      //     planName,
      //     status: 'active',
      //   }),
      // );

      // Hide loader and show modal
      if (onSuccess) {
        if (!hasShownModal) {
          // TODO: Implement modal state management with Zustand if needed
          // store.dispatch(setSubActivatedModal(true));
          hasShownModal = true;
        }
        console.log('hasshownmodal', hasShownModal);
        onSuccess(purchase);
      }

      return true;
    }

    console.log('No transaction receipt found');
    return false;
  } catch (error) {
    console.error('Error handling purchase update:', error);
    useAuthStore.getState().setLoading(false);
    return false;
  }
};

const handlePurchaseUpdateNew = async (purchase, onSuccess) => {
  try {
    // console.log('Processing purchase update:', purchase);

    if (purchase.transactionReceipt) {
      const isValid = await verifyPurchaseWithBackend(purchase);

      if (!isValid) {
        console.log('Purchase verification failed');
        useAuthStore.getState().setLoading(false);
        return;
      }

      try {
        if (Platform.OS === 'ios') {
          await finishTransaction({ purchase });
          console.log('iOS transaction finished');
        } else if (Platform.OS === 'android') {
          if (purchase.purchaseToken) {
            await acknowledgePurchaseAndroid({
              token: purchase.purchaseToken,
            });
            console.log('Android purchase acknowledged');
          }
        }
      } catch (ackError) {
        console.error('Error acknowledging purchase:', ackError);
      }

      if (onSuccess) {
        onSuccess(purchase);
      }

      return true;
    }

    console.log('No transaction receipt found');
    return false;
  } catch (error) {
    console.error('Error handling purchase update:', error);
    // STOP loader in case of error
    useAuthStore.getState().setLoading(false);
    return false;
  }
};
// ============== CHECK PENDING PURCHASES ==============
export const checkPendingPurchases = async onSuccess => {
  try {
    console.log('Checking for pending purchases...');

    if (Platform.OS === 'android') {
      await flushFailedPurchasesCachedAsPendingAndroid();
    }

    const availablePurchases = await getAvailablePurchases();
    // console.log('Pending purchases found:', availablePurchases);

    if (availablePurchases && availablePurchases.length > 0) {
      for (const purchase of availablePurchases) {
        // console.log('Processing pending purchase:', purchase.productId);

        if (productIds.includes(purchase.productId)) {
          await handlePurchaseUpdateNew(purchase, onSuccess);
        }
      }

      return {
        success: true,
        message: `Processed ${availablePurchases.length} pending purchase(s)`,
        count: availablePurchases.length,
      };
    }

    console.log('No pending purchases found');
    return {
      success: true,
      message: 'No pending purchases',
      count: 0,
    };
  } catch (error) {
    console.error('Error checking pending purchases:', error);
    return {
      success: false,
      error: error.message,
      count: 0,
    };
  }
};

export const setupPurchaseListeners = onPurchaseSuccess => {
  try {
    console.log('Setting up purchase listeners...');

    purchaseUpdateSubscription = purchaseUpdatedListener(async purchase => {
      console.log('Purchase update received:', purchase);
      const res = await useWalletStore.getState().getPurchaseHistory(JSON.stringify(purchase));
      console.log('Response from getPurchaseHistory : ', res);
      if (res?.success) {
        useWalletStore.getState().setAvailableCoins(res?.coins);
      }
      await handlePurchaseUpdate(purchase, onPurchaseSuccess);
    });

    purchaseErrorSubscription = purchaseErrorListener(error => {
      useAuthStore.getState().setLoading(false);
      
      // Handle user cancellation gracefully (not an error)
      const errorCode = String(error.code || '');
      if (errorCode === ErrorCode.UserCancelled || errorCode === 'user-cancelled' || errorCode === 'E_USER_CANCELLED' || errorCode === 'E_USER_CANCELED') {
        console.log('User cancelled the purchase flow');
        return;
      }

      // Log other errors but don't show alerts
      console.error('Purchase error received:', error);
      console.log('Purchase error code:', error.code, 'message:', error.message);
    });

    console.log('Purchase listeners set up successfully');
  } catch (error) {
    useAuthStore.getState().setLoading(false);
    console.error('Error setting up purchase listeners:', error);
  }
};

export const removePurchaseListeners = () => {
  try {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }

    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }

    if (isInitialized) {
      endConnection();
      isInitialized = false;
    }

    console.log('Purchase listeners removed and connection ended');
  } catch (error) {
    console.error('Error removing purchase listeners:', error);
  }
};

export const getAvailableSubscriptions = async () => {
  try {
    if (!isInitialized) {
      await initializeIAP();
    }

    const skus = validSkus(productIds);
    if (skus.length === 0) {
      console.warn('[IAP] No valid product IDs for this platform');
      return [];
    }
    console.log('Fetching subscriptions for product IDs:', skus);
    const subscriptions = await getProducts({ skus });
    console.log('Available subscriptions:', subscriptions);

    if (!subscriptions || subscriptions.length === 0) {
      console.warn(
        'No subscriptions found. Check your product IDs and Play Console configuration.',
      );
    }

    return subscriptions;
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    // REMOVED ALERT - just log
    return [];
  }
};

export const purchaseProduct = async productId => {
  try {
    if (!isInitialized) {
      await initializeIAP();
    }

    console.log('Attempting to purchase:', productId);

    if (Platform.OS === 'android') {
      const products = await getProducts({ skus: [productId] });
      const product = products.find(
        (sub: any) => sub.productId === productId,
      );

      console.log('Product details:', product);

      if (!product) {
        throw new Error('Product not found');
      }
      
      const purchase = await requestPurchase({ skus: [productId] });
      console.log('Purchase initiated:', purchase);
      return purchase;
    } else {
      // v13 API: flat request for iOS subscription
      const purchase = await requestSubscription({ sku: productId });
      console.log('Purchase initiated:', purchase);
      return purchase;
    }
  } catch (error) {
    console.error('Purchase Product error:', error);

    // Handle user cancellation gracefully (not an error)
    const errorCode = String((error as any).code || '');
    if (errorCode === ErrorCode.UserCancelled || errorCode === 'user-cancelled' || errorCode === 'E_USER_CANCELLED' || errorCode === 'E_USER_CANCELED') {
      return null;
    }

    // Log other errors but don't show alerts
    console.error('Purchase error:', (error as any).code, (error as any).message);

    // Throw error for non-cancellation errors
    throw error;
  }
};

export const purchaseSubscription = async productId => {
  try {
    if (!isInitialized) {
      await initializeIAP();
    }

    console.log('Attempting to purchase:', productId);

    if (Platform.OS === 'android') {
      const subscriptions = await getSubscriptions({ skus: [productId] });
      const subscription = subscriptions.find(
        (sub: any) => sub.productId === productId,
      );

      console.log('Subscription details:', subscription);

      if (!subscription) {
        throw new Error('Subscription not found');
      }
      const offerDetails = (subscription as any).subscriptionOfferDetails;
      if (offerDetails && offerDetails.length > 0) {
        const offer = offerDetails[0];
        const offerToken = typeof offer?.offerToken === 'string' ? offer.offerToken : (offer as any)?.offerTokenAndroid;
        if (!offerToken) {
          throw new Error('No subscription offers available for this product');
        }
        console.log('Using subscription offer:', offer);

        // v13 API: flat request for Android (skus not required; subscriptionOffers used)
        const purchase = await requestSubscription({
          sku: productId,
          subscriptionOffers: [
            { sku: productId, offerToken },
          ],
        });

        console.log('Purchase initiated:', purchase);
        return purchase;
      } else {
        throw new Error('No subscription offers available for this product');
      }
    } else {
      // v13 API: flat request for iOS subscription
      const purchase = await requestSubscription({ sku: productId });
      console.log('Purchase initiated:', purchase);
      return purchase;
    }
  } catch (error) {
    console.error('Purchase subscription error:', error);

    // Handle user cancellation gracefully (not an error)
    const errorCode = String((error as any).code || '');
    if (errorCode === ErrorCode.UserCancelled || errorCode === 'user-cancelled' || errorCode === 'E_USER_CANCELLED' || errorCode === 'E_USER_CANCELED') {
      return null;
    }

    // Log other errors but don't show alerts
    console.error('Purchase error:', (error as any).code, (error as any).message);

    // Throw error for non-cancellation errors
    throw error;
  }
};

export const restorePurchases = async () => {
  try {
    console.log('Starting purchase restoration...');

    if (Platform.OS === 'android') {
      await flushFailedPurchasesCachedAsPendingAndroid();
    }

    const availablePurchases = await getAvailablePurchases();
    console.log('Available purchases to restore:', availablePurchases);

    if (availablePurchases && availablePurchases.length > 0) {
      const verifiedPurchases = [];
      for (const purchase of availablePurchases) {
        const isValid = await verifyPurchaseWithBackend(purchase);

        if (isValid) {
          verifiedPurchases.push(purchase);

          if (Platform.OS === 'android' && purchase.purchaseToken) {
            await acknowledgePurchaseAndroid({
              token: purchase.purchaseToken,
            });
          }
        }
      }

      if (verifiedPurchases.length > 0) {
        return {
          success: true,
          message: 'Purchases restored successfully',
          purchases: verifiedPurchases,
        };
      }
    }

    return {
      success: false,
      message: 'No purchases found to restore',
      purchases: [],
    };
  } catch (error) {
    console.error('Restore purchases error:', error);
    return {
      success: false,
      error: error.message,
      purchases: [],
    };
  }
};
