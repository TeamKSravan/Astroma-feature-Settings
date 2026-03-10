import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfileStore } from './useProfileStore';
import AxiosBase from '../services/AxiosBase';
import moment from 'moment';
import { useWalletStore } from './useWalletStore';

export const languageMap: Record<string, string> = {
  en: 'english',
  hi: 'hindi',
};

export interface UserDetails {
  id?: string;
  name?: string;
  phone?: string;
  country_code?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  place?: string;
  lat?: string;
  long?: string;
  gender?: string;
  isOnboarded?: boolean;
  zodiac_sign?: string;
}

interface SignupData {
  name: string;
  dob: Date;
  time: Date;
  place?: string;
  lat?: string;
  long?: string;
  gender?: string | null;
  timezone?: string;
}

interface sendOTPData {
  country_code: string;
  phone: string;
}

interface LoginData {
  phone: string;
  country_code: string;
  otp: string;
}

interface AuthState {
  token: string | null;
  isGetBonus: boolean;
  setIsGetBonus: (value: boolean) => void;
  userDetails: UserDetails | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNotificationEnabled: boolean;
  setIsNotificationEnabled: (value: boolean) => void;
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  setLoading: (isLoading: boolean) => void;
  error: string | null;
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (value: boolean) => void;
  setToken: (token: string) => void;
  setUserDetails: (details: UserDetails) => void;
  clearAuth: () => void;
  updateUserDetails: (details: Partial<UserDetails>) => void;
  completeOnboarding: (
    data: SignupData,
  ) => Promise<{ success: boolean; message?: string }>;
  sendOTP: (data: sendOTPData) => Promise<{ success: boolean; message?: string }>;
  login: (
    data: LoginData,
  ) => Promise<{ success: boolean; message?: string; isOnboarded?: boolean }>;
  getLoginUserDetails: () => Promise<{ success: boolean; message?: string }>;
  resendOTP: (phone: string) => Promise<{ success: boolean; message?: string }>;
  deleteAccount: () => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const { setSecondaryUserdata, setSelectedUser } = useProfileStore.getState();
const { setAvailableCoins } = useWalletStore.getState();

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      isGetBonus: false,
      setIsGetBonus: (value: boolean) => set({ isGetBonus: value }),
      userDetails: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasSeenWelcome: false,
      setLoading: (isLoading: boolean) => set({ isLoading }),
      isNotificationEnabled: false,
      setIsNotificationEnabled: (value: boolean) => set({ isNotificationEnabled: value }),
      currentLanguage: 'en',
      setCurrentLanguage: (language: string) => set({ currentLanguage: language }),
      setHasSeenWelcome: (value: boolean) => set({ hasSeenWelcome: value }),

      setToken: (token: string) => set({ token, isAuthenticated: true }),

      setUserDetails: (details: UserDetails) => set({ userDetails: details }),

      clearAuth: () =>
        set({ token: null, userDetails: null, isAuthenticated: false }),

      updateUserDetails: (details: Partial<UserDetails>) =>
        set(state => ({
          userDetails: { ...state.userDetails, ...details } as UserDetails,
        })),

      completeOnboarding: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          const payload = {
            name: data.name.trim(),
            date_of_birth: moment(data.dob).format('YYYY-MM-DD'),
            time_of_birth: moment(data.time).format('HH:mm:ss'),
            place_of_birth: data.place || '',
            lat: data.lat || '',
            long: data.long || '',
            gender: data.gender || '',
            timezone: data.timezone || '',
          };
          console.log('Onboarding payload', payload);

          const response = await AxiosBase.post('/auth/onboard', payload);
          console.log('Response from onboarding', response);
          set(state => ({
            userDetails: {
              ...state.userDetails,
              name: data.name,
              dateOfBirth: moment(data.dob).format('YYYY-MM-DD'),
              timeOfBirth: moment(data.time).format('HH:mm:ss'),
              place: data.place,
              lat: data.lat,
              long: data.long,
              gender: data.gender || undefined,
              timezone: data.timezone || '',
              isOnboarded: true,
            } as UserDetails,
            isLoading: false,
          }));

          return { success: true };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Onboarding failed';
          set({ isLoading: false, error: errorMessage });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      sendOTP: async (data: sendOTPData) => {
        console.log('send otp : ', data);

        set({ isLoading: true, error: null });
        try {
          const response = await AxiosBase.post('/auth/request-otp', {
            country_code: data.country_code.trim(),
            phone: data.phone.trim(),
          });
          console.log('Response from sendOTP', response);
          set({ isLoading: false });
          return { success: true };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to send OTP';
          set({ isLoading: false, error: errorMessage });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AxiosBase.post('/auth/login', {
            phone: data.phone.trim(),
            country_code: data.country_code.trim(),
            otp: data.otp,
          });
          const { token, user } = response;

          set({
            token,
            userDetails: {
              id: user._id,
              name: user?.name,
              phone: user.phone,
              country_code: user?.country_code,
              dateOfBirth: user?.date_of_birth,
              timeOfBirth: user?.time_of_birth,
              place: user?.place,
              lat: user?.lat,
              long: user?.long,
              gender: user?.gender,
              isOnboarded: user?.is_onboarded,
              zodiac_sign: user?.zodiac_sign,
            },
            isAuthenticated: true,
            isLoading: false,
          });

          return {
            success: true,
            isOnboarded: user.is_onboarded,
          };
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Invalid OTP';
          set({ isLoading: false, error: errorMessage });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      getLoginUserDetails: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await AxiosBase.get('/user/user-details');
          console.log('Response from getLoginUserDetails', response);
          // set({ userDetails: response.result });
          set({ isLoading: false });
          return { success: true };
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Failed to get login user details';
          set({ isLoading: false, error: errorMessage });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },     

      resendOTP: async (phone: string) => {
        set({ isLoading: true, error: null });
        try {
          await AxiosBase.post('/auth/resend-otp', {
            phone: phone.trim(),
          });
          set({ isLoading: false });
          return { success: true };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to resend OTP';
          set({ isLoading: false, error: errorMessage });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },
      deleteAccount: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await AxiosBase.delete('/user/');
          console.log('Response from deleteAccount', response);
          set({ isLoading: false });
          return { success: true, message: 'Account deleted successfully' };
        }
        catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Failed to delete account';
          set({ isLoading: false, error: errorMessage });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      logout: async () => {
        setSecondaryUserdata([]);
        setSelectedUser(null as any);
        setAvailableCoins(0);
        set({
          token: null,
          userDetails: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
