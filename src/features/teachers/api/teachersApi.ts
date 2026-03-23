import { apiClient } from '@/lib/axios';
import type { ExamResponse, ClassGroup } from '@/features/exams/types'; // Ajusta la ruta a tus tipos

export const teachersApi = {
  getExams: async (teacherId: number): Promise<ExamResponse[]> => {
    const { data } = await apiClient.get(`/api/teachers/${teacherId}/exams`);
    return data;
  },
  
  getGroups: async (teacherId: number): Promise<ClassGroup[]> => {
    const { data } = await apiClient.get(`/api/teachers/${teacherId}/groups`);
    return data;
  }
};