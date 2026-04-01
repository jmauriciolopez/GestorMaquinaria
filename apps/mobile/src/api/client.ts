import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  const tenantId = (await AsyncStorage.getItem('tenantId')) ?? 'default';
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['x-tenant-id'] = tenantId;
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (error) => Promise.reject(error),
);

export default apiClient;
