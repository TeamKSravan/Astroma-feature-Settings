import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AxiosBase from '../services/AxiosBase';
import moment from 'moment';
import { useAuthStore } from './useAuthStore';
import { ToastMessage } from '../components/ToastMessage';
import i18n from '../translation/i18n';

interface UserDetails {
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
}

interface UserBaseData {
    name: string;
    dob: Date;
    time: Date;
    place?: string;
    lat?: string;
    long?: string;
    gender?: string | null;
    timezone?: string;
}

interface IsPhoneNumberExistsData {
    phone: string;
    country_code: string;
}

interface ProfileState {
    isLoading?: boolean;
    error?: string | null;
    userdata?: UserDetails | null;
    selectedUser?: UserDetails | null;
    secondaryUserdata?: Array<UserDetails> | null;
    secondaryUserLimit?: number;
    setSecondaryUserLimit: (limit: number) => void;
    setSecondaryUserdata: (data: Array<UserDetails>) => void;
    setSelectedUser: (user: UserDetails) => void;
    getPrimaryUserDetail: () => Promise<{ success: boolean; data: any; message?: string }>;
    getTransactionHistory: () => Promise<{ success: boolean; data?: any; coins?: number }>;
    editPrimaryUserDetail: (data: UserDetails) => Promise<{ success: boolean; data?: any; message?: string }>;
    getUserDetail: (byID?: string, options?: { silent?: boolean }) => Promise<{ success: boolean; data: any; message?: string }>;
    addUserDetail: (data: UserBaseData) => Promise<{ success: boolean; data?: any; message?: string }>;
    editUserDetail: (data: UserDetails) => Promise<{ success: boolean; data?: any; message?: string }>;
    isPhoneNumberExists: (data: IsPhoneNumberExistsData) => Promise<{ success: boolean; is_phone_number_exists?: boolean; message?: string }>;
    deleteUser: (byID: string) => Promise<{ success: boolean; data?: any; message?: string }>;
}

