import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { ToastMessage } from '../components/ToastMessage';
import NetInfo from '@react-native-community/netinfo';
import i18n from '../translation/i18n';
import { AppState } from 'react-native';

let lastConnectionToastAt = 0;
const CONNECTION_TOAST_COOLDOWN_MS = 2000;

const showConnectionErrorToast = () => {
  if (AppState.currentState !== 'active') {
    return;
  }
  const now = Date.now();
  if (now - lastConnectionToastAt < CONNECTION_TOAST_COOLDOWN_MS) {
    return;
  }
  lastConnectionToastAt = now;
  ToastMessage(i18n.t('common.connectionError'));
};

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

    // Consider both explicit no-connectivity and unknown reachability as offline-safe.
    if (!state.isConnected || state.isInternetReachable === false) {
      showConnectionErrorToast();
      return Promise.reject(new Error(i18n.t('common.connectionError')));
    }
    // Get token directly from Zustand store
    const token = useAuthStore.getState().token;
    // console.log('Bearer ', token);    
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
    const isRequestCancelled =
      axios.isCancel(error) ||
      error?.code === 'ERR_CANCELED' ||
      error?.message === 'canceled';

    if (isRequestCancelled) {
      return Promise.reject(error);
    }

    const state = await NetInfo.fetch();
    const isOffline = !state.isConnected || state.isInternetReachable === false;
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error');

    if (isOffline || isNetworkError) {
      showConnectionErrorToast();
      // return Promise.reject(new Error(i18n.t('common.connectionError')));
    }

    if (error.response?.status === 401) {
      const { logout, token } = useAuthStore.getState();
      // console.log('token', token);
      if (token) {
        logout();
      } else {
        console.log('error?.response?.data?.detail', error?.response?.data?.detail);
        ToastMessage(error?.response?.data?.detail || i18n.t('toast.unauthorized'));
      }

      return Promise.reject(new Error('Unauthorized – Please login again'));
    }
    if(error.response?.status === 400) {
      ToastMessage(error?.response?.data?.detail);
      return Promise.reject(new Error('Bad Request'));
    }
    if(error.response?.status === 500) {
      ToastMessage(error?.response?.data?.detail);
      return Promise.reject(new Error('Bad Request'));
    }
    return Promise.reject(error);
  },
);

export default AxiosBase;
