// AI Campus Admin Types
export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface ProfileUpdateRequest {
  email?: string;
  full_name?: string;
  current_password?: string;
  new_password?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatHistoryEntry {
  id: string;
  user_id: string;
  session_id: string;
  user_message: string;
  ai_response: string;
  timestamp: string;
  created_at: string;
}

export interface ChatHistoryResponse {
  user_id: string;
  total_chats: number;
  chats: ChatHistoryEntry[];
}

// Student interfaces
export interface StudentPublic {
  id: string;
  student_id: string;
  name: string;
  department: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface StudentCreate {
  student_id: string;
  name: string;
  department: string;
  email: string;
}

export interface StudentUpdate {
  name?: string;
  department?: string;
  email?: string;
}

export interface AnalyticsResponse {
  total_students: number;
  students_by_department: Array<{
    department: string;
    count: number;
  }>;
  recent_onboarded: StudentPublic[];
  active_last_7_days: number;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}