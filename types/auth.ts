export interface User {
    _id: string;
    name: string;
    email: string;
  }
  
  export interface RegisterData {
    name: string;
    email: string;
    pass: string;
  }
  
  export interface LoginData {
    email: string;
    pass: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
  }
  
  export interface ApiError {
    message: string;
  }
  