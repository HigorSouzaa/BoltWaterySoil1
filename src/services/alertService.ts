const API_URL = 'http://localhost:3000/api/v1';

export interface Alert {
  _id: string;
  user_id: string;
  sector_id?: {
    _id: string;
    name: string;
  } | null;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  status: 'active' | 'resolved';
  isAutomatic: boolean;
  source: 'manual' | 'humidity' | 'temperature' | 'ph' | 'system';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertData {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  sector_id?: string;
  source?: 'manual' | 'humidity' | 'temperature' | 'ph' | 'system';
}

export interface UpdateAlertData {
  type?: 'info' | 'warning' | 'error' | 'success';
  message?: string;
  status?: 'active' | 'resolved';
}

export interface AlertStats {
  total: number;
  active: number;
  resolved: number;
  byType: {
    info?: number;
    warning?: number;
    error?: number;
    success?: number;
  };
}

class AlertService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Obter todos os alertas do usuário
   */
  async getAlerts(params?: {
    status?: 'active' | 'resolved';
    type?: 'info' | 'warning' | 'error' | 'success';
    limit?: number;
  }): Promise<Alert[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `${API_URL}/alerts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar alertas');
      }

      const data = await response.json();
      return data.alerts;
    } catch (error: any) {
      console.error('Erro ao buscar alertas:', error);
      throw error;
    }
  }

  /**
   * Obter um alerta específico
   */
  async getAlertById(id: string): Promise<Alert> {
    try {
      const response = await fetch(`${API_URL}/alerts/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar alerta');
      }

      const data = await response.json();
      return data.alert;
    } catch (error: any) {
      console.error('Erro ao buscar alerta:', error);
      throw error;
    }
  }

  /**
   * Criar novo alerta
   */
  async createAlert(alertData: CreateAlertData): Promise<Alert> {
    try {
      const response = await fetch(`${API_URL}/alerts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(alertData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar alerta');
      }

      const data = await response.json();
      return data.alert;
    } catch (error: any) {
      console.error('Erro ao criar alerta:', error);
      throw error;
    }
  }

  /**
   * Atualizar alerta
   */
  async updateAlert(id: string, alertData: UpdateAlertData): Promise<Alert> {
    try {
      const response = await fetch(`${API_URL}/alerts/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(alertData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar alerta');
      }

      const data = await response.json();
      return data.alert;
    } catch (error: any) {
      console.error('Erro ao atualizar alerta:', error);
      throw error;
    }
  }

  /**
   * Deletar alerta
   */
  async deleteAlert(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/alerts/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao deletar alerta');
      }
    } catch (error: any) {
      console.error('Erro ao deletar alerta:', error);
      throw error;
    }
  }

  /**
   * Marcar alerta como resolvido
   */
  async resolveAlert(id: string): Promise<Alert> {
    try {
      const response = await fetch(`${API_URL}/alerts/${id}/resolve`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao resolver alerta');
      }

      const data = await response.json();
      return data.alert;
    } catch (error: any) {
      console.error('Erro ao resolver alerta:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de alertas
   */
  async getAlertStats(): Promise<AlertStats> {
    try {
      const response = await fetch(`${API_URL}/alerts/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar estatísticas');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export default new AlertService();

