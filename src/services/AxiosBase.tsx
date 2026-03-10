import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { ToastMessage } from '../components/ToastMessage';
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

    const isNetworkError =
      !error.response &&
      (error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNABORTED' ||
        error.message === 'Network Error');

    if (isNetworkError) {
      ToastMessage(i18n.t('common.connectionError'));
      return Promise.reject(new Error(i18n.t('common.connectionError')));
    }

    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();

      logout();

      return Promise.reject(new Error('Unauthorized – Please login again'));
    }

    return Promise.reject(error);
  },
);

export default AxiosBase;