function secondaryProfilesEqual(prev: unknown, next: unknown): boolean {
    if (prev === next) return true;
    if (prev == null && next == null) return true;
    if (prev == null || next == null) return false;
    if (!Array.isArray(prev) || !Array.isArray(next)) return false;
    if (prev.length !== next.length) return false;
    try {
        return JSON.stringify(prev) === JSON.stringify(next);
    } catch {
        return false;
    }
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            isLoading: false,
            error: null,
            userdata: null,
            secondaryUserdata: [],
            selectedUser: null,
            secondaryUserLimit: 10,
            setSecondaryUserLimit: (limit: number) => set({ secondaryUserLimit: limit }),
            setSecondaryUserdata: (data: Array<UserDetails>) => set({ secondaryUserdata: data }),
            setSelectedUser: (user: UserDetails) => set({ selectedUser: user }),
            getPrimaryUserDetail: async () => {
                const { setLoading } = useAuthStore.getState();
                setLoading(true);
                try {
                    const response = (await AxiosBase.get(`/user/user-details`)) as ApiBody;
                    console.log('Response from getUserProfile', response?.result);
                    const userData = response?.result ?? null;
                    setLoading(false);
                    return { success: true, data: userData };
                } catch (error: any) {
                    const errorMessage =
                        error.response?.data?.detail || 'Failed to get user profile';
                    setLoading(false);
                    return {
                        success: false,
                        message: errorMessage,
                        data: null,
                    };
                }
            },
            editPrimaryUserDetail: async (data: any) => {
                const { setLoading, userDetails, setUserDetails } = useAuthStore.getState();
                setLoading(true);
                try {
                    console.log('before api data : ', data);
                    const response = (await AxiosBase.patch(`/user/`, data)) as ApiBody;
                    const { result, message } = response;
                    console.log('Response from editUserProfile', result);
                    setUserDetails({
                        ...userDetails,
                        name: result.name,
                        phone: result.phone,
                        country_code: result.country_code,
                        dateOfBirth: result.date_of_birth,
                        timeOfBirth: result.time_of_birth,
                        place: result.place_of_birth,
                        gender: result.gender,
                        lat: result.lat,
                        long: result.long || undefined,
                    });
                    setLoading(false);
                    return { success: true, message: message, data: result };
                } catch (error: any) {
                    const errorMessage =
                        error.response?.data?.detail || 'Failed to edit user profile';
                    setLoading(false);
                    return {
                        success: false,
                        message: errorMessage,
                    };
                }
            },
            getUserDetail: async (byID?: string, options?: { silent?: boolean }) => {
                const silent = options?.silent === true;
                if (!silent) {
                    useAuthStore.getState().setLoading(true);
                }
                try {
                    const response = (await AxiosBase.get(byID ? `/user/profile/${byID}` : `/user/profile/`)) as ApiBody;
                    const userData = response?.result ?? null;
                    console.log('Response from getUserProfile', userData);
                    const prev = get().secondaryUserdata ?? null;
                    if (!secondaryProfilesEqual(prev, userData)) {
                        set({ secondaryUserdata: userData });
                    }
                    if (!silent) {
                        useAuthStore.getState().setLoading(false);
                    }
                    return { success: true, data: userData };
                } catch (error: any) {
                    const errorMessage =
                        error.response?.data?.detail || 'Failed to get user profile';
                    if (!silent) {
                        useAuthStore.getState().setLoading(false);
                    }
                    return {
                        success: false,
                        message: errorMessage,
                        data: null,
                    };
                }
            },
            addUserDetail: async (data: UserBaseData) => {
                const { setLoading } = useAuthStore.getState();
                setLoading(true);
                try {
                    // const payload = {
                    //     name: data.name.trim(),
                    //     date_of_birth: moment(data.dob).format('YYYY-MM-DD'),
                    //     time_of_birth: moment(data.time).format('HH:mm:ss'),
                    //     place_of_birth: data.place || '',
                    //     lat: data.lat || '',
                    //     long: data.long || '',
                    //     gender: data.gender || '',
                    //     timezone: data.timezone || '',
                    // };
                    console.log('addUserDetail payload => ', data);
                    const response = await AxiosBase.post(`/user/profile/`, data);
                    console.log('Response from addUserProfile', response);
                    const apiBody = (response as any)?.data ?? response;
                    const createdUser = apiBody?.result;
                    const rawId = createdUser?._id ?? createdUser?.id;
                    const selectedUserPayload = createdUser
                        ? {
                            ...createdUser,
                            _id: typeof rawId === 'string' ? { $oid: rawId } : (rawId && typeof rawId === 'object' && '$oid' in rawId ? rawId : { $oid: String(rawId) }),
                        }
                        : null;
                    setLoading(false);
                    set(state => ({
                        selectedUser: selectedUserPayload,
                        secondaryUserdata: [...(state.secondaryUserdata ?? []), selectedUserPayload],
                    }));
                    return { success: true, data: selectedUserPayload };
                } catch (error: any) {
                    const errorMessage =
                        error.response?.data?.detail || 'Failed to add user profile';
                    setLoading(false);
                    return {
                        success: false,
                        message: errorMessage,
                    };
                }
            },
            getTransactionHistory: async () => {
                const { setLoading } = useAuthStore.getState();
                setLoading(true);
                try {
                    const response = await AxiosBase.get(`/subscription/transaction-history`);
                    console.log('Response from getTransactionHistory', response);
                    setLoading(false);
                    return { success: true, data: response?.result, coins: response?.coins };
                } catch (error: any) {
                    const errorMessage =
                        error.response?.data?.detail || 'Failed to get transaction history';
                    setLoading(false);
                    return {
                        success: false,
                        message: errorMessage,
                        data: undefined,
                    };
                }
            },
            editUserDetail: async (data: UserDetails) => {
                const { setLoading } = useAuthStore.getState();
                setLoading(true);
                try {
                    const response = await AxiosBase.patch(`/user/profile/${data.id}`, data);
                    console.log('Response from editUserProfile', response);
                    setLoading(false);
                    return { success: true, message: response?.message };
                } catch (error: any) {
                    const errorMessage =
                        error.response?.data?.detail || 'Failed to edit user profile';
                    setLoading(false);
                    return {
                        success: false,
                        message: errorMessage,
                    };
                }
            },
            isPhoneNumberExists: async (data: IsPhoneNumberExistsData) => {
                const { setLoading } = useAuthStore.getState();
                setLoading(true);
                try {
                    const response = await AxiosBase.post(`/user/phone/duplicate`, data);
                    console.log('Response from isPhoneNumberExists', response);
                    setLoading(false);
                    return { success: true, is_phone_number_exists: response?.result, message: response?.message };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || 'Failed to check if phone number exists';
                    setLoading(false);
                    return { success: false, message: errorMessage };
                }
            },
            deleteUser: async (byID: string) => {
                const { setLoading } = useAuthStore.getState();
                setLoading(true);
                try {
                    const response = await AxiosBase.delete(`/user/profile/${byID}`);
                    console.log('Response from deleteUser', response);
                    ToastMessage(i18n.t('userProfile.deletedSuccess'));
                    setLoading(false);
                    return { success: true, data: response.data };
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || 'Failed to delete user';
                    setLoading(false);
                    return {
                        success: false,
                        message: errorMessage,
                    };
                }
            },
        }),
        {
            name: 'Profile-storage',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
