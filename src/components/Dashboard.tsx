import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Leaf,
  Thermometer,
  BarChart3,
  Settings,
  Bell,
  User,
  LogOut,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  MapPin,
  Calendar,
  Cpu,
  Home
} from 'lucide-react';
import { EnvironmentManager } from './EnvironmentManager';
import { UserSettings } from './UserSettings';
import { ArduinoModules } from './ArduinoModules';
import { MaintenanceSchedule } from './MaintenanceSchedule';
import { supabase } from '../services/authService';

interface DashboardProps {
  onLogout: () => void;
}

interface UserPreferences {
  active_environment_id: string | null;
  active_sector_id: string | null;
}

interface Environment {
  id: string;
  name: string;
}

interface Sector {
  id: string;
  name: string;
  environment_id: string;
}

interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'environments' | 'modules' | 'maintenance' | 'settings'>('dashboard');
  const [activeEnvironment, setActiveEnvironment] = useState<Environment | null>(null);
  const [activeSector, setActiveSector] = useState<Sector | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([
    {
      id: 'humidity',
      name: 'Umidade do Solo',
      value: 68,
      unit: '%',
      status: 'good',
      trend: 'stable',
      icon: <Droplets className="h-8 w-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'ph',
      name: 'pH do Solo',
      value: 6.8,
      unit: '',
      status: 'good',
      trend: 'up',
      icon: <Leaf className="h-8 w-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'temperature',
      name: 'Temperatura',
      value: 24,
      unit: '°C',
      status: 'good',
      trend: 'down',
      icon: <Thermometer className="h-8 w-8" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'nutrients',
      name: 'Nutrientes NPK',
      value: 85,
      unit: '%',
      status: 'warning',
      trend: 'down',
      icon: <Activity className="h-8 w-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]);

  const [alerts] = useState([
    { id: 1, type: 'warning', message: 'Sensor 3 precisa de calibração', time: '2h atrás' },
    { id: 2, type: 'info', message: 'Irrigação programada para 14:00', time: '4h atrás' },
    { id: 3, type: 'success', message: 'pH otimizado com sucesso', time: '1 dia atrás' }
  ]);

  useEffect(() => {
    loadActiveLocation();
  }, []);

  const loadActiveLocation = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('active_environment_id, active_sector_id')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      if (prefs?.active_environment_id) {
        const { data: env } = await supabase
          .from('environments')
          .select('id, name')
          .eq('id', prefs.active_environment_id)
          .maybeSingle();
        setActiveEnvironment(env);
      }

      if (prefs?.active_sector_id) {
        const { data: sector } = await supabase
          .from('sectors')
          .select('id, name, environment_id')
          .eq('id', prefs.active_sector_id)
          .maybeSingle();
        setActiveSector(sector);
      }
    } catch (error) {
      console.error('Error loading active location:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prevData =>
        prevData.map(sensor => ({
          ...sensor,
          value: sensor.value + (Math.random() - 0.5) * 2
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400"></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Droplets className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  WaterySoil
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 ml-6">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {activeEnvironment && activeSector
                    ? `${activeEnvironment.name} - ${activeSector.name}`
                    : 'Nenhum setor ativo'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('environments')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Ambientes e Setores"
              >
                <Home className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentView('modules')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Módulos Arduino"
              >
                <Cpu className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentView('maintenance')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Manutenção"
              >
                <Calendar className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Configurações"
              >
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:block">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {currentView === 'environments' ? (
        <EnvironmentManager />
      ) : currentView === 'modules' ? (
        <ArduinoModules />
      ) : currentView === 'maintenance' ? (
        <MaintenanceSchedule />
      ) : currentView === 'settings' ? (
        <UserSettings />
      ) : (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Monitoramento</h1>
          <p className="text-gray-600">Acompanhe seus sensores em tempo real e otimize sua produção</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {sensorData.map((sensor) => (
            <div
              key={sensor.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${sensor.bgColor}`}>
                  <div className={sensor.color}>
                    {sensor.icon}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getStatusIcon(sensor.status)}
                  {getTrendIcon(sensor.trend)}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{sensor.name}</h3>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold text-gray-900">
                  {sensor.value.toFixed(1)}
                </span>
                <span className="text-lg text-gray-500 mb-1">{sensor.unit}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  sensor.status === 'good' ? 'bg-green-100 text-green-700' :
                  sensor.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {sensor.status === 'good' ? 'Ideal' : sensor.status === 'warning' ? 'Atenção' : 'Crítico'}
                </span>
                <span className="text-xs text-gray-500">Atualizado agora</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Histórico de Sensores</h2>
                <div className="flex items-center space-x-4">
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Últimas 24h</option>
                    <option>Última semana</option>
                    <option>Último mês</option>
                  </select>
                </div>
              </div>
              
              {/* Simulated Chart Area */}
              <div className="h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-200">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Gráfico de Tendências</p>
                  <p className="text-sm text-gray-500">Dados em tempo real dos sensores IoT</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Sensores Online</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">12/12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Sistema de Irrigação</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">Ativo</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Próxima Manutenção</span>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">5 dias</span>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recentes</h3>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === 'success' ? 'bg-green-500' :
                      alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">Ativar Irrigação</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Ver Relatório</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-amber-600" />
                    <span className="text-sm text-amber-700 font-medium">Configurar Alertas</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;