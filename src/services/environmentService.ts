import apiService from './apiService';

export interface Environment {
  _id: string;
  name: string;
  description?: string;
  user_id: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironmentData {
  name: string;
  description?: string;
}

export interface UpdateEnvironmentData {
  name: string;
  description?: string;
}

class EnvironmentService {
  /**
   * Buscar todos os ambientes do usuário
   */
  async getEnvironments(): Promise<Environment[]> {
    return apiService.get<Environment[]>('/environments');
  }

  /**
   * Buscar ambiente específico por ID
   */
  async getEnvironmentById(id: string): Promise<Environment> {
    return apiService.get<Environment>(`/environments/${id}`);
  }

  /**
   * Criar novo ambiente
   */
  async createEnvironment(data: CreateEnvironmentData): Promise<Environment> {
    return apiService.post<Environment>('/environments', data);
  }

  /**
   * Atualizar ambiente existente
   */
  async updateEnvironment(id: string, data: UpdateEnvironmentData): Promise<Environment> {
    return apiService.put<Environment>(`/environments/${id}`, data);
  }

  /**
   * Deletar ambiente (soft delete)
   */
  async deleteEnvironment(id: string): Promise<void> {
    return apiService.delete<void>(`/environments/${id}`);
  }
}

export default new EnvironmentService();
