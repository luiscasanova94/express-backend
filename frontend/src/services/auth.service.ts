import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  async login(username: string, password: string): Promise<void> {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username,
      password,
    });
    this.token = response.data.token;
    localStorage.setItem('authToken', this.token!);
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async isAuthenticated(): Promise<boolean> {
    return !!this.token;
  }

  getAuthToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService();