import axios from 'axios';
import { API_URL } from '../app/config';

interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export class AuthService {
  private static TOKEN_KEY = 'token';
  private static USER_KEY = 'user';

  // Get stored token
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // Get stored user
  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Store token and user
  static setAuth(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  // Clear auth data
  static clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Verify token with server
  static async verifyToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return !!response.data;
    } catch (error) {
      this.clearAuth();
      return false;
    }
  }

  // Login
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });
    
    const { token, user } = response.data;
    this.setAuth(token, user);
    return { token, user };
  }

  // Register
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    company?: string;
    phone?: string;
  }): Promise<void> {
    await axios.post(`${API_URL}/api/auth/register`, userData);
    // Don't set auth after registration - user needs to login
  }

  // Logout
  static logout(): void {
    this.clearAuth();
  }

  // Setup axios interceptor for token refresh
  static setupInterceptors(): void {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

// Initialize auth service
if (typeof window !== 'undefined') {
  AuthService.setupInterceptors();
  
  // Set auth header on page load if token exists
  const token = AuthService.getToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}
