import React, { useState, useEffect } from "react";
import {
  User,
  Bell,
  Globe,
  Palette,
  Save,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Settings,
  Camera,
} from "lucide-react";
// UserSettings será implementado posteriormente - por enquanto removendo dependência do Supabase
import { userService } from "../services/userService";
import { useNotification } from "../contexts/NotificationContext";

interface UserPreferences {
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  language: string;
  settings: any;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  company: string;
  position: string;
  avatar: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  allowedIPs: string[];
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const UserSettings: React.FC = () => {
  const notification = useNotification();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences" | "notifications"
  >("profile");
  const [preferences, setPreferences] = useState<UserPreferences>({
    user_id: "",
    theme: "light",
    notifications_enabled: true,
    language: "pt-BR",
    settings: {},
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    company: "",
    position: "",
    avatar: "",
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
    allowedIPs: [],
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Limpa o URL da preview quando o componente for desmontado ou quando mudar a imagem
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Limpa a URL anterior se existir
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Cria um novo URL temporário para a preview da imagem
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    }
  };

  const loadUserData = async () => {
    try {
      const data = await userService.getProfile();
      setUserProfile(data.user);

      // Carregar configuração de 2FA do usuário
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: data.user.twoFactorEnabled || false
      }));
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // No componente onde carrega o perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getProfile();
        console.log("Avatar recebido:", data.user.avatar?.substring(0, 50)); // Mostra início da string
        setUserProfile(data.user);

