import React, { useState } from 'react';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

export type Screen = 'landing' | 'auth' | 'dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  };

  return (
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
  );
}

export default App;