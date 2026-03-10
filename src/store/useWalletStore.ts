import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AxiosBase from '../services/AxiosBase';
import { useAuthStore } from './useAuthStore';

interface WalletState {
  coins: number;
  setCoins: (coins: number) => void;
  plans: any[];
  setPlans: (plans: any[]) => void;
  availableCoins: number;
  currentSubscription: any;
  setCurrentSubscription: (currentSubscription: any) => void;
  setAvailableCoins: (availableCoins: number) => void;
  getWalletDetails: (options?: { silent?: boolean }) => Promise<{ success: boolean; data: any; message?: string }>;
  getPlanDetails: () => Promise<{ success: boolean; data: any; message?: string }>;
  getPurchaseHistory: (signed_transaction_info: string) => Promise<{ success: boolean; data: any; message?: string; coins: number }>;
  myLastSubscription: () => Promise<{ success: boolean; data: any; message?: string }>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      coins: 0,
      setCoins: (coins: number) => set({ coins }),
      plans: [],
      setPlans: (plans: any[]) => set({ plans }),
      availableCoins: 0,
      currentSubscription: null,
      setCurrentSubscription: (currentSubscription: any) => set({ currentSubscription }),
      setAvailableCoins: (availableCoins: number) => set({ availableCoins }),
      getWalletDetails: async (options?: { silent?: boolean }) => {
        const silent = options?.silent === true;
        if (!silent) {
          useAuthStore.getState().setLoading(true);
        }
        try {
          const response = await AxiosBase.get(`/subscription/coins`);
          console.log('Response from getWalletDetails', response);
          if (!silent) {
            useAuthStore.getState().setLoading(false);
          }
          if (response?.result) {
            set({ availableCoins: response.result });
          }
          return { success: true, data: response?.result };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get wallet details';
          if (!silent) {
            useAuthStore.getState().setLoading(false);
          }
          return { success: false, data: errorMessage };
        }
      },
      getPlanDetails: async () => {
        useAuthStore.getState().setLoading(true);
        try {
          const response = await AxiosBase.get(`/subscription/plan`)
          console.log('Response from getPlanDetails', response);
          useAuthStore.getState().setLoading(false);
          const plans = response?.result?.map((item: any) => ({
            id: item._id?.$oid,
            label: item.name,
            specialOffer: item.is_special_offer,
            subscription: item.type === 'subscription',
            cost: item.price,
            coin: item.credits,
            productID: item.apple_product_id,
          }))
          set({ plans: plans });
          return { success: true, data: plans };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get plan details';
          useAuthStore.getState().setLoading(false);
          return { success: false, data: errorMessage };
        }
      },
      getPurchaseHistory: async (purchase: any) => {
        useAuthStore.getState().setLoading(true);
        console.log('signed_transaction_info : ', purchase);
        try {
          const response = (await AxiosBase.post(`/subscription/`, {
            data: purchase
          })) as ApiBody;
          console.log('Response from getPlanDetails', response);
          useAuthStore.getState().setLoading(false);
          return { success: true, data: response?.result, coins: response?.coins };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get purchase history';
          useAuthStore.getState().setLoading(false);
          return { success: false, data: errorMessage, coins: 0 };
        }
      },
      myLastSubscription: async () => {
        useAuthStore.getState().setLoading(true);
        try {
          const response = await AxiosBase.get(`/subscription/`);
          console.log('Response from mylastSubscription', response);
          useAuthStore.getState().setLoading(false);
          return { success: true, data: response?.result };
        }
        catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get my last subscription';
          useAuthStore.getState().setLoading(false);
          return { success: false, data: errorMessage };
        }
      },
    }),
    {
      name: 'Wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
