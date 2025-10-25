import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { VerifyEmailChange } from './components/VerifyEmailChange';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
            <Routes>
              {/* Rota pública - Landing Page */}
              <Route path="/" element={<Landing />} />

              {/* Rota pública - Autenticação (Login/Registro) */}
              <Route path="/auth" element={<Auth />} />

              {/* Rota pública - Verificação de alteração de email */}
              <Route path="/verify-email" element={<VerifyEmailChange />} />

              {/* Rota protegida - Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirecionar rotas não encontradas para a landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;