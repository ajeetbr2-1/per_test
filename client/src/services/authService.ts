import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'provider';
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'provider';
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/profile', data);
    return response.data.user;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setAuthData(token: string, user: User) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};