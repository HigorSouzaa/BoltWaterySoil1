// Exemplo de como usar o sistema de notificações

import { useNotification } from '../contexts/NotificationContext';

// Dentro de um componente React:
export const ExemploDeUso = () => {
  const notification = useNotification();

  const handleSuccess = () => {
    notification.success(
      'Operação realizada!',
      'Seus dados foram salvos com sucesso.'
    );
  };

  const handleError = () => {
    notification.error(
      'Erro ao processar!',
      'Não foi possível completar a operação. Tente novamente.'
    );
  };

  const handleWarning = () => {
    notification.warning(
      'Atenção!',
      'Você está prestes a realizar uma ação irreversível.'
    );
  };

  const handleInfo = () => {
    notification.info(
      'Informação',
      'Novos recursos foram adicionados ao sistema.',
      10000 // duração personalizada de 10 segundos
    );
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Exemplo de Notificações</h2>
      
      <div className="space-x-2">
        <button
          onClick={handleSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Mostrar Sucesso
        </button>

        <button
          onClick={handleError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Mostrar Erro
        </button>

        <button
          onClick={handleWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Mostrar Aviso
        </button>

        <button
          onClick={handleInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Mostrar Info
        </button>
      </div>
    </div>
  );
};

// Uso em componentes existentes:

// Exemplo 1: No UserSettings
import { useNotification } from '../contexts/NotificationContext';

const handleSaveProfile = async () => {
  const notification = useNotification();
  
  try {
    await userService.updateProfile(data);
    notification.success('Perfil atualizado!', 'Suas informações foram salvas com sucesso.');
  } catch (error) {
    notification.error('Erro ao salvar', 'Não foi possível atualizar seu perfil. Tente novamente.');
  }
};

// Exemplo 2: No Login
const handleLogin = async () => {
  const notification = useNotification();
  
  try {
    await authService.login(credentials);
    notification.success('Bem-vindo!', 'Login realizado com sucesso.');
  } catch (error) {
    notification.error('Falha no login', 'Email ou senha incorretos.');
  }
};

// Exemplo 3: Avisos personalizados
const handleDeleteItem = () => {
  const notification = useNotification();
  
  notification.warning(
    'Confirmação necessária',
    'Tem certeza que deseja excluir este item?'
  );
};

// Exemplo 4: Informações do sistema
const showSystemInfo = () => {
  const notification = useNotification();
  
  notification.info(
    'Atualização disponível',
    'Uma nova versão do sistema está disponível.',
    0 // 0 = não fecha automaticamente
  );
};
