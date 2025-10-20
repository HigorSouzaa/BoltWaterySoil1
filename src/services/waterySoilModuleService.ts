import apiService from './apiService';
import { Sector } from './sectorService';

export interface WaterySoilModule {
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

export interface CreateWaterySoilModuleData {
  name: string;
  module_type: 'sensor' | 'actuator' | 'controller' | 'monitor';
  sector_id: string;
  ip_address?: string;
  mac_address?: string;
  configuration?: Record<string, any>;
  firmware_version?: string;
}

export interface UpdateWaterySoilModuleData {
  name: string;
  module_type?: 'sensor' | 'actuator' | 'controller' | 'monitor';
  ip_address?: string;
  mac_address?: string;
  configuration?: Record<string, any>;
  firmware_version?: string;
  status?: 'operational' | 'offline' | 'error' | 'maintenance';
}

class WaterySoilModuleService {
  /**
   * Buscar todos os módulos WaterySoil do usuário
   * @param sectorId - Filtrar por setor específico (opcional)
   * @param status - Filtrar por status específico (opcional)
   */
  async getWaterySoilModules(sectorId?: string, status?: string): Promise<WaterySoilModule[]> {
    const params: Record<string, string> = {};
    if (sectorId) params.sector_id = sectorId;
    if (status) params.status = status;

    return apiService.get<WaterySoilModule[]>('/waterysoil-modules', Object.keys(params).length > 0 ? params : undefined);
  }

  /**
   * Buscar módulo WaterySoil específico por ID
   */
  async getWaterySoilModuleById(id: string): Promise<WaterySoilModule> {
    return apiService.get<WaterySoilModule>(`/waterysoil-modules/${id}`);
  }

  /**
   * Criar novo módulo WaterySoil
   */
  async createWaterySoilModule(data: CreateWaterySoilModuleData): Promise<WaterySoilModule> {
    return apiService.post<WaterySoilModule>('/waterysoil-modules', data);
  }

  /**
   * Atualizar módulo WaterySoil existente
   */
  async updateWaterySoilModule(id: string, data: UpdateWaterySoilModuleData): Promise<WaterySoilModule> {
    return apiService.put<WaterySoilModule>(`/waterysoil-modules/${id}`, data);
  }

  /**
   * Fazer ping no módulo WaterySoil
   */
  async pingWaterySoilModule(id: string): Promise<WaterySoilModule> {
    return apiService.put<WaterySoilModule>(`/waterysoil-modules/${id}/ping`);
  }

  /**
   * Deletar módulo WaterySoil (soft delete)
   */
  async deleteWaterySoilModule(id: string): Promise<void> {
    return apiService.delete<void>(`/waterysoil-modules/${id}`);
  }
}

export default new WaterySoilModuleService();
