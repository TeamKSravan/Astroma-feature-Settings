import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { ToastMessage } from '../components/ToastMessage';
import NetInfo from '@react-native-community/netinfo';
import i18n from '../translation/i18n';

const AxiosBase = axios.create({
  baseURL: 'https://api.astroma.ai/',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

AxiosBase.interceptors.request.use(
  async config => {
    const state = await NetInfo.fetch();

    if (!state.isInternetReachable) {
      ToastMessage(i18n.t('common.connectionError'));
      return Promise.reject(new Error('No Internet'));
    }
    // Get token directly from Zustand store
    const token = useAuthStore.getState().token;
    console.log('Bearer ', token);    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

AxiosBase.interceptors.response.use(
  response => response.data,

  async error => {
    console.log('API Error Response:', error.response);

    // const isNetworkError =
    //   !error.response &&
    //   (error.code === 'ERR_NETWORK' ||
    //     error.code === 'ECONNABORTED' ||
    //     error.message === 'Network Error');

    // if (isNetworkError) {
    //   ToastMessage(i18n.t('common.connectionError'));
    //   return Promise.reject(new Error(i18n.t('common.connectionError')));
    // }

    if (error.response?.status === 401 || error.response?.status === 403) {
      const { logout, token } = useAuthStore.getState();
      console.log('token', token);
      if (token) {
        logout();
      } else {
        console.log('error?.response?.data?.detail', error?.response?.data?.detail);
        ToastMessage(error?.response?.data?.detail || i18n.t('toast.unauthorized'));
      }

      return Promise.reject(new Error('Unauthorized – Please login again'));
    }
    if(error.response?.status === 500) {
      ToastMessage(error?.response?.data?.detail || i18n.t('toast.badRequest'));
      return Promise.reject(new Error('Bad Request'));
    }
    return Promise.reject(error);
  },
);

export default AxiosBase;
