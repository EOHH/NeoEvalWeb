export interface User {
  id: number;
  email: string;
  name?: string;
  userType: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  approvalStatus?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number; // Tu backend envía userId, no id
  userType: string; // Tu backend envía userType, no roles[]
  name: string;
  email: string;
  studentId: number | null;
  approvalStatus: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}