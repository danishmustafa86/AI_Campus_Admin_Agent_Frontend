import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string, full_name?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (user: User) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('🔐 Attempting login for:', username);
          const { data } = await authApi.login({ username, password });
          console.log('✅ Login API call successful, token received');
          const token = data.access_token;
          
          localStorage.setItem('access_token', token);
          set({ token, isLoading: false });
          
          // Load user data
          console.log('📥 Loading user data...');
          await get().loadUser();
          console.log('✅ Login complete');
        } catch (error: any) {
          console.error('❌ Login failed:', error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (email: string, username: string, password: string, full_name?: string) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.signup({ email, username, password, full_name });
          const token = data.access_token;
          
          localStorage.setItem('access_token', token);
          set({ token, isLoading: false });
          
          // Load user data
          await get().loadUser();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (user: User) => {
        set({ user });
      },

      loadUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        try {
          console.log('🔑 Fetching user data with token...');
          const { data } = await authApi.me();
          console.log('✅ User data loaded:', data);
          set({ user: data, token, isAuthenticated: true });
        } catch (error: any) {
          console.error('❌ Failed to load user:', error);
          console.error('Error response:', error.response?.data);
          localStorage.removeItem('access_token');
          set({ user: null, token: null, isAuthenticated: false });
          throw error;
        }
      },

      initialize: async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
          set({ token, isLoading: true });
          try {
            await get().loadUser();
          } catch (error) {
            // Token is invalid, already handled by loadUser
            console.log('Token validation failed during initialization');
          } finally {
            set({ isLoading: false });
          }
        } else {
          // No token found, ensure clean state
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);