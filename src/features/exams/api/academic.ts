import { apiClient } from '@/lib/axios';
import type { Subject, ClassGroup } from '../types';

export const academicApi = {
  // Obtiene todas las asignaturas del sistema (Globales)
  getAllSubjects: async (): Promise<Subject[]> => {
    const response = await apiClient.get<Subject[]>('/subjects');
    // Manejamos si viene envuelto en .data o directo
    return (response.data as any).data || response.data;
  },

  // Coincide con ClassGroupController: GET /api/groups/teacher/{teacherId}
  // 🔥 CORREGIDO: La ruta es /groups, no /class-groups
  getGroupsByTeacher: async (teacherId: number): Promise<ClassGroup[]> => {
    const response = await apiClient.get<ClassGroup[]>(`/groups/teacher/${teacherId}`);
    return response.data;
  }
};