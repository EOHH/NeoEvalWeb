import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/register';
import { useAuthStore } from './useAuthStore';
import type { RegisterCredentials } from '../types';

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => {
      // 🔥 NIVEL PRODUCCIÓN: Sanitación del Payload
      // Evitamos enviar campos basura que puedan romper el tipado estricto de Spring Boot
      const cleanPayload: RegisterCredentials = {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        userType: credentials.userType,
      };

      // Solo adjuntamos los campos que le importan al Backend según el rol
      if (credentials.userType === 'TEACHER') {
        cleanPayload.department = credentials.department;
        cleanPayload.expertiseArea = credentials.expertiseArea;
      } else if (credentials.userType === 'STUDENT') {
        cleanPayload.birthDate = credentials.birthDate;
        cleanPayload.educationalLevel = credentials.educationalLevel;
      } else if (credentials.userType === 'PARENT') {
        cleanPayload.relationship = credentials.relationship;
        // Nos aseguramos de que el ID vaya como Number o lo ignoramos
        cleanPayload.studentId = credentials.studentId ? Number(credentials.studentId) : undefined;
      }

      return registerUser(cleanPayload);
    },
    onSuccess: (response) => {
      // Si el backend (AuthService) nos dice que la cuenta necesita aprobación
      if (response.data.approvalStatus === 'PENDING') {
        // Redirigimos al Login pasando un parámetro en la URL
        navigate('/login?status=pending', { replace: true });
        return;
      }

      // Si se aprueba automáticamente (ej. Student), lo logueamos guardándolo en Zustand
      setAuth({
        id: response.data.userId,
        email: response.data.email,
        name: response.data.name,
        userType: response.data.userType as any,
        approvalStatus: response.data.approvalStatus,
      });

      // Redirección silenciosa al área privada
      navigate('/dashboard', { replace: true });
    },
    onError: (error: any) => {
      console.error('[Auth Error]:', error?.response?.data || error.message);
    },
  });
};