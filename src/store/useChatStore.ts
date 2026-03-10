import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AxiosBase from '../services/AxiosBase';
import { languageMap, useAuthStore } from './useAuthStore';

interface UserDetails {
  id?: string;
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  place?: string;
  lat?: string;
  long?: string;
  gender?: string;
  isOnboarded?: boolean;
}

interface ChatState {
  isLoading?: boolean;
  error?: string | null;
  messageHistory?: Array<any> | null;
  chatHistory?: Array<any> | null;
  categories?: Array<any> | null;
  getCategories: () => Promise<{ success: boolean; data?: string; message?: string }>;
  getQuestions: () => Promise<{ success: boolean; data?: string; message?: string }>;
  getChatMessageHistory: (chatHistoryId: string, userId: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  getChatHistory: (userId: string, searchQuery?: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  getChatHistoryById: (id: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  editConversation: (id: string, title: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  deleteAllChatHistory: (userId: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  deleteChatHistory: (id: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  setChatHistory: (data: Array<any>) => void;
  setMessageHistory: (data: Array<any>) => void;
  getReports: (category?: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  getRemainingReports: (userId: string) => Promise<any>;
  chatLike: (conversationId: string, messageId: string, userId?: string) => Promise<{ success: boolean; message?: string }>;
  chatDislike: (conversationId: string, messageId: string, userId?: string) => Promise<{ success: boolean; message?: string }>;
  getReportById: (id: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  getUserReports: (userId: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  addReport: (data: any) => Promise<{ success: boolean; data?: string; message?: string }>;
  AddUserReports: (reportID?: any, userId?: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  getViewReport: (reportID: any, combatReport?: boolean) => Promise<{ success: boolean; data?: string; message?: string }>;
  getGenerateReport: (reportID: any, isPdfReport?: boolean, userId?: string) => Promise<{ success: boolean; data?: string; message?: string }>;
  generateQuery: (reportID: any, data: any) => Promise<{ success: boolean; data?: string; message?: string }>;
}
const { setLoading, currentLanguage } = useAuthStore.getState();
export const useChatStore = create<ChatState>()(
  persist(
    set => ({
      isLoading: false,
      error: null,
      messageHistory: [],
      categories: [],
      chatHistory: [],
      setChatHistory: (data: Array<any>) => set({ chatHistory: data }),
      setMessageHistory: (data: Array<any>) => set({ messageHistory: data }),
      getCategories: async () => {
        // setLoading(true);
        try {
          const response = await AxiosBase.get(`/system-prompt/category`);
          console.log('Response from getCategories', response);
          setLoading(false);
          return { success: true, data: response.result };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get categories';
          setLoading(false);
          return { success: false, data: errorMessage };
        }
      },
      getQuestions: async () => {
        setLoading(true);
        try {
          const response = await AxiosBase.post(`/astrology/questions`);
          console.log('Response from getQuestions', response);
          setLoading(false);
          return { success: true, data: response.result };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get questions';
          setLoading(false);
          return { success: false, data: errorMessage };
        }
      },
      getChatMessageHistory: async (chatHistoryId: string, userId: string) => {
        // setLoading(true);
        try {
          const response = await AxiosBase.get(`/astrology/chat-history/${chatHistoryId}${userId ? `?profile_id=${userId}` : ''}`);
          console.log('Response from searchonChat', response);
          setLoading(false);
          set({ messageHistory: response.result || [] });
          return { success: true, data: response.result || [] };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get answer';
          // setLoading(false);
          return {
            success: false,
            message: errorMessage,
          };
        }
      },
      getChatHistory: async (userId: string, searchQuery?: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/conversation-list/${userId ? `?profile_id=${userId}` : ''}${searchQuery ? `&search_term=${searchQuery}` : ''}`);
          // const response = await AxiosBase.get(`/astrology/chat-history`);
          console.log('Response from getChatHistory', response);
          setLoading(false);
          return { success: true, data: response.result };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get chat history by id';
          setLoading(false);
          return {
            success: false,
            message: errorMessage,
          };
        }
      },
      getChatHistoryById: async (id: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/astrology/chat-history/${id}`);
          console.log('Response from getChatHistoryById', response);
          setLoading(false);
          return { success: true, data: response.data };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get chat history by id';
          setLoading(false);
          return {
            success: false,
            message: errorMessage,
          };
        }
      },
      editConversation: async (id: string, title: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.patch(`/conversation-list/${id}`, { title: title });
          console.log('Response from editConversation', response);
          setLoading(false);
          return { success: true, data: response.result, message: response.message };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to edit conversation';
          setLoading(false);
          return { success: false, data: errorMessage };
        }
      },
      deleteAllChatHistory: async (userId: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.delete(`/conversation-list/${userId ? `?profile_id=${userId}` : ''}`);
          console.log('Response from deleteChatHistory', response);
          setLoading(false);
          return { success: true, data: response.message };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to delete chat history';
          setLoading(false);
          return { success: false, data: errorMessage };
        }
      },
      deleteChatHistory: async (id: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.delete(`/conversation-list/${id}`);
          console.log('Response from deleteChatHistory', response);
          setLoading(false);
          return { success: true, data: response.message };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to delete chat history';
          setLoading(false);
          return { success: false, data: errorMessage };
        }
      },
      getReports: async (category?: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/report/${category ? `?category=${category}` : ''}`);
          console.log('Response from getReports', response);
          setLoading(false);
          return { success: true, data: response.result };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get reports';
          setLoading(false);
          return { success: false, data: errorMessage };
        }
      },
      getReportById: async (id: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/report/${id}`);
          console.log('Response from getReportById', response);
          setLoading(false);
          return { success: true, data: response.result };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get report by id';
          setLoading(false);
          return { success: false, data: errorMessage };
        }
      },
      chatLike: async (conversationId: string, messageId: string, userId?: string) => {
        setLoading(true);
        try {
          console.log('chat_id : ', messageId);
          console.log('conversation_id : ', conversationId);
          const response = await AxiosBase.patch(`/astrology/chat/like${userId ? `?profile_id=${userId}` : ''}`, { chat_id: messageId, conversation_id: conversationId });
          console.log('Response from chatLike', response);
          setLoading(false);
          return { success: true, message: response.message };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to chat like';
          setLoading(false);
          return { success: false, message: errorMessage };
        }
      },
      chatDislike: async (conversationId: string, messageId: string, userId?: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.patch(`/astrology/chat/dislike${userId ? `?profile_id=${userId}` : ''}`, { chat_id: messageId, conversation_id: conversationId });
          console.log('Response from chatDislike', response);
          setLoading(false);
          return { success: true, message: response.message };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to chat dislike';
          setLoading(false);
          return { success: false, message: errorMessage };
        }
      },
      addReport: async (data: any) => {
        setLoading(true);
        try {
          const response = await AxiosBase.post(`/report`, data);
          console.log('Response from addReport', response);
          setLoading(false);
          return { success: true, data: response.data };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to add report';
          setLoading(false);
          return { success: false, data: errorMessage };
        }
      },
      AddUserReports: async (reportID?: any, userId?: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.post(`/report/user/${reportID}${userId ? `?profile_id=${userId}` : ''}`);
          console.log('Response from AddUserReports', response);
          setLoading(false);
          return { success: true, message: response.message };
        } catch (error: any) {
          const errorMessage =
            error.response?.message || 'Failed to add user reports';
          setLoading(false);
          console.log('Error from AddUserReports', error.response);
          return { success: false, message: errorMessage };
        }
      },
      getUserReports: async (userId: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/report/user${userId ? `?profile_id=${userId}` : ''}`);
          console.log('Response from getUserReports', response);
          setLoading(false);
          return { success: true, data: response.result };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get user reports';
          setLoading(false);
          return { success: false, message: errorMessage };
        }
      },
      generateQuery: async (reportID: any, data: any) => {
        setLoading(true);
        try {
          console.log('data : ', data);
          console.log('reportID : ', reportID);
          const response = await AxiosBase.post(`/compatibility/report/${reportID}/chat${currentLanguage !== 'en' ? `?language=${languageMap[currentLanguage]}` : ''}`, data);
          console.log('Response from generateQuery', response);
          setLoading(false);
          return { success: true, data: response.result };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to generate query';
          setLoading(false);
          return { success: false, message: errorMessage };
        }
      },
      getRemainingReports: async (userId: string) => {
        const { setLoading, currentLanguage } = useAuthStore.getState();
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/report/remaining${userId ? `?profile_id=${userId}` : ''}`);
          setLoading(false);
          console.log('remaining reports response', response);
          return { success: true, data: response.result };
        } catch (error: any) {
          setLoading(false);
          return { success: false, message: error.response?.data?.detail || 'Error fetching compatibility' };
        }
      },
      getViewReport: async (reportID: any, combatReport: boolean = false) => {
        setLoading(true);
        try {
          const response = await AxiosBase.get(`/compatibility/report/${reportID}/chat`);
          console.log('Response from getViewReport', response);
          setLoading(false);
          return { success: true, data: response.result };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to get view report';
          setLoading(false);
          return { success: false, message: errorMessage };
        }
      },
      getGenerateReport: async (reportID: any, isPdfReport: boolean = false, userId?: string) => {
        setLoading(true);
        try {
          const response = await AxiosBase.post(`/astrology/report/${reportID}?pdf_report=${isPdfReport}${userId ? `&profile_id=${userId}` : ''}${currentLanguage !== 'en' ? `?language=${languageMap[currentLanguage]}` : ''}`);
          console.log('Response from getGenerateReport', response);
          setLoading(false);
          return { success: true, data: response.result };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to generate report';
          setLoading(false);
          return { success: false, message: errorMessage };
        }
      },

    }),
    {
      name: 'Chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
