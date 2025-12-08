import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const TOKEN_KEY = '@taskflow_auth_token';
const USER_KEY = '@taskflow_user_data';
const ENCRYPTION_KEY = '@taskflow_enc_key';

// Get or generate a unique encryption key for this device
const getEncryptionKey = async (): Promise<string> => {
  let key = await AsyncStorage.getItem(ENCRYPTION_KEY);
  if (!key) {
    // Generate a random key on first use
    key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${Date.now()}-${Math.random()}-taskflow`
    );
    await AsyncStorage.setItem(ENCRYPTION_KEY, key);
  }
  return key;
};

// Simple XOR-based obfuscation with hex encoding
const encodeData = async (data: string): Promise<string> => {
  const key = await getEncryptionKey();
  const encoded: string[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const dataCode = data.codePointAt(i) ?? 0;
    const keyCode = key.codePointAt(i % key.length) ?? 0;
    const xored = dataCode ^ keyCode;
    // Convert to hex for safe storage
    encoded.push(xored.toString(16).padStart(4, '0'));
  }
  
  return encoded.join('');
};

// Decode hex-encoded XOR data
const decodeData = async (encodedData: string): Promise<string> => {
  const key = await getEncryptionKey();
  let result = '';
  
  // Split into 4-character hex chunks
  const chunks = encodedData.match(/.{4}/g) || [];
  
  for (let i = 0; i < chunks.length; i++) {
    const xored = Number.parseInt(chunks[i], 16);
    const keyCode = key.codePointAt(i % key.length) ?? 0;
    const originalCode = xored ^ keyCode;
    result += String.fromCodePoint(originalCode);
  }
  
  return result;
};

export const saveToken = async (token: string): Promise<void> => {
  try {
    const encodedToken = await encodeData(token);
    await AsyncStorage.setItem(TOKEN_KEY, encodedToken);
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const encodedToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (!encodedToken) return null;
    return await decodeData(encodedToken);
  } catch (error) {
    console.error('Error getting token:', error);
    // Clear corrupted data
    await AsyncStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export const deleteToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error deleting token:', error);
  }
};

export const saveUserData = async (userData: object): Promise<void> => {
  try {
    const jsonData = JSON.stringify(userData);
    const encodedData = await encodeData(jsonData);
    await AsyncStorage.setItem(USER_KEY, encodedData);
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const getUserData = async (): Promise<object | null> => {
  try {
    const encodedData = await AsyncStorage.getItem(USER_KEY);
    if (!encodedData) return null;
    const jsonData = await decodeData(encodedData);
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error getting user data:', error);
    // Clear corrupted data
    await AsyncStorage.removeItem(USER_KEY);
    return null;
  }
};

export const deleteUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error deleting user data:', error);
  }
};

export const clearAllAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};