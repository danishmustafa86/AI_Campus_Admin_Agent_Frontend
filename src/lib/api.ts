import axios from 'axios';
import type { 
  User, 
  TokenResponse, 
  LoginRequest, 
  SignupRequest,
  ProfileUpdateRequest,
  ChatRequest, 
  ChatHistoryResponse,
  ChatHistoryEntry,
  StudentPublic, 
  StudentCreate,
  StudentUpdate,
  AnalyticsResponse 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Clear auth store state
      const authStore = (window as any).authStore;
      if (authStore) {
        authStore.getState().logout();
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  signup: (data: SignupRequest): Promise<{ data: TokenResponse }> =>
    api.post('/auth/signup', data),
  
  login: (data: LoginRequest): Promise<{ data: TokenResponse }> =>
    api.post('/auth/login', data),
  
  me: (): Promise<{ data: User }> =>
    api.get('/auth/me'),
  
  updateProfile: (data: ProfileUpdateRequest): Promise<{ data: User }> =>
    api.put('/auth/me', data),
  
  users: (): Promise<{ data: User[] }> =>
    api.get('/auth/users'),
};

// Chat API
export const chatApi = {
  authenticated: (data: ChatRequest): Promise<{ data: { response: string } }> =>
    api.post('/chat/authenticated', data),
  
  guest: (data: ChatRequest & { user_id: string }): Promise<{ data: { response: string } }> =>
    api.post('/chat', data),
  
  stream: (data: ChatRequest): EventSource => {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    params.append('messages', JSON.stringify(data.messages));
    if (token) {
      params.append('token', token);
    }
    
    return new EventSource(
      `${API_BASE_URL}/stream?${params.toString()}`,
      {
        withCredentials: false,
      }
    );
  },

  // Chat history endpoints
  getMyHistory: (): Promise<{ data: ChatHistoryResponse }> =>
    api.get('/history/me'),
    
  getUserHistory: (userId: string, limit?: number): Promise<{ data: ChatHistoryResponse }> =>
    api.get(`/history/${userId}${limit ? `?limit=${limit}` : ''}`),
    
  getSessionHistory: (userId: string, sessionId: string): Promise<{ data: ChatHistoryEntry[] }> =>
    api.get(`/history/${userId}/session/${sessionId}`),
  
  deleteMyHistory: (): Promise<{ data: { message: string; deleted_count: number } }> =>
    api.delete('/history/me'),
};

// Students API
export const studentsApi = {
  // Get all students
  getAllStudents: (): Promise<{ data: StudentPublic[] }> =>
    api.get('/students/'),
    
  // Get student by ID
  getStudent: (studentId: string): Promise<{ data: StudentPublic }> =>
    api.get(`/students/${studentId}`),
    
  // Create new student
  createStudent: (data: StudentCreate): Promise<{ data: StudentPublic }> =>
    api.post('/students/', data),
    
  // Update student
  updateStudent: (studentId: string, data: StudentUpdate): Promise<{ data: StudentPublic }> =>
    api.put(`/students/${studentId}`, data),
    
  // Delete student
  deleteStudent: (studentId: string): Promise<{ data: { deleted: boolean } }> =>
    api.delete(`/students/${studentId}`),
    
  // Get analytics overview
  getAnalytics: (): Promise<{ data: AnalyticsResponse }> =>
    api.get('/students/analytics/overview'),
};

// Analytics API
export const analyticsApi = {
  // Get comprehensive analytics summary
  getSummary: (): Promise<{ data: AnalyticsResponse }> =>
    api.get('/analytics/'),
};