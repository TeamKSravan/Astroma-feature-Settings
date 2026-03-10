import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AxiosBase from '../services/AxiosBase';
import { languageMap, useAuthStore } from './useAuthStore';
import { useWalletStore } from './useWalletStore';


export interface CompatibilityType {
  id: string;
  name: string;
}
interface CompatibilityState {
  compatibilityTypeList: CompatibilityType[];
  setCompatibilityTypeList: (data: CompatibilityType[]) => void;
  getCompatibilityTypeList: (isCompare?: boolean) => Promise<any>;
  createCompatibilityReport: (withReport: boolean, data: any, isCompare?: boolean) => Promise<any>;
  createcompareReport: (withReport: boolean, data: any) => Promise<any>;
  getRemainingReports: () => Promise<any>;
  getCompatibilityReportList: (isCompare?: boolean) => Promise<any>;
}

const { setAvailableCoins } = useWalletStore.getState();

export const useCompatibilityStore = create<CompatibilityState>()(
  persist(
    set => ({
      compatibilityTypeList: [],
      setCompatibilityTypeList: (data: CompatibilityType[]) => set({ compatibilityTypeList: data }),
      getCompatibilityTypeList: async (isCompare?: boolean) => {
        const { setLoading, currentLanguage } = useAuthStore.getState();
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/compatibility/${isCompare ? `?is_comparison=true` : ''}`);
          setLoading(false);
          console.log('response', response);
          return { success: true, data: response.result };
        } catch (error: any) {
          setLoading(false);
          return { success: false, data: error.response?.data?.detail || 'Error fetching compatibility' };
        }
      },
      createCompatibilityReport: async (withReport: boolean, data: any, isCompare?: boolean) => {
        const { setLoading } = useAuthStore.getState();
        setLoading(true);
        try {
          const response = await AxiosBase.post(`/compatibility/report?pdf_report=${withReport}`, {
            profile_id: data.profile_id,
            type: data.type,
            is_comparison: isCompare,
          });
          setLoading(false);
          console.log('createCompatibilityReport response', response);
          setAvailableCoins(response?.coins);
          return { success: true, data: response.result };
        } catch (error: any) {
          setLoading(false);
          return { success: false, data: error.response?.data?.detail || 'Error fetching compatibility' };
        }
      },
      getRemainingReports: async () => {
        const { setLoading, currentLanguage } = useAuthStore.getState();
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/report/remaining${currentLanguage !== 'en' ? `?language=${languageMap[currentLanguage]}` : ''}`);
          setLoading(false);
          console.log('remaining reports response', response);
          return { success: true, data: response.result };
        } catch (error: any) {
          setLoading(false);
          return { success: false, message: error.response?.data?.detail || 'Error fetching compatibility' };
        }
      },
      getCompatibilityReportList: async (isCompare?: boolean) => {
        const { setLoading, currentLanguage } = useAuthStore.getState();
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/compatibility/report${isCompare ? '?is_comparison=true' : ''}${currentLanguage !== 'en' ? `?language=${languageMap[currentLanguage]}` : ''}`);
          setLoading(false);
          console.log('response', response);
          return { success: true, data: response.result };
        } catch (error: any) {
          setLoading(false);
          return { success: false, message: error.response?.data?.detail || 'Error fetching compatibility' };
        }
      },
      createcompareReport: async (withReport: boolean, data: any) => {
        const { setLoading } = useAuthStore.getState();
        setLoading(true);
        try {
          console.log('data', data);
          console.log('withReport', withReport);
          console.log('url', `/compatibility/compare?with_report=${withReport}`);
          const response = await AxiosBase.post(`/compatibility/compare?with_report=${withReport}`, {
            profile_id: data.profile_id,
            type: data.type,
          });
          setLoading(false);
          console.log('response', response);
          setAvailableCoins(response?.coins);
          return { success: true, data: response.result };
        } catch (error: any) {
          setLoading(false);
          return { success: false, data: error.response?.data?.detail || 'Error fetching compatibility' };
        }
      },
    }),
    {
      name: 'compatibility-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ));
