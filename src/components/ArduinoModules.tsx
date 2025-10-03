import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Wifi, WifiOff, AlertCircle, Settings } from 'lucide-react';
import { supabase } from '../services/authService';

interface ArduinoModule {
  id: string;
  sector_id: string;
  name: string;
  module_type: string;
  status: string;
  ip_address: string | null;
  last_ping: string | null;
  configuration: any;
  created_at: string;
}

interface Sector {
  id: string;
  name: string;
  environment_id: string;
}

interface Environment {
  id: string;
  name: string;
}

export const ArduinoModules: React.FC = () => {
  const [modules, setModules] = useState<ArduinoModule[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState<ArduinoModule | null>(null);
  const [moduleForm, setModuleForm] = useState({
    name: '',
    module_type: 'sensor',
    ip_address: '',
    configuration: {}
  });

  useEffect(() => {
    loadEnvironments();
  }, []);

  useEffect(() => {
    if (environments.length > 0) {
      loadSectors();
    }
  }, [environments]);

  useEffect(() => {
    if (selectedSector) {
      loadModules();
      const interval = setInterval(loadModules, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedSector]);

  const loadEnvironments = async () => {
    const { data, error } = await supabase
      .from('environments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading environments:', error);
      return;
    }

    setEnvironments(data || []);
  };

  const loadSectors = async () => {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading sectors:', error);
      return;
    }

    setSectors(data || []);
    if (data && data.length > 0 && !selectedSector) {
      setSelectedSector(data[0].id);
    }
  };

  const loadModules = async () => {
    if (!selectedSector) return;

    const { data, error } = await supabase
      .from('arduino_modules')
      .select('*')
      .eq('sector_id', selectedSector)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading modules:', error);
      return;
    }

    setModules(data || []);
  };

  const handleSaveModule = async () => {
    if (!moduleForm.name.trim() || !selectedSector) return;

    if (editingModule) {
      const { error } = await supabase
        .from('arduino_modules')
        .update({
          name: moduleForm.name,
          module_type: moduleForm.module_type,
          ip_address: moduleForm.ip_address || null,
          configuration: moduleForm.configuration
        })
        .eq('id', editingModule.id);

      if (error) {
        console.error('Error updating module:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('arduino_modules')
        .insert([{
          name: moduleForm.name,
          module_type: moduleForm.module_type,
          sector_id: selectedSector,
          ip_address: moduleForm.ip_address || null,
          configuration: moduleForm.configuration,
          status: 'offline'
        }]);

      if (error) {
        console.error('Error creating module:', error);
        return;
      }
    }

    setShowModal(false);
    setEditingModule(null);
    setModuleForm({
      name: '',
      module_type: 'sensor',
      ip_address: '',
      configuration: {}
    });
    loadModules();
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo?')) return;

    const { error } = await supabase
      .from('arduino_modules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting module:', error);
      return;
    }

    loadModules();
  };

  const handlePingModule = async (moduleId: string) => {
    const { error } = await supabase
      .from('arduino_modules')
      .update({
        last_ping: new Date().toISOString(),
        status: 'operational'
      })
      .eq('id', moduleId);

    if (error) {
      console.error('Error pinging module:', error);
      return;
    }

    loadModules();
  };

  const openEditModule = (module: ArduinoModule) => {
    setEditingModule(module);
    setModuleForm({
      name: module.name,
      module_type: module.module_type,
      ip_address: module.ip_address || '',
      configuration: module.configuration || {}
    });
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <Wifi size={16} />;
      case 'offline':
        return <WifiOff size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      default:
        return <WifiOff size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operacional';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const getSectorEnvironment = (sectorId: string) => {
    const sector = sectors.find(s => s.id === sectorId);
    if (!sector) return '';
    const env = environments.find(e => e.id === sector.environment_id);
    return env ? `${env.name} - ${sector.name}` : sector.name;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Settings size={28} />
              Módulos Arduino
            </h2>
            <button
              onClick={() => {
                setEditingModule(null);
                setModuleForm({
                  name: '',
                  module_type: 'sensor',
                  ip_address: '',
                  configuration: {}
                });
                setShowModal(true);
              }}
              disabled={!selectedSector}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Novo Módulo
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Setor
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione um setor</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {getSectorEnvironment(sector.id)}
                </option>
              ))}
            </select>
          </div>

          {!selectedSector ? (
            <div className="text-center text-gray-500 py-8">
              Selecione um setor para ver os módulos
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Nenhum módulo cadastrado neste setor
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{module.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{module.module_type}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                      {getStatusIcon(module.status)}
                      {getStatusText(module.status)}
                    </span>
                  </div>

                  {module.ip_address && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600">IP: {module.ip_address}</p>
                    </div>
                  )}

                  {module.last_ping && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600">
                        Último ping: {new Date(module.last_ping).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handlePingModule(module.id)}
                      className="flex-1 text-sm bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition"
                    >
                      Testar
                    </button>
                    <button
                      onClick={() => openEditModule(module)}
                      className="text-blue-600 hover:text-blue-700 p-2"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Módulo
                </label>
                <input
                  type="text"
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Arduino 01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Módulo
                </label>
                <select
                  value={moduleForm.module_type}
                  onChange={(e) => setModuleForm({ ...moduleForm, module_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sensor">Sensor</option>
                  <option value="actuator">Atuador</option>
                  <option value="controller">Controlador</option>
                  <option value="monitor">Monitor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço IP (opcional)
                </label>
                <input
                  type="text"
                  value={moduleForm.ip_address}
                  onChange={(e) => setModuleForm({ ...moduleForm, ip_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="192.168.1.100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingModule(null);
                  setModuleForm({
                    name: '',
                    module_type: 'sensor',
                    ip_address: '',
                    configuration: {}
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
