import apiService from './apiService';
import { Environment } from './environmentService';

export interface Sector {
  _id: string;
  name: string;
  description?: string;
  environment_id: string | Environment;
  user_id: string;
  is_active: boolean;
  area_size?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectorData {
  name: string;
  description?: string;
  environment_id: string;
  area_size?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface UpdateSectorData {
  name: string;
  description?: string;
  area_size?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

class SectorService {
  /**
   * Buscar todos os setores do usuário
   * @param environmentId - Filtrar por ambiente específico (opcional)
   */
  async getSectors(environmentId?: string): Promise<Sector[]> {
    const params = environmentId ? { environment_id: environmentId } : undefined;
    return apiService.get<Sector[]>('/sectors', params);
  }

  /**
   * Buscar setor específico por ID
   */
  async getSectorById(id: string): Promise<Sector> {
    return apiService.get<Sector>(`/sectors/${id}`);
  }

  /**
   * Criar novo setor
   */
  async createSector(data: CreateSectorData): Promise<Sector> {
    return apiService.post<Sector>('/sectors', data);
  }

  /**
   * Atualizar setor existente
   */
  async updateSector(id: string, data: UpdateSectorData): Promise<Sector> {
    return apiService.put<Sector>(`/sectors/${id}`, data);
  }

  /**
   * Deletar setor (soft delete)
   */
  async deleteSector(id: string): Promise<void> {
    return apiService.delete<void>(`/sectors/${id}`);
  }
}

export default new SectorService();
