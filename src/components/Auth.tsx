import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // Import atualizado
import TwoFactorAuth from "./TwoFactorAuth";
import authService from "../services/authService";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAEmail, setTwoFAEmail] = useState("");
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        password: savedPassword,
      }));
      setRememberMe(true);
    }
  }, []);

  // Limpar erro quando trocar de modo (login/registro)
  useEffect(() => {
    clearError();
    setTwoFAError(null);
    setLoginError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevenir múltiplos cliques
    if (loginLoading || isLoading) return;

    // Limpar erros anteriores
    setLoginError(null);
    clearError();

    try {
      if (isLogin) {
        setLoginLoading(true);

        // Primeiro, verificar se precisa de 2FA
        const response = await authService.login({
          email: formData.email,
          pass: formData.password,
        });

        // Verificar se precisa de 2FA
        if (response.requires2FA) {
          setTwoFAEmail(formData.email);
          setShow2FA(true);
          setLoginLoading(false);
          return;
        }

        // Login normal sem 2FA
        if (response.token && response.user) {
          // Salvar credenciais se "Lembrar de mim" estiver marcado
          if (rememberMe) {
            localStorage.setItem("rememberedEmail", formData.email);
            localStorage.setItem("rememberedPassword", formData.password);
          } else {
            // Limpar credenciais salvas se desmarcado
            localStorage.removeItem("rememberedEmail");
            localStorage.removeItem("rememberedPassword");
          }

          authService.saveAuthData(response.token, response.user);
          setLoginLoading(false);
          navigate("/dashboard");
        } else {
          throw new Error("Resposta inválida do servidor");
        }
      } else {
        // Registro - usar o hook do contexto
        await register({
          name: formData.name,
          email: formData.email,
          pass: formData.password,
        });

        // Sucesso - redirecionar para dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setLoginLoading(false);
      // Capturar e mostrar o erro
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao fazer login";
      setLoginError(errorMessage);
      console.error("Erro na autenticação:", err);
    }
  };

  const handleVerify2FA = async (code: string) => {
    setTwoFALoading(true);
    setTwoFAError(null);

    try {
      const response = await authService.verify2FA(twoFAEmail, code);

      if (response.token && response.user) {
        authService.saveAuthData(response.token, response.user);
        navigate("/dashboard");
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (err) {
      setTwoFAError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleBack2FA = () => {
    setShow2FA(false);
    setTwoFAEmail("");
    setTwoFAError(null);
    setFormData({ ...formData, password: "" });
  };

  // Se está mostrando 2FA, renderizar componente 2FA
  if (show2FA) {
    return (
      <TwoFactorAuth
        email={twoFAEmail}
        onVerify={handleVerify2FA}
        onBack={handleBack2FA}
        isLoading={twoFALoading}
        error={twoFAError}
      />
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearError();
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar ao início
        </button>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img
                src="/images/logo.png"
                alt="ECO-SOIL PRO - Vista frontal em campo"
                className="w-10"
              ></img>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                WaterySoil
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? "Bem-vindo de volta!" : "Comece sua jornada"}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? "Entre na sua conta para acessar o dashboard"
                : "Crie sua conta e transforme sua agricultura"}
            </p>
          </div>

          {/* Error Message */}
          {(error || loginError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{loginError || error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading || loginLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading || loginLoading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading || loginLoading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Lembrar de mim
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Esqueceu a senha?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || loginLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading || loginLoading
                ? "Carregando..."
                : isLogin
                ? "Entrar"
                : "Criar Conta"}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <button
                onClick={toggleAuthMode}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 disabled:opacity-50"
              >
                {isLogin ? "Cadastre-se" : "Entre aqui"}
              </button>
            </p>
          </div>

          {/* Social Proof */}
          <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-green-600">+2,500</span>{" "}
              produtores já estão usando o WaterySoil
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
