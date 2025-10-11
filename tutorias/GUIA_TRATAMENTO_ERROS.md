# 📚 Guia de Tratamento de Erros da API

## Como Funciona o Fluxo de Erros

### 1. Backend (API) 
O backend retorna um JSON com a mensagem de erro:
```javascript
// Exemplo no backend
return res.status(400).json({ 
  message: "Já existe um módulo com este nome neste setor" 
});
```

### 2. ApiService (Frontend)
O `apiService.ts` intercepta a resposta e lança um `Error`:
```typescript
private async handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  // ...
}
```

### 3. Componente (onde você chama a API)
O erro é capturado no `catch` como um objeto `Error`:
```typescript
try {
  await arduinoModuleService.createArduinoModule(data);
} catch (error) {
  // Aqui o 'error' é um objeto Error, não uma string!
  // error.message contém a mensagem "Já existe um módulo..."
}
```

## ✅ Como Tratar Corretamente

### Opção 1: Tratamento Simples (Recomendado)
```typescript
try {
  await arduinoModuleService.createArduinoModule(data);
  notification.success('Sucesso!', 'Módulo criado com sucesso.');
} catch (error) {
  // Mostra a mensagem de erro que veio da API
  if (error instanceof Error) {
    notification.error('Erro ao salvar módulo', error.message);
  } else {
    notification.error('Erro', 'Ocorreu um erro inesperado.');
  }
}
```

### Opção 2: Tratamento com Mensagens Específicas
```typescript
try {
  await arduinoModuleService.createArduinoModule(data);
  notification.success('Sucesso!', 'Módulo criado com sucesso.');
} catch (error) {
  if (error instanceof Error) {
    // Verifica mensagens específicas da API
    if (error.message.includes('já existe')) {
      notification.warning('Módulo duplicado', 'Já existe um módulo com este nome neste setor.');
    } else if (error.message.includes('não encontrado')) {
      notification.error('Não encontrado', 'Setor não encontrado.');
    } else {
      notification.error('Erro ao salvar', error.message);
    }
  } else {
    notification.error('Erro', 'Ocorreu um erro inesperado.');
  }
}
```

### Opção 3: Tratamento por Status HTTP
Se você quiser tratar por código de status, precisa modificar o `apiService.ts`:

```typescript
// apiService.ts modificado
class ApiError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

private async handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  const data = await response.json();
  return data.data || data;
}
```

Depois no componente:
```typescript
try {
  await arduinoModuleService.createArduinoModule(data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      notification.warning('Dados inválidos', error.message);
    } else if (error.status === 404) {
      notification.error('Não encontrado', error.message);
    } else if (error.status === 500) {
      notification.error('Erro no servidor', 'Tente novamente mais tarde.');
    } else {
      notification.error('Erro', error.message);
    }
  }
}
```

## 🎯 Melhores Práticas

### 1. Sempre use `instanceof Error`
```typescript
// ❌ ERRADO
if (error == "mensagem") { }

// ✅ CORRETO
if (error instanceof Error) {
  console.log(error.message);
}
```

### 2. Sempre mostre feedback ao usuário
```typescript
try {
  await salvarDados();
  notification.success('Sucesso!', 'Dados salvos.');
} catch (error) {
  if (error instanceof Error) {
    notification.error('Erro', error.message);
  }
}
```

### 3. Sempre faça log do erro completo
```typescript
catch (error) {
  console.error('Erro completo:', error); // Log para debug
  if (error instanceof Error) {
    notification.error('Erro', error.message); // Mensagem para usuário
  }
}
```

## 📝 Exemplos Práticos

### Criar Módulo Arduino
```typescript
const handleSaveModule = async () => {
  try {
    if (editingModule) {
      await arduinoModuleService.updateArduinoModule(editingModule._id, moduleData);
      notification.success('Atualizado!', 'Módulo atualizado com sucesso.');
    } else {
      await arduinoModuleService.createArduinoModule(moduleData);
      notification.success('Criado!', 'Módulo criado com sucesso.');
    }
    
    setShowModal(false);
    loadModules();
    
  } catch (error) {
    console.error('Error saving module:', error);
    
    if (error instanceof Error) {
      // A mensagem já vem formatada da API
      notification.error('Erro ao salvar módulo', error.message);
    } else {
      notification.error('Erro', 'Ocorreu um erro inesperado.');
    }
  }
};
```

### Deletar Módulo
```typescript
const handleDeleteModule = async (id: string) => {
  try {
    await arduinoModuleService.deleteArduinoModule(id);
    notification.success('Deletado!', 'Módulo removido com sucesso.');
    loadModules();
  } catch (error) {
    console.error('Error deleting module:', error);
    
    if (error instanceof Error) {
      notification.error('Erro ao deletar', error.message);
    } else {
      notification.error('Erro', 'Não foi possível deletar o módulo.');
    }
  }
};
```

### Login
```typescript
const handleLogin = async () => {
  try {
    const response = await authService.login(credentials);
    notification.success('Bem-vindo!', `Olá, ${response.user.name}!`);
    navigate('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('incorretos')) {
        notification.error('Credenciais inválidas', 'Email ou senha incorretos.');
      } else {
        notification.error('Erro no login', error.message);
      }
    } else {
      notification.error('Erro', 'Não foi possível fazer login.');
    }
  }
};
```

## 🔍 Resumo

1. **Backend** retorna `{ message: "..." }`
2. **ApiService** lança `new Error(message)`
3. **Componente** captura com `catch (error)`
4. **Verificar** com `if (error instanceof Error)`
5. **Usar** `error.message` para obter a mensagem
6. **Mostrar** com `notification.error('Título', error.message)`

## 💡 Dica Final

A mensagem de erro que você definiu no backend **já vem pronta** através de `error.message`.
Você não precisa comparar strings, apenas mostrar a mensagem que veio da API!

```typescript
// ❌ Não faça isso
if (error.message === "Já existe um módulo...") {
  notification.error('Erro', 'Já existe um módulo...');
}

// ✅ Faça isso
notification.error('Erro ao salvar', error.message);
// A mensagem já vem formatada: "Já existe um módulo..."
```
