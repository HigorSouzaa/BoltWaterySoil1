import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthContextType, User, LoginData, RegisterData } from '../types/auth';
import authService from '../services/authService';

// Estados para o reducer
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Ações do reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_INITIAL_AUTH'; payload: { user: User; token: string } };

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_INITIAL_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };

    default:
      return state;
  }
};

// Criar contexto - EXPORTADO AGORA
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar se há dados salvos no localStorage ao inicializar
  useEffect(() => {
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();

    if (token && user) {
      dispatch({
        type: 'SET_INITIAL_AUTH',
        payload: { token, user }
      });
    }
  }, []);

  // Função de login
  const login = async (data: LoginData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authService.login(data);
      
      // Salvar no localStorage
      authService.saveAuthData(response.token, response.user);
      
      // Atualizar contexto
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token
        }
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Erro inesperado'
      });
      throw error;
    }
  };

  // Função de registro
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authService.register(data);
      
      // Salvar no localStorage
      authService.saveAuthData(response.token, response.user);
      
      // Atualizar contexto
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token
        }
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Erro inesperado'
      });
      throw error;
    }
  };

  // Função de logout
  const logout = (): void => {
    authService.clearAuthData();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // Limpar erro
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado DENTRO DO PRÓPRIO CONTEXTO
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
