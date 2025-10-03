import apiService from './apiService';
import { Sector } from './sectorService';

export interface ArduinoModule {
  _id: string;
  name: string;
  module_type: 'sensor' | 'actuator' | 'controller' | 'monitor';
  sector_id: string | Sector;
  user_id: string;
  status: 'operational' | 'offline' | 'error' | 'maintenance';
  ip_address?: string;
  mac_address?: string;
  last_ping?: string;
  configuration: Record<string, any>;
  firmware_version?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArduinoModuleData {
  name: string;
  module_type: 'sensor' | 'actuator' | 'controller' | 'monitor';
  sector_id: string;
  ip_address?: string;
  mac_address?: string;
  configuration?: Record<string, any>;
  firmware_version?: string;
}

export interface UpdateArduinoModuleData {
  name: string;
  module_type?: 'sensor' | 'actuator' | 'controller' | 'monitor';
  ip_address?: string;
  mac_address?: string;
  configuration?: Record<string, any>;
  firmware_version?: string;
  status?: 'operational' | 'offline' | 'error' | 'maintenance';
}

class ArduinoModuleService {
  /**
   * Buscar todos os módulos Arduino do usuário
   * @param sectorId - Filtrar por setor específico (opcional)
   * @param status - Filtrar por status específico (opcional)
   */
  async getArduinoModules(sectorId?: string, status?: string): Promise<ArduinoModule[]> {
    const params: Record<string, string> = {};
    if (sectorId) params.sector_id = sectorId;
    if (status) params.status = status;
    
    return apiService.get<ArduinoModule[]>('/arduino-modules', Object.keys(params).length > 0 ? params : undefined);
  }

  /**
   * Buscar módulo Arduino específico por ID
   */
  async getArduinoModuleById(id: string): Promise<ArduinoModule> {
    return apiService.get<ArduinoModule>(`/arduino-modules/${id}`);
  }

  /**
   * Criar novo módulo Arduino
   */
  async createArduinoModule(data: CreateArduinoModuleData): Promise<ArduinoModule> {
    return apiService.post<ArduinoModule>('/arduino-modules', data);
  }

  /**
   * Atualizar módulo Arduino existente
   */
  async updateArduinoModule(id: string, data: UpdateArduinoModuleData): Promise<ArduinoModule> {
    return apiService.put<ArduinoModule>(`/arduino-modules/${id}`, data);
  }

  /**
   * Fazer ping no módulo Arduino
   */
  async pingArduinoModule(id: string): Promise<ArduinoModule> {
    return apiService.put<ArduinoModule>(`/arduino-modules/${id}/ping`);
  }

  /**
   * Deletar módulo Arduino (soft delete)
   */
  async deleteArduinoModule(id: string): Promise<void> {
    return apiService.delete<void>(`/arduino-modules/${id}`);
  }
}

export default new ArduinoModuleService();
