import { apiClient } from '@/lib/axios';
import type { LoginCredentials, AuthResponse } from '../types';

interface LoginApiResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
}

export const loginWithEmailAndPassword = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // 🔥 AQUÍ ESTABA EL ERROR: Ahora mapeamos correctamente a "password"
  const response = await apiClient.post<LoginApiResponse>('/auth/login', {
    email: credentials.email,
    password: credentials.password // Antes decía credentials.passwordHash
  });
  
  return response.data.data;
};