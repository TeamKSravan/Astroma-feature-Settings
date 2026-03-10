import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_PREFS = 'USER_PREFS';
const TOKEN = 'TOKEN';
const IS_LOGGED_IN = 'IS_LOGGED_IN';
const FIRST_TIME = 'FIRST_TIME_LOGIN';

export const registeredEvents = {
  EDIT_PROFILE: 'EDIT_PROFILE',
};

export const saveData = async (key: string, data: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, data);
  } catch (error) {
    console.log('Error while saving data:', error);
  }
};

export const getData = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.log('Error while getting data:', e);
    return null;
  }
};

export const saveUserPrefs = async (data: object): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_PREFS, JSON.stringify(data));
  } catch (error) {
    console.log('Error while saving user prefs:', error);
  }
};

export const getUserPrefs = async (): Promise<object | null> => {
  try {
    const value = await AsyncStorage.getItem(USER_PREFS);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.log('Error while getting user prefs:', e);
    return null;
  }
};

export const removeUserPrefs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_PREFS);
  } catch (error) {
    console.log('Error while removing user prefs:', error);
  }
};

export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN, token);
  } catch (error) {
    console.log('Error while saving token:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(TOKEN);
    return value;
  } catch (e) {
    console.log('Error while getting token:', e);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN);
  } catch (error) {
    console.log('Error while removing token:', error);
  }
};

export const saveIsLoggedIn = async (flag: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(IS_LOGGED_IN, flag);
  } catch (error) {
    console.log('Error while saving login flag:', error);
  }
};

export const checkIsLoggedIn = async (): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(IS_LOGGED_IN);
    return value;
  } catch (e) {
    console.log('Error while checking login flag:', e);
    return null;
  }
};

export const clearAllPreferences = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.log('Error while clearing preferences:', error);
  }
};
