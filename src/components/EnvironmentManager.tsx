import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { supabase } from '../services/authService';

interface Environment {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Sector {
  id: string;
  environment_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export const EnvironmentManager: React.FC = () => {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [envForm, setEnvForm] = useState({ name: '', description: '' });
  const [sectorForm, setSectorForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadEnvironments();
  }, []);

  useEffect(() => {
    if (selectedEnvironment) {
      loadSectors(selectedEnvironment);
    } else {
      setSectors([]);
    }
  }, [selectedEnvironment]);

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
    if (data && data.length > 0 && !selectedEnvironment) {
      setSelectedEnvironment(data[0].id);
    }
  };

  const loadSectors = async (environmentId: string) => {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .eq('environment_id', environmentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading sectors:', error);
      return;
    }

    setSectors(data || []);
  };

  const handleSaveEnvironment = async () => {
    if (!envForm.name.trim()) return;

    if (editingEnv) {
      const { error } = await supabase
        .from('environments')
        .update({ name: envForm.name, description: envForm.description })
        .eq('id', editingEnv.id);

      if (error) {
        console.error('Error updating environment:', error);
        return;
      }
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase
        .from('environments')
        .insert([{
          name: envForm.name,
          description: envForm.description,
          user_id: userData.user.id
        }]);

      if (error) {
        console.error('Error creating environment:', error);
        return;
      }
    }

    setShowEnvModal(false);
    setEditingEnv(null);
    setEnvForm({ name: '', description: '' });
    loadEnvironments();
  };

  const handleSaveSector = async () => {
    if (!sectorForm.name.trim() || !selectedEnvironment) return;

    if (editingSector) {
      const { error } = await supabase
        .from('sectors')
        .update({ name: sectorForm.name, description: sectorForm.description })
        .eq('id', editingSector.id);

      if (error) {
        console.error('Error updating sector:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('sectors')
        .insert([{
          name: sectorForm.name,
          description: sectorForm.description,
          environment_id: selectedEnvironment
        }]);

      if (error) {
        console.error('Error creating sector:', error);
        return;
      }
    }

    setShowSectorModal(false);
    setEditingSector(null);
    setSectorForm({ name: '', description: '' });
    loadSectors(selectedEnvironment);
  };

  const handleDeleteEnvironment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este ambiente? Todos os setores e módulos associados serão excluídos.')) return;

    const { error } = await supabase
      .from('environments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting environment:', error);
      return;
    }

    if (selectedEnvironment === id) {
      setSelectedEnvironment(null);
    }
    loadEnvironments();
  };

  const handleDeleteSector = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este setor? Todos os módulos associados serão excluídos.')) return;

    const { error } = await supabase
      .from('sectors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sector:', error);
      return;
    }

    if (selectedEnvironment) {
      loadSectors(selectedEnvironment);
    }
  };

  const handleSetActiveSector = async (sectorId: string) => {
    if (!selectedEnvironment) return;

    await supabase
      .from('sectors')
      .update({ is_active: false })
      .eq('environment_id', selectedEnvironment);

    const { error } = await supabase
      .from('sectors')
      .update({ is_active: true })
      .eq('id', sectorId);

    if (error) {
      console.error('Error setting active sector:', error);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userData.user.id,
          active_environment_id: selectedEnvironment,
          active_sector_id: sectorId
        });
    }

    loadSectors(selectedEnvironment);
  };

  const openEditEnv = (env: Environment) => {
    setEditingEnv(env);
    setEnvForm({ name: env.name, description: env.description || '' });
    setShowEnvModal(true);
  };

  const openEditSector = (sector: Sector) => {
    setEditingSector(sector);
    setSectorForm({ name: sector.name, description: sector.description || '' });
    setShowSectorModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Ambientes</h2>
            <button
              onClick={() => {
                setEditingEnv(null);
                setEnvForm({ name: '', description: '' });
                setShowEnvModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Novo
            </button>
          </div>

          <div className="space-y-2">
            {environments.map((env) => (
              <div
                key={env.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectedEnvironment === env.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedEnvironment(env.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{env.name}</h3>
                    {env.description && (
                      <p className="text-sm text-gray-600 mt-1">{env.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditEnv(env);
                      }}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEnvironment(env.id);
                      }}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Setores</h2>
            <button
              onClick={() => {
                setEditingSector(null);
                setSectorForm({ name: '', description: '' });
                setShowSectorModal(true);
              }}
              disabled={!selectedEnvironment}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Novo
            </button>
          </div>

          {!selectedEnvironment ? (
            <div className="text-center text-gray-500 py-8">
              Selecione um ambiente para ver os setores
            </div>
          ) : sectors.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Nenhum setor cadastrado
            </div>
          ) : (
            <div className="space-y-2">
              {sectors.map((sector) => (
                <div
                  key={sector.id}
                  className={`p-4 rounded-lg border-2 transition ${
                    sector.is_active
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{sector.name}</h3>
                        {sector.is_active && (
                          <span className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                            <MapPin size={12} />
                            Ativo
                          </span>
                        )}
                      </div>
                      {sector.description && (
                        <p className="text-sm text-gray-600 mt-1">{sector.description}</p>
                      )}
                      {!sector.is_active && (
                        <button
                          onClick={() => handleSetActiveSector(sector.id)}
                          className="text-xs text-green-600 hover:text-green-700 mt-2"
                        >
                          Tornar ativo
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditSector(sector)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSector(sector.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEnvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingEnv ? 'Editar Ambiente' : 'Novo Ambiente'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={envForm.name}
                  onChange={(e) => setEnvForm({ ...envForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Fazenda São João"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={envForm.description}
                  onChange={(e) => setEnvForm({ ...envForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrição opcional"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEnvModal(false);
                  setEditingEnv(null);
                  setEnvForm({ name: '', description: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEnvironment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSectorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingSector ? 'Editar Setor' : 'Novo Setor'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={sectorForm.name}
                  onChange={(e) => setSectorForm({ ...sectorForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Setor A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={sectorForm.description}
                  onChange={(e) => setSectorForm({ ...sectorForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrição opcional"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSectorModal(false);
                  setEditingSector(null);
                  setSectorForm({ name: '', description: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSector}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
