import { apiClient } from '@/lib/axios';
import type { RegisterCredentials, AuthResponse } from '../types';

interface RegisterApiResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
}

export const registerUser = async (credentials: RegisterCredentials): Promise<RegisterApiResponse> => {
  const response = await apiClient.post<RegisterApiResponse>('/auth/register', credentials);
  return response.data;
};