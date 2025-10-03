import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/authService';

interface MaintenanceSchedule {
  id: string;
  sector_id: string;
  arduino_module_id: string | null;
  title: string;
  description: string | null;
  scheduled_date: string;
  completed_date: string | null;
  status: string;
  priority: string;
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

interface ArduinoModule {
  id: string;
  name: string;
  sector_id: string;
}

export const MaintenanceSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [modules, setModules] = useState<ArduinoModule[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MaintenanceSchedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    priority: 'medium',
    arduino_module_id: ''
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
      loadSchedules();
      loadModules();
    }
  }, [selectedSector, filterStatus]);

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
      .select('id, name, sector_id')
      .eq('sector_id', selectedSector);

    if (error) {
      console.error('Error loading modules:', error);
      return;
    }

    setModules(data || []);
  };

  const loadSchedules = async () => {
    if (!selectedSector) return;

    let query = supabase
      .from('maintenance_schedules')
      .select('*')
      .eq('sector_id', selectedSector);

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query.order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error loading schedules:', error);
      return;
    }

    const updatedSchedules = (data || []).map(schedule => {
      const scheduledDate = new Date(schedule.scheduled_date);
      const now = new Date();

      if (schedule.status === 'pending' && scheduledDate < now) {
        return { ...schedule, status: 'overdue' };
      }
      return schedule;
    });

    setSchedules(updatedSchedules);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.title.trim() || !scheduleForm.scheduled_date || !selectedSector) return;

    if (editingSchedule) {
      const { error } = await supabase
        .from('maintenance_schedules')
        .update({
          title: scheduleForm.title,
          description: scheduleForm.description || null,
          scheduled_date: scheduleForm.scheduled_date,
          priority: scheduleForm.priority,
          arduino_module_id: scheduleForm.arduino_module_id || null
        })
        .eq('id', editingSchedule.id);

      if (error) {
        console.error('Error updating schedule:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('maintenance_schedules')
        .insert([{
          title: scheduleForm.title,
          description: scheduleForm.description || null,
          scheduled_date: scheduleForm.scheduled_date,
          priority: scheduleForm.priority,
          sector_id: selectedSector,
          arduino_module_id: scheduleForm.arduino_module_id || null,
          status: 'pending'
        }]);

      if (error) {
        console.error('Error creating schedule:', error);
        return;
      }
    }

    setShowModal(false);
    setEditingSchedule(null);
    setScheduleForm({
      title: '',
      description: '',
      scheduled_date: '',
      priority: 'medium',
      arduino_module_id: ''
    });
    loadSchedules();
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta manutenção?')) return;

    const { error } = await supabase
      .from('maintenance_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting schedule:', error);
      return;
    }

    loadSchedules();
  };

  const handleCompleteSchedule = async (id: string) => {
    const { error } = await supabase
      .from('maintenance_schedules')
      .update({
        status: 'completed',
        completed_date: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error completing schedule:', error);
      return;
    }

    loadSchedules();
  };

  const openEditSchedule = (schedule: MaintenanceSchedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      title: schedule.title,
      description: schedule.description || '',
      scheduled_date: schedule.scheduled_date.split('T')[0],
      priority: schedule.priority,
      arduino_module_id: schedule.arduino_module_id || ''
    });
    setShowModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'overdue':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasado';
      default:
        return 'Desconhecido';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'Média';
    }
  };

  const getSectorEnvironment = (sectorId: string) => {
    const sector = sectors.find(s => s.id === sectorId);
    if (!sector) return '';
    const env = environments.find(e => e.id === sector.environment_id);
    return env ? `${env.name} - ${sector.name}` : sector.name;
  };

  const getModuleName = (moduleId: string | null) => {
    if (!moduleId) return 'Geral';
    const module = modules.find(m => m.id === moduleId);
    return module ? module.name : 'Módulo não encontrado';
  };

  const getNextMaintenanceSuggestion = () => {
    const now = new Date();
    const pendingSchedules = schedules.filter(s => s.status === 'pending' || s.status === 'overdue');

    if (pendingSchedules.length === 0) {
      return 'Nenhuma manutenção pendente';
    }

    const nextSchedule = pendingSchedules.sort((a, b) =>
      new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
    )[0];

    const scheduledDate = new Date(nextSchedule.scheduled_date);
    const diffTime = scheduledDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `URGENTE: ${nextSchedule.title} está ${Math.abs(diffDays)} dia(s) atrasado`;
    } else if (diffDays === 0) {
      return `HOJE: ${nextSchedule.title}`;
    } else if (diffDays <= 3) {
      return `Em ${diffDays} dia(s): ${nextSchedule.title}`;
    } else {
      return `Próxima manutenção: ${nextSchedule.title} em ${diffDays} dias`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md mb-6 p-6">
        <div className="flex items-center gap-3 text-blue-600">
          <Calendar size={24} />
          <div>
            <p className="text-sm text-gray-600">Próxima Vistoria</p>
            <p className="font-semibold">{getNextMaintenanceSuggestion()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={28} />
              Agenda de Manutenção
            </h2>
            <button
              onClick={() => {
                setEditingSchedule(null);
                setScheduleForm({
                  title: '',
                  description: '',
                  scheduled_date: '',
                  priority: 'medium',
                  arduino_module_id: ''
                });
                setShowModal(true);
              }}
              disabled={!selectedSector}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Nova Manutenção
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="overdue">Atrasado</option>
                <option value="completed">Concluído</option>
              </select>
            </div>
          </div>

          {!selectedSector ? (
            <div className="text-center text-gray-500 py-8">
              Selecione um setor para ver as manutenções
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Nenhuma manutenção agendada
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{schedule.title}</h3>
                      {schedule.description && (
                        <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {getStatusIcon(schedule.status)}
                        {getStatusText(schedule.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(schedule.priority)}`}>
                        {getPriorityText(schedule.priority)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Data agendada:</span> {new Date(schedule.scheduled_date).toLocaleDateString('pt-BR')}
                    </div>
                    {schedule.completed_date && (
                      <div>
                        <span className="font-medium">Concluído em:</span> {new Date(schedule.completed_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Módulo:</span> {getModuleName(schedule.arduino_module_id)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {schedule.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteSchedule(schedule.id)}
                        className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                      >
                        <CheckCircle size={16} />
                        Concluir
                      </button>
                    )}
                    <button
                      onClick={() => openEditSchedule(schedule)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="text-red-600 hover:text-red-700 p-1"
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
              {editingSchedule ? 'Editar Manutenção' : 'Nova Manutenção'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Vistoria mensal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrição opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Agendada
                </label>
                <input
                  type="date"
                  value={scheduleForm.scheduled_date}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={scheduleForm.priority}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Módulo (opcional)
                </label>
                <select
                  value={scheduleForm.arduino_module_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, arduino_module_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Manutenção geral</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingSchedule(null);
                  setScheduleForm({
                    title: '',
                    description: '',
                    scheduled_date: '',
                    priority: 'medium',
                    arduino_module_id: ''
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSchedule}
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