        // Carregar configuração de 2FA do usuário
        setSecuritySettings(prev => ({
          ...prev,
          twoFactorEnabled: data.user.twoFactorEnabled || false
        }));
      } catch (error) {
        console.error(error);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const data = await userService.updateProfile(
        {
          name: userProfile.name,
          phone: userProfile.phone,
          address: userProfile.address,
          birthDate: userProfile.birthDate,
          company: userProfile.company,
          position: userProfile.position,
        },
        selectedFile || undefined
      );

      // Atualiza o perfil com os dados do servidor
      setUserProfile(data.user);

      // Limpa estados relacionados ao arquivo
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);

      notification.success('Perfil atualizado!', 'Suas informações foram salvas com sucesso.');
    } catch (error) {
      notification.error(
        'Erro ao salvar',
        error instanceof Error ? error.message : 'Não foi possível atualizar seu perfil.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
      notification.success('Preferências salvas!', 'Suas preferências foram atualizadas.');
    } catch (error) {
      console.error("Error saving preferences:", error);
      notification.error('Erro ao salvar', 'Não foi possível salvar as preferências.');
    } finally {
      setSaving(false);
    }
  };

  // Função para obter o nome formatado para exibição
  const getDisplayName = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(" ");
    return parts.length > 1
      ? `${parts[0]} ${parts[parts.length - 1]}`
      : parts[0];
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    try {
      // Importar authService dinamicamente
      const authService = (await import('../services/authService')).default;

      // Atualizar 2FA no backend
      await authService.toggle2FA(securitySettings.twoFactorEnabled);

      // Salvar outras configurações localmente
      localStorage.setItem(
        "securitySettings",
        JSON.stringify(securitySettings)
      );

      notification.success(
        'Segurança atualizada!',
        `Autenticação em duas etapas ${securitySettings.twoFactorEnabled ? 'ativada' : 'desativada'} com sucesso.`
      );
    } catch (error) {
      console.error("Error saving security settings:", error);
      notification.error(
        'Erro ao salvar',
        error instanceof Error ? error.message : 'Não foi possível salvar as configurações de segurança.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notification.warning('Senhas não coincidem', 'A nova senha e a confirmação devem ser iguais.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      notification.warning('Senha muito curta', 'A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setSaving(true);
    try {
      await userService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      notification.success('Senha alterada!', 'Sua senha foi atualizada com sucesso.');
    } catch (error: any) {
      notification.error('Erro ao alterar senha', error.message || 'Não foi possível alterar a senha.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings size={28} />
            Configurações do Usuário
          </h2>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "profile", label: "Perfil", icon: User },
              { id: "security", label: "Segurança", icon: Shield },
              { id: "preferences", label: "Preferências", icon: Palette },
              { id: "notifications", label: "Notificações", icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Avatar Section */}
                <div className="lg: col-span-1">
                  <div className="bg-gray-50 rounded-lg p-6 text-center h-full flex flex-col justify-center">
                    <div className="relative inline-block">
                      <div className="relative w-52 h-52 rounded-full overflow-hidden mx-auto mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-4xl font-bold">
                          {!previewUrl &&
                            !userProfile.avatar &&
                            (userProfile.name
                              ? userProfile.name.charAt(0).toUpperCase()
                              : "U")}
                        </div>
                        {(previewUrl || userProfile.avatar) && (
                          <img
                            src={previewUrl || userProfile.avatar}
                            alt="Avatar"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              console.error("Erro ao carregar imagem:", e);
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </div>

                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="avatar-upload">
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("avatar-upload")?.click()
                          }
                          className="absolute bottom-0 right-14 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          <Camera size={32} />
                        </button>
                      </label>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mt-5">
                      {userProfile.name
                        ? getDisplayName(userProfile.name)
                        : "Nome do Usuário"}
                    </h3>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="inline mr-1" />
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail size={16} className="inline mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={userProfile.email}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="seu@email.com"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone size={16} className="inline mr-1" />
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={userProfile.phone}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={userProfile.birthDate}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            birthDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin size={16} className="inline mr-1" />
                        Endereço
                      </label>
                      <input
                        type="text"
                        value={userProfile.address}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Seu endereço completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        value={userProfile.company}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            company: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome da empresa"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cargo
                      </label>
                      <input
                        type="text"
                        value={userProfile.position}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            position: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Seu cargo"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Save size={16} />
                      {saving ? "Salvando..." : "Salvar Perfil"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock size={20} />
                  Alterar Senha
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite a nova senha"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirme a nova senha"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={
                      saving ||
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword
                    }
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Key size={16} />
                    {saving ? "Alterando..." : "Alterar Senha"}
                  </button>
                </div>
              </div>

            

              {/* Two-Factor Authentication */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Smartphone size={20} />
                  Autenticação de Dois Fatores
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Ativar 2FA</p>
                    <p className="text-sm text-gray-600">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorEnabled}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorEnabled: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Login Notifications */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell size={20} />
                  Notificações de Login
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        Notificar sobre novos logins
                      </p>
                      <p className="text-sm text-gray-600">
                        Receba um email quando alguém fizer login na sua conta
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.loginNotifications}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            loginNotifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout da Sessão (minutos)
                    </label>
                    <select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={120}>2 horas</option>
                      <option value={480}>8 horas</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveSecurity}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {saving ? "Salvando..." : "Salvar Segurança"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette size={20} />
                  Aparência
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema
                  </label>
                  <select
                    value={preferences.theme}
                    onChange={(e) =>
                      setPreferences({ ...preferences, theme: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe size={20} />
                  Idioma
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma do sistema
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        language: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {saving ? "Salvando..." : "Salvar Preferências"}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell size={20} />
                  Configurações de Notificação
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        Notificações Gerais
                      </p>
                      <p className="text-sm text-gray-600">
                        Receba alertas sobre manutenção e status dos módulos
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications_enabled}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            notifications_enabled: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-3">
                      Tipos de Notificação
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          key: "maintenance",
                          label: "Alertas de Manutenção",
                          desc: "Notificações sobre manutenções programadas e atrasadas",
                        },
                        {
                          key: "sensors",
                          label: "Alertas de Sensores",
                          desc: "Notificações quando sensores detectam valores anômalos",
                        },
                        {
                          key: "system",
                          label: "Alertas do Sistema",
                          desc: "Notificações sobre status do sistema e módulos offline",
                        },
                        {
                          key: "reports",
                          label: "Relatórios",
                          desc: "Receba relatórios periódicos por email",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-700">
                              {item.label}
                            </p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked={true}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {saving ? "Salvando..." : "Salvar Notificações"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
