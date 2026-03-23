// Tipos base para sub-entidades (como ClassGroup)
export interface ClassGroupResponse {
  id?: number;
  name?: string;
  // Puedes agregar más campos de tu ClassGroupResponse.java luego si los necesitas
}

// 🔹 DTO exacto que envía Spring Boot
export interface ExamResponse {
  id: number;
  title: string;
  description?: string;
  examType: string;
  openingDate: string | number[] | null;
  closingDate: string | number[] | null;
  timeLimitMinutes: number;
  allowedAttempts: number;
  averageDifficulty: number;
  subjectId: number;
  subjectName: string;
  classGroup: ClassGroupResponse | null;
  teacherId: number;
  teacherName: string;
  isCompleted: boolean;
  questions: any[]; // Lo dejamos como any[] hasta mapear QuestionResponse
  questionCount: number;
}

// 🔹 DTO para el resumen del profesor
export interface ExamSummaryResponse {
  examId: number;
  title: string;
  averageScore: number;
  submissionsCount: number;
  lastSubmission: string | number[] | null;
  subjectName: string;
}

// 🔹 DTO para Crear Examen (Ajustarás esto cuando hagamos el formulario)
export interface CreateExamRequest {
  title: string;
  description?: string;
  timeLimitMinutes: number;
  // ...
}

// Para las asignaturas
export interface Subject {
  id: number;
  name: string;
  description?: string;
}

// Para los grupos (Basado en tu ClassGroupResponse de Java)
export interface ClassGroup {
  id: number;
  name: string;
  educationalLevel?: string;
  teacherId?: number;
  teacherName?: string;
}