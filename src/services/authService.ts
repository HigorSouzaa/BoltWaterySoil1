import { RegisterData, LoginData, AuthResponse } from '../types/auth';

class AuthService {
  private baseURL: string;

  constructor() {
    // Para Vite usar import.meta.env ao invés de process.env
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao cadastrar usuário');
    }

    return data;
  }

  async login(userData: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Exibe o código antes de lançar o erro
      if (data.code) {
        console.error('❌ Código de erro:', data.code);
        alert(`Código: ${data.code}`);
      }
      throw new Error(data.message || 'Erro ao fazer login');
    }

    // Se requer 2FA e tem código, exibe para desenvolvimento (sem email)
    if (data.requires2FA && data.code) {
      console.log('🔐 ===================================');
      console.log('🔐 CÓDIGO DE VERIFICAÇÃO 2FA');
      console.log('🔐 Código:', data.code);
      console.log('🔐 ===================================');
      alert(`✅ ${data.message}\n\n🔐 Código de Verificação: ${data.code}\n\n(Em produção este código seria enviado por email)`);
    }

    return data;
  }

  async verify2FA(email: string, code: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/users/verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao verificar código');
    }

    return data;
  }

  async toggle2FA(enabled: boolean): Promise<{ message: string; twoFactorEnabled: boolean }> {
    const token = this.getStoredToken();

    const response = await fetch(`${this.baseURL}/users/toggle-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ enabled }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao alterar 2FA');
    }

    // Atualizar usuário no localStorage
    const user = this.getStoredUser();
    if (user) {
      user.twoFactorEnabled = data.twoFactorEnabled;
      localStorage.setItem('user', JSON.stringify(user));
    }

    return data;
  }

  // Métodos para localStorage
  saveAuthData(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  getStoredUser(): any | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export default new AuthService();
