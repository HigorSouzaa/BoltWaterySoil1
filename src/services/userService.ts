// userService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class UserService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar perfil');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    company?: string;
    position?: string;
  }, avatarFile?: File) {
    try {
      const formData = new FormData();

      // Adiciona apenas os campos que foram enviados
      Object.keys(profileData).forEach(key => {
        const value = profileData[key as keyof typeof profileData];
        if (value) {
          formData.append(key, value);
        }
      });

      // Adiciona o arquivo se existir
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar perfil');
      }

      const data = await response.json();
      
      // Atualiza o localStorage automaticamente
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async uploadAvatar(file: File) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/users/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/password`, {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao alterar senha');
      }

      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async requestEmailChange(newEmail: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/change-email`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newEmail, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao solicitar alteração de email');
      }

      return await response.json();
    } catch (error) {
      console.error('Error requesting email change:', error);
      throw error;
    }
  }

  async verifyEmailToken(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/verify-email-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao verificar token');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying email token:', error);
      throw error;
    }
  }
}

// Exporta uma instância única (Singleton)
export const userService = new UserService();
