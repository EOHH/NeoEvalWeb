import { useQuery } from '@tanstack/react-query';
import { examsApi } from '../api/exams';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

/**
 * Hook inteligente: Decide qué endpoint llamar según el rol y el ID del usuario activo.
 */
export const useExams = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    // La llave de caché incluye el ID del usuario para evitar cruce de datos
    queryKey: ['exams', 'list', user?.id], 
    queryFn: async () => {
      if (!user?.id) throw new Error("Usuario no autenticado");

      // Si es un profesor o admin, cargamos los exámenes que ha creado
      if (user.userType === 'TEACHER' || user.userType === 'ADMIN') {
        return examsApi.getByTeacher(user.id);
      } 
      // Si es un estudiante, cargamos los exámenes que tiene disponibles
      else if (user.userType === 'STUDENT') {
        return examsApi.getAvailableForStudent(user.id);
      }
      
      return [];
    },
    // Solo se ejecuta la query si hay un usuario válido en el store
    enabled: !!user?.id, 
    staleTime: 1000 * 60 * 5, // Caché por 5 minutos
  });
};