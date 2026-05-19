import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AxiosBase from '../services/AxiosBase';
import { languageMap, useAuthStore } from './useAuthStore';
import { Platform } from 'react-native';


interface HomeState {
  getDashboardData: (userId: string, options?: { silent?: boolean }) => Promise<any>;
  getNotificationList: () => Promise<any>;
  markAsRead: (notificationId?: string) => Promise<any>;
  saveFCMToken: (fcmToken: string, deviceType: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
}

export const useHomeStore = create<HomeState>()(
  persist(
    set => ({
      getDashboardData: async (userId: string, options?: { silent?: boolean }) => {
        const silent = options?.silent === true;
        const { setLoading, currentLanguage } = useAuthStore.getState();
        if (!silent) {
          setLoading(true);
        }
        try {
          const response = await AxiosBase.post(`/astrology/dashboard${userId ? `?profile_id=${userId}&` : '?'}${currentLanguage !== 'en' ? `language=${languageMap[currentLanguage]}` : ''}`);
          console.log('Response from getDashboardData', response);
          if (!silent) {
            setLoading(false);
          }
          return { success: true, overview: response.text, predictions: response.predictions };
        } catch (error: any) {
          if (!silent) {
            setLoading(false);
          }
          return { success: false, data: error.response?.data?.detail || 'Error fetching dashboard' };
        }
      },
      saveFCMToken: async (fcmToken: string, deviceType: string) => {
        try {
          const response = await AxiosBase.post(`/notification/register-device/`, { 
            device_token: fcmToken,
            platform: deviceType,
          });
          console.log('Response from saveFCMToken', response);
          return { success: true, message: response.message };
        } catch (error: any) {
          return { success: false, message: error.response?.data?.detail || 'Error saving FCM token' };
        }
      },
      getNotificationList: async () => {
        const { setLoading, currentLanguage } = useAuthStore.getState();
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/notification/`);
          console.log('Response from getNotificationList', response);
          setLoading(false);
          return { success: true, data: response.result };
        } catch (error: any) {
          console.log('Error from getNotificationList', error.response);
          setLoading(false);
          return { success: false, data: error.response?.data?.detail || 'Error fetching notification list' };
        }
      },
      markAsRead: async (notificationId?: string) => {
        const { setLoading, currentLanguage } = useAuthStore.getState();
        setLoading(true);
        try {
          const response = await AxiosBase.patch(`/notification/${notificationId ? notificationId : ''}`);
          console.log('Response from markAsRead', response);
          setLoading(false);
          return { success: true, data: response.data };
        } catch (error: any) {
          setLoading(false);
          return { success: false, data: error.response?.data?.detail || 'Error marking as read' };
        }
      },
    }),
    {
      name: 'home-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ));
