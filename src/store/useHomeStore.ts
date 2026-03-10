import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AxiosBase from '../services/AxiosBase';
import { languageMap, useAuthStore } from './useAuthStore';


interface HomeState {
  getDashboardData: (userId: string) => Promise<any>;
}

export const useHomeStore = create<HomeState>()(
  persist(
    set => ({
      getDashboardData: async (userId: string) => {
        const { setLoading, currentLanguage } = useAuthStore.getState();
        setLoading(true);
        try {
          const response = await AxiosBase.post(`/astrology/dashboard${userId ? `?profile_id=${userId}` : ''}${currentLanguage !== 'en' ? `?language=${languageMap[currentLanguage]}` : ''}`);
          setLoading(false);
          return { success: true, overview: response.text, predictions: response.predictions };
        } catch (error: any) {
          setLoading(false);
          return { success: false, data: error.response?.data?.detail || 'Error fetching dashboard' };
        }
      },
    }),
    {
      name: 'home-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ));
