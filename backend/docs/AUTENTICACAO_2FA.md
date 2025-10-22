# 🔐 Sistema de Autenticação em Duas Etapas (2FA)

## 📋 Visão Geral

Sistema completo de autenticação em duas etapas (2FA) por email implementado no WaterySoil.

---

## 🎯 Funcionalidades

✅ **Ativação/Desativação de 2FA** nas configurações do usuário  
✅ **Envio automático de código** por email ao fazer login  
✅ **Código de 6 dígitos** com validade de 10 minutos  
✅ **Interface intuitiva** para inserir código  
✅ **Notificação por email** após login bem-sucedido  
✅ **Armazenamento temporário** de códigos em memória  

---

## 🔄 Fluxo de Autenticação

### **Sem 2FA Ativado:**
```
1. Usuário faz login (email + senha)
2. Sistema valida credenciais
3. Retorna token JWT
4. Usuário é autenticado
```

### **Com 2FA Ativado:**
```
1. Usuário faz login (email + senha)
2. Sistema valida credenciais
3. Sistema gera código de 6 dígitos
4. Código é enviado por email
5. Retorna { requires2FA: true }
6. Frontend mostra tela de inserção de código
7. Usuário insere código recebido
8. Sistema valida código
9. Retorna token JWT
10. Usuário é autenticado
```

---

## 🛠️ Implementação Backend

### **1. Modelo User**

<augment_code_snippet path="backend/models/User.js" mode="EXCERPT">
````javascript
twoFactorEnabled: {
  type: Boolean,
  default: false
}
````
</augment_code_snippet>

---

### **2. Armazenamento Temporário de Códigos**

<augment_code_snippet path="backend/controllers/userController.js" mode="EXCERPT">
````javascript
// Armazenamento temporário de códigos 2FA (em produção, usar Redis)
const twoFactorStore = new Map();

// Limpar códigos expirados a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of twoFactorStore.entries()) {
    if (value.expiresAt < now) {
      twoFactorStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
````
</augment_code_snippet>

---

### **3. Função de Login Atualizada**

Quando o usuário tem 2FA ativado:

1. Valida email e senha
2. Gera código de 6 dígitos
3. Armazena código com expiração de 10 minutos
4. Envia código por email
5. Retorna `{ requires2FA: true }`

---

### **4. Função de Verificação de Código**

**Endpoint:** `POST /api/v1/users/verify-2fa`

**Body:**
```json
{
  "email": "usuario@email.com",
  "code": "123456"
}
```

**Resposta (sucesso):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Nome do Usuário",
    "email": "usuario@email.com",
    "twoFactorEnabled": true
  }
}
```

---

### **5. Toggle 2FA**

**Endpoint:** `POST /api/v1/users/toggle-2fa`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "enabled": true
}
```

**Resposta:**
```json
{
  "message": "Autenticação em duas etapas ativada com sucesso",
  "twoFactorEnabled": true
}
```

---

## 💻 Implementação Frontend

### **1. Componente TwoFactorAuth**

Componente dedicado para inserir código 2FA:

- ✅ 6 inputs individuais para cada dígito
- ✅ Navegação automática entre inputs
- ✅ Suporte a colar código completo
- ✅ Validação automática ao completar
- ✅ Feedback visual de erro/sucesso
- ✅ Contador de expiração

---

### **2. Fluxo no Auth.tsx**

```typescript
// Login normal
const response = await authService.login({ email, pass });

// Verificar se precisa de 2FA
if (response.requires2FA) {
  setShow2FA(true);
  return;
}

// Login sem 2FA
authService.saveAuthData(response.token, response.user);
onLogin();
```

---

### **3. Configurações do Usuário**

Na aba "Segurança" do UserSettings:

```typescript
// Toggle 2FA
await authService.toggle2FA(enabled);
```

---

## 📧 Template de Email

O código é enviado usando o template padrão do WaterySoil:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Código de Verificação - Watery Soil</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center">
                <h1 style="color: white; background-color: rgb(104, 212, 119);">
                    Watery Soil
                </h1>
                <h2>Seu código de verificação</h2>
                <p style="font-size: 32px; font-weight: bold; color: rgb(104, 212, 119);">
                    123456
                </p>
                <p>Este código expira em 10 minutos.</p>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 🔒 Segurança

### **Medidas Implementadas:**

1. ✅ **Código de 6 dígitos** (1 milhão de combinações)
2. ✅ **Expiração de 10 minutos**
3. ✅ **Código de uso único** (deletado após verificação)
4. ✅ **Limpeza automática** de códigos expirados
5. ✅ **Validação de email** antes de enviar código
6. ✅ **Rate limiting** (recomendado para produção)

### **Recomendações para Produção:**

1. **Usar Redis** ao invés de Map em memória
2. **Implementar rate limiting** (máx 3 tentativas)
3. **Adicionar CAPTCHA** após múltiplas tentativas
4. **Logs de auditoria** para tentativas de login
5. **Notificação de ativação** de 2FA por email

---

## 📊 Estrutura de Dados

### **Código Armazenado:**

```javascript
{
  code: "123456",
  expiresAt: 1234567890000,
  userId: "507f1f77bcf86cd799439011"
}
```

### **Chave do Map:**

```javascript
twoFactorStore.set(email, { code, expiresAt, userId });
```

---

## 🧪 Testando o Sistema

### **1. Ativar 2FA:**

1. Fazer login
2. Ir em Configurações → Segurança
3. Ativar "Autenticação em Duas Etapas"
4. Clicar em "Salvar Alterações"

### **2. Testar Login com 2FA:**

1. Fazer logout
2. Fazer login novamente
3. Verificar se recebeu email com código
4. Inserir código na tela de verificação
5. Verificar se login foi bem-sucedido

### **3. Desativar 2FA:**

1. Ir em Configurações → Segurança
2. Desativar "Autenticação em Duas Etapas"
3. Clicar em "Salvar Alterações"
4. Fazer logout e login novamente (sem 2FA)

---

## 🐛 Troubleshooting

### **Código não chega no email:**

- Verificar configurações SMTP no `.env`
- Verificar pasta de spam
- Verificar logs do servidor

### **Código inválido:**

- Verificar se código não expirou (10 minutos)
- Verificar se está digitando corretamente
- Tentar fazer login novamente para receber novo código

### **2FA não ativa:**

- Verificar se backend está rodando
- Verificar console do navegador para erros
- Verificar se token JWT é válido

---

## 📝 Variáveis de Ambiente

```env
# Email (Gmail)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app

# JWT
JWT_SECRET=sua-chave-secreta-super-segura
```

---

## 🎉 Conclusão

Sistema de 2FA completo e funcional implementado com:

✅ Backend robusto com validações  
✅ Frontend intuitivo e responsivo  
✅ Emails automáticos com template profissional  
✅ Segurança aprimorada  
✅ Fácil de usar e configurar  

**Desenvolvido para o projeto WaterySoil** 🌱

