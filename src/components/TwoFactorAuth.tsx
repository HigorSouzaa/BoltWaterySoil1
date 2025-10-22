import React, { useState, useRef, useEffect } from 'react';
import { Shield, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface TwoFactorAuthProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ 
  email, 
  onVerify, 
  onBack, 
  isLoading, 
  error 
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focar no primeiro input ao montar
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Permitir apenas números
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Mover para o próximo input se digitou um número
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Se completou todos os dígitos, submeter automaticamente
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        onVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: voltar para o input anterior
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Enter: submeter se código completo
    if (e.key === 'Enter') {
      const fullCode = code.join('');
      if (fullCode.length === 6) {
        onVerify(fullCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Verificar se é um código de 6 dígitos
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      
      // Submeter automaticamente
      onVerify(pastedData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      onVerify(fullCode);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors duration-200"
          disabled={isLoading}
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </button>

        {/* 2FA Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Icon and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verificação em Duas Etapas
            </h2>
            <p className="text-gray-600">
              Enviamos um código de 6 dígitos para
            </p>
            <p className="text-blue-600 font-semibold mt-1 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              {maskedEmail}
            </p>
          </div>

          {/* Success Message (if needed) */}
          {!error && code.join('').length === 6 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">Código completo! Verificando...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Code Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  autoComplete="off"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.join('').length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não recebeu o código?{' '}
              <button
                onClick={onBack}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 disabled:opacity-50"
              >
                Tentar novamente
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              O código expira em 10 minutos
            </p>
          </div>

          {/* Security Info */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
            <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Sua conta está protegida com autenticação em duas etapas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;

