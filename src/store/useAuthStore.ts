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
  country_code?: string;
  email?: string;
  phone?: string;
}

interface LoginData {
  phone?: string;
  email?: string;
  country_code: string;
  otp: string;
}

interface VerifyOTPData {
  phone: string;
  country_code: string;
  otp: string;
}

interface SocialLoginData {
  id_token: string;
  provider: string;
}

interface CheckOnBoardingData {
  country_code?: string;
  phone?: string;
  email?: string;
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
  CheckOnBoarding: (data: CheckOnBoardingData) => Promise<{ success: boolean; message?: string; isOnboarded?: boolean }>;
  completeOnboarding: (
    data: any,
  ) => Promise<{ success: boolean; message?: string }>;
  sendOTP: (data: sendOTPData) => Promise<{ success: boolean; message?: string }>;
  login: (
    data: LoginData,
  ) => Promise<{ success: boolean; message?: string; isOnboarded?: boolean }>;
  getLoginUserDetails: () => Promise<{ success: boolean; message?: string }>;
  resendOTP: (phone: string) => Promise<{ success: boolean; message?: string }>;
  toVerifyPhoneNumber: (data: sendOTPData) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (data: VerifyOTPData) => Promise<{ success: boolean; message?: string }>;
  deleteAccount: () => Promise<{ success: boolean; message?: string }>;
  SocialLogin: (data: SocialLoginData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

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
      CheckOnBoarding: async (data: CheckOnBoardingData) => {
        const viaPhone = data.phone && data.phone?.trim().length > 0 ? true : false;
        const payload = viaPhone ? {
          country_code: data.country_code?.trim(),
          phone: data.phone?.trim(),
        } : {
          email: data.email?.trim(),
        };
        try {
          const response = await AxiosBase.post('/user/onboarding-status', payload);
          console.log('Response from CheckOnBoarding', response);
          return { success: true, isOnboarded: response?.result };
        } catch (error: any) {
          return { success: false, isOnboarded: false };
        }
      },
      getTimezone: async (lat: string, long: string) => {
        try {
          const apikey = 'AIzaSyB0FjlKAR4bnyS4M2Vs_BC-Rh-5ZW9bBGU';
          const response = await AxiosBase.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${long}&timestamp=1458000000&key=${apikey}`);
          console.log('Response from getTimezone', response);
          return { success: true, timezone: response?.result };
        } catch (error: any) {
          return { success: false, timezone: null };
        }
      },
      completeOnboarding: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          // const payload = {
          //   name: data.name.trim(),
          //   date_of_birth: moment(data.dob).format('YYYY-MM-DD'),
          //   time_of_birth: moment(data.time).format('HH:mm:ss'),
          //   place_of_birth: data.place || '',
          //   lat: data.lat || '',
          //   long: data.long || '',
          //   gender: data.gender || '',
          //   timezone: data.timezone || '',
          // };
          console.log('Onboarding payload', data);

          const response = await AxiosBase.post('/auth/onboard', data);
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

        const viaPhone = (data.phone?.trim().length ?? 0) > 0;

        var payload = viaPhone ? {
          country_code: data.country_code?.trim(),
          phone: data.phone?.trim(),
        } : {
          email: data.email?.trim(),
        };
        console.log('send otp : ', payload);

        set({ isLoading: true, error: null });
        try {
          const response = await AxiosBase.post(viaPhone ? '/auth/request-otp' : '/auth/request-email-otp', payload);
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
      toVerifyPhoneNumber: async (data: sendOTPData) => {
        console.log('send otp : ', data);

        set({ isLoading: true, error: null });
        try {
          const response = await AxiosBase.post('/auth/request-otp/phone', {
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
        const viaPhone = (data.phone?.trim().length ?? 0) > 0;
        set({ isLoading: true, error: null });
        const payload = viaPhone ? {
          phone: data.phone?.trim(),
          country_code: data.country_code?.trim(),
          otp: data.otp,
        } : {
          email: data.email?.trim(),
          otp: data.otp,
        };
        try {
          const response = await AxiosBase.post(viaPhone ? '/auth/login' : '/auth/login-email', payload);
          const { token, user } = response;
          console.log('user =>', user);
          set({
            token,
            userDetails: {
              id: user._id,
              _id: { $oid: user._id },
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
              timezone: user?.timezone,
              isPushNotificationEnabled: user?.is_push_notifications_enabled,
              zodiac_sign: user?.zodiac_sign,
            },
            isNotificationEnabled: user?.is_push_notifications_enabled ?? false,
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
      SocialLogin: async (data: SocialLoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AxiosBase.post('/auth/social-login', data);
          console.log('Response from SocialLogin', response);
          const { token, user } = response;
          console.log('user =>', user);
          set({
            token,
            userDetails: {
              id: user._id,
              _id: { $oid: user._id },
              is_onboarded: user?.is_onboarded,
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
              timezone: user?.timezone,
              isPushNotificationEnabled: user?.is_push_notifications_enabled,
              zodiac_sign: user?.zodiac_sign,
            },
            isAuthenticated: user?.is_enabled ?? false,
            isLoading: false,
          });
          return {
            success: true,
            isOnboarded: true,
          };
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Failed to login with social';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
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
      verifyOTP: async (data: VerifyOTPData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AxiosBase.post('/auth/verify-otp', {
            phone: data.phone.trim(),
            country_code: data.country_code.trim(),
            otp: data.otp,
          });
          console.log('Response from verifyOTP', response);
          set({ isLoading: false });
          return { success: true };
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Failed to verify OTP';
          set({ isLoading: false, error: errorMessage });
          return { success: false, message: errorMessage };
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
        try {
          const response = await AxiosBase.post('/auth/logout');
          console.log('Response from logout', response);
          useProfileStore.getState().setSecondaryUserdata([]);
          useProfileStore.getState().setSelectedUser(null as any);
          useWalletStore.getState().setAvailableCoins(0);
          useWalletStore.getState().setCurrentSubscription(null);
          set({
            token: null,
            userDetails: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return { success: true, message: 'Logged out successfully' };
        }
        catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Failed to logout';
          set({
            token: null,
            userDetails: null,
            isAuthenticated: false,
          });
          return {
            success: false,
            message: errorMessage,
          };
        }

      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        token: state.token,
        isGetBonus: state.isGetBonus,
        userDetails: state.userDetails,
        isAuthenticated: state.isAuthenticated,
        isNotificationEnabled: state.isNotificationEnabled,
        currentLanguage: state.currentLanguage,
        hasSeenWelcome: state.hasSeenWelcome,
      }),
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown> | undefined;
        if (!p || typeof p !== 'object') {
          return current;
        }
        return {
          ...current,
          ...(p.token !== undefined ? { token: p.token as string | null } : {}),
          ...(typeof p.isGetBonus === 'boolean' ? { isGetBonus: p.isGetBonus } : {}),
          ...(p.userDetails !== undefined
            ? { userDetails: p.userDetails as UserDetails | null }
            : {}),
          ...(typeof p.isAuthenticated === 'boolean'
            ? { isAuthenticated: p.isAuthenticated }
            : {}),
          ...(typeof p.isNotificationEnabled === 'boolean'
            ? { isNotificationEnabled: p.isNotificationEnabled }
            : {}),
          ...(typeof p.currentLanguage === 'string'
            ? { currentLanguage: p.currentLanguage }
            : {}),
          ...(typeof p.hasSeenWelcome === 'boolean'
            ? { hasSeenWelcome: p.hasSeenWelcome }
            : {}),
        };
      },
    },
  ),
);
