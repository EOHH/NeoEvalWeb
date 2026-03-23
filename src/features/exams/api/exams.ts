import { apiClient } from '@/lib/axios';
import type { 
  ExamResponse, 
  ExamSummaryResponse, 
  CreateExamRequest 
} from '../types';

// 🔹 DTO para enviar una nueva pregunta al backend
// (Lo definimos aquí por ahora, luego puedes moverlo a '../types' si lo deseas)
export interface QuestionRequestDTO {
  questionText: string;
  questionType: string;
  difficulty: number;
  points: number;
  options: string; // Será un JSON.stringify([...])
  correctAnswer: string; // Será un JSON.stringify(...)
  explanation?: string;
}

/**
 * 🚀 SDK Interno para el Módulo de Exámenes
 * Mapea 1:1 con el ExamController.java y QuestionController.java de Spring Boot
 */
export const examsApi = {
  // === MUTACIONES DE EXAMEN (Crear, Editar, Borrar) ===
  
  create: async (data: CreateExamRequest): Promise<ExamResponse> => {
    const response = await apiClient.post<ExamResponse>('/exams', data);
    return response.data;
  },

  update: async (id: number, data: CreateExamRequest): Promise<ExamResponse> => {
    const response = await apiClient.put<ExamResponse>(`/exams/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/exams/${id}`);
  },

  // === CONSULTAS GLOBALES DE EXAMEN ===
  
  getById: async (id: number): Promise<ExamResponse> => {
    const response = await apiClient.get<ExamResponse>(`/exams/${id}`);
    return response.data;
  },

  getByGroup: async (groupId: number): Promise<ExamResponse[]> => {
    const response = await apiClient.get<ExamResponse[]>(`/exams/group/${groupId}`);
    return response.data;
  },

  // === CONSULTAS DE PROFESOR (TEACHER) ===
  
  getByTeacher: async (teacherId: number): Promise<ExamResponse[]> => {
    const response = await apiClient.get<ExamResponse[]>(`/exams/teacher/${teacherId}`);
    return response.data;
  },

  getSummaryByTeacher: async (teacherId: number): Promise<ExamSummaryResponse[]> => {
    const response = await apiClient.get<ExamSummaryResponse[]>(`/exams/teacher/${teacherId}/results/summary`);
    return response.data;
  },

  // === CONSULTAS DE ESTUDIANTE (STUDENT) ===
  
  getAvailableForStudent: async (studentId: number): Promise<ExamResponse[]> => {
    const response = await apiClient.get<ExamResponse[]>(`/exams/student/${studentId}/available`);
    return response.data;
  },

  getStudentHistory: async (studentId: number): Promise<ExamResponse[]> => {
    const response = await apiClient.get<ExamResponse[]>(`/exams/student/${studentId}/history`);
    return response.data;
  },

  // =========================================================
  // === PREGUNTAS DEL EXAMEN (QUESTION CONTROLLER) ==========
  // =========================================================
  
  createQuestion: async (examId: number, data: QuestionRequestDTO): Promise<any> => {
    const response = await apiClient.post(`/questions/exam/${examId}`, data);
    return response.data;
  },
  
  getQuestionsByExam: async (examId: number): Promise<any[]> => {
    const response = await apiClient.get(`/questions/exam/${examId}`);
    return response.data;
  },

  deleteQuestion: async (questionId: number): Promise<void> => {
    await apiClient.delete(`/questions/${questionId}`);
  },

  updateQuestion: async (questionId: number, data: QuestionRequestDTO): Promise<any> => {
    const response = await apiClient.put(`/questions/${questionId}`, data);
    return response.data;
  }
};