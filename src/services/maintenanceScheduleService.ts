import apiService from './apiService';
import { Sector } from './sectorService';
import { ArduinoModule } from './arduinoModuleService';

export interface MaintenanceSchedule {
  _id: string;
  title: string;
  description?: string;
  sector_id: string | Sector;
  arduino_module_id?: string | ArduinoModule;
  user_id: string;
  scheduled_date: string;
  completed_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration?: number;
  actual_duration?: number;
  assigned_to?: string;
  notes?: string;
  recurring: {
    enabled: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceScheduleData {
  title: string;
  description?: string;
  sector_id: string;
  arduino_module_id?: string;
  scheduled_date: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration?: number;
  assigned_to?: string;
  recurring?: {
    enabled: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval?: number;
  };
}

export interface UpdateMaintenanceScheduleData {
  title: string;
  description?: string;
  scheduled_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration?: number;
  assigned_to?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  notes?: string;
  actual_duration?: number;
}

export interface CompleteMaintenanceData {
  actual_duration?: number;
  notes?: string;
}

export interface MaintenanceScheduleFilters {
  sector_id?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
}

class MaintenanceScheduleService {
  /**
   * Buscar todos os cronogramas de manutenção do usuário
   */
  async getMaintenanceSchedules(filters?: MaintenanceScheduleFilters): Promise<MaintenanceSchedule[]> {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.sector_id) params.sector_id = filters.sector_id;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
    }
    
    return apiService.get<MaintenanceSchedule[]>('/maintenance-schedules', Object.keys(params).length > 0 ? params : undefined);
  }

  /**
   * Buscar cronograma de manutenção específico por ID
   */
  async getMaintenanceScheduleById(id: string): Promise<MaintenanceSchedule> {
    return apiService.get<MaintenanceSchedule>(`/maintenance-schedules/${id}`);
  }

  /**
   * Criar novo cronograma de manutenção
   */
  async createMaintenanceSchedule(data: CreateMaintenanceScheduleData): Promise<MaintenanceSchedule> {
    return apiService.post<MaintenanceSchedule>('/maintenance-schedules', data);
  }

  /**
   * Atualizar cronograma de manutenção existente
   */
  async updateMaintenanceSchedule(id: string, data: UpdateMaintenanceScheduleData): Promise<MaintenanceSchedule> {
    return apiService.put<MaintenanceSchedule>(`/maintenance-schedules/${id}`, data);
  }

  /**
   * Marcar cronograma de manutenção como completo
   */
  async completeMaintenanceSchedule(id: string, data?: CompleteMaintenanceData): Promise<MaintenanceSchedule> {
    return apiService.put<MaintenanceSchedule>(`/maintenance-schedules/${id}/complete`, data);
  }

  /**
   * Deletar cronograma de manutenção
   */
  async deleteMaintenanceSchedule(id: string): Promise<void> {
    return apiService.delete<void>(`/maintenance-schedules/${id}`);
  }
}

export default new MaintenanceScheduleService();
