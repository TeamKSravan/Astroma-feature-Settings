import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AxiosBase from '../services/AxiosBase';
import { languageMap, useAuthStore } from './useAuthStore';


interface HomeState {
  getDashboardData: (userId: string) => Promise<any>;
  getNotificationList: () => Promise<any>;
  markAsRead: (notificationId: string) => Promise<any>;
}

export const useHomeStore = create<HomeState>()(
  persist(
    set => ({
      getDashboardData: async (userId: string) => {
        const { setLoading, currentLanguage } = useAuthStore.getState();
        setLoading(true);
        try {
          const response = await AxiosBase.post(`/astrology/dashboard${userId ? `?profile_id=${userId}` : ''}${currentLanguage !== 'en' ? `?language=${languageMap[currentLanguage]}` : ''}`);
          console.log('Response from getDashboardData', response);
          setLoading(false);
          return { success: true, overview: response.text, predictions: response.predictions };
        } catch (error: any) {
          setLoading(false);
          return { success: false, data: error.response?.data?.detail || 'Error fetching dashboard' };
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
      markAsRead: async (notificationId: string) => {
        const { setLoading, currentLanguage } = useAuthStore.getState();
        setLoading(true);
        try {
          const response = await AxiosBase.patch(`/notification/${notificationId}`);
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
