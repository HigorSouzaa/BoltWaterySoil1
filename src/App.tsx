import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

export type Screen = 'landing' | 'auth' | 'dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('landing');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/v1/users/verify-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Token válido, redirecionar para dashboard
          setIsAuthenticated(true);
          setCurrentScreen('dashboard');
        } else {
          // Token inválido, limpar localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyToken();
  }, []);

  // Mostrar loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
          {currentScreen === 'landing' && (
            <Landing onNavigateToAuth={() => navigateToScreen('auth')} />
          )}
          {currentScreen === 'auth' && (
            <Auth
              onLogin={handleLogin}
              onBackToLanding={() => navigateToScreen('landing')}
            />
          )}
          {currentScreen === 'dashboard' && isAuthenticated && (
            <Dashboard onLogout={handleLogout} />
          )}
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;