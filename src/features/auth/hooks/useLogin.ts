import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginWithEmailAndPassword } from '../api/login';
import { useAuthStore } from './useAuthStore';
import type { LoginCredentials } from '../types';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginWithEmailAndPassword(credentials),
    onSuccess: (data) => {
      // 🔥 AQUÍ ESTÁ LA CORRECCIÓN: Mapeamos exactamente como viene de Spring Boot
      setAuth({
        id: data.userId, 
        email: data.email,
        name: data.name, // Ahora guardamos también el nombre "Juan Carlos"
        userType: data.userType as any, 
        approvalStatus: data.approvalStatus,
      });

      // Redirección silenciosa y elegante al área privada
      navigate('/dashboard', { replace: true });
    },
    onError: (error: any) => {
      console.error('[Auth Error]:', error?.response?.data || error.message);
    },
  });
};