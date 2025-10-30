# 🚀 Guia Rápido de Teste - Geolocalização em Login

## ⚡ Teste Rápido (5 minutos)

### 1️⃣ Testar Serviço de Geolocalização

```powershell
# No diretório raiz do projeto
cd backend
node test-geolocation.js
```

**Resultado esperado:**
```
🧪 TESTE DE GEOLOCALIZAÇÃO - WATERY SOIL
============================================================

📍 TESTE 1: Geolocalização com IP público real
------------------------------------------------------------
IP: 8.8.8.8
🌍 Tentando ip-api.com...
✅ Geolocalização obtida com sucesso!
   📍 Mountain View, California - United States

📍 TESTE 2: IP local (deve buscar IP público real)
------------------------------------------------------------
IP: 127.0.0.1
⚠️  IP local detectado, buscando IP público real...
🔍 Tentando obter IP público de: https://api.ipify.org...
✅ IP público encontrado: 177.45.XXX.XXX
✅ Geolocalização obtida com sucesso!
   📍 Sua Cidade, Seu Estado - Brazil

✅ TESTES CONCLUÍDOS!
```

---

### 2️⃣ Testar Login Completo

#### A) Inicie o backend

```powershell
# Terminal 1
cd backend
npm run dev
```

#### B) Faça um login via API

**Opção 1: Usando cURL (PowerShell)**

```powershell
curl -X POST http://localhost:3000/api/user/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"seu-email@exemplo.com\",\"pass\":\"sua-senha\"}'
```

**Opção 2: Usando Thunder Client / Postman**

```
POST http://localhost:3000/api/user/login
Content-Type: application/json

{
  "email": "seu-email@exemplo.com",
  "pass": "sua-senha"
}
```

**Opção 3: Via Frontend**
- Inicie o frontend: `npm run dev`
- Acesse: `http://localhost:5173`
- Faça login normalmente

---

### 3️⃣ Verificar Email

1. **Abra sua caixa de email**
2. Procure email com assunto: **"✅ Novo Login Detectado - WaterySoil"**
3. Confira se aparecem:
   - ✅ Seu IP
   - ✅ Sua cidade/estado/país
   - ✅ Seu provedor de internet
   - ✅ Fuso horário
   - ✅ Data/hora do login

---

## 🔍 Verificar Logs do Backend

No terminal onde o backend está rodando, você verá:

```
🔐 Login do usuário: usuario@exemplo.com
🌐 IP detectado: ::ffff:127.0.0.1
⚠️  IP local detectado, buscando IP público real...
🔍 Tentando obter IP público de: https://api.ipify.org?format=json
✅ IP público encontrado: 177.45.123.45
🎯 Buscando geolocalização para IP: 177.45.123.45
🌍 Tentando ip-api.com...
✅ Geolocalização obtida com sucesso!
   📍 São Paulo, São Paulo - Brazil
📧 Email de notificação enviado com geolocalização
```

---

## 📧 Configuração de Email (se ainda não fez)

### Gmail

1. **Habilitar "Verificação em duas etapas"**
   - Vá em: https://myaccount.google.com/security
   - Ative "Verificação em duas etapas"

2. **Criar senha de app**
   - Vá em: https://myaccount.google.com/apppasswords
   - Crie uma senha para "Email"
   - Copie a senha gerada

3. **Adicionar no `.env`**

```env
# Backend/.env
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=senha-app-gerada-aqui
EMAIL_FROM=seu-email@gmail.com
SMTP_SERVICE=gmail
```

### Outlook / Hotmail

```env
EMAIL_USER=seu-email@outlook.com
EMAIL_PASS=sua-senha
EMAIL_FROM=seu-email@outlook.com
SMTP_SERVICE=outlook
```

---

## 🧪 Cenários de Teste

### ✅ Teste 1: Login Normal (Sem 2FA)

**Passos:**
1. Usuário faz login
2. Sistema valida credenciais
3. Busca geolocalização
4. Envia email
5. Retorna token

**Verificar:**
- ✅ Login bem-sucedido
- ✅ Email recebido
- ✅ Dados de localização corretos

---

### ✅ Teste 2: Login com 2FA

**Passos:**
1. Ative 2FA no seu usuário
2. Faça login
3. Receba código 2FA
4. Valide código
5. Receba email com localização

**Verificar:**
- ✅ Código 2FA recebido primeiro
- ✅ Após validar, email de login recebido
- ✅ Dados de localização corretos

---

### ✅ Teste 3: IP Local (Desenvolvimento)

**Passos:**
1. Login em localhost (127.0.0.1)
2. Sistema detecta IP local
3. Busca IP público real
4. Usa IP público para geolocalização

**Verificar:**
- ✅ Log mostra "IP local detectado"
- ✅ Log mostra "IP público encontrado"
- ✅ Email mostra seu IP público real
- ✅ Localização correta

---

### ✅ Teste 4: Falha nas APIs

**Simular:**
```javascript
// backend/services/geolocation.js
// Comentar temporariamente todas as APIs
```

**Verificar:**
- ✅ Login ainda funciona
- ✅ Email enviado com dados "Desconhecido"
- ✅ Sistema não trava

---

## 🎯 Checklist Completo

- [ ] Backend iniciado sem erros
- [ ] Teste de geolocalização executado
- [ ] Login realizado com sucesso
- [ ] Logs aparecem no console
- [ ] Email recebido na caixa de entrada
- [ ] IP correto no email
- [ ] Cidade/Estado/País corretos
- [ ] Provedor de internet correto
- [ ] Fuso horário correto
- [ ] Design do email profissional

---

## ❌ Troubleshooting

### Problema: Email não é enviado

**Solução:**
1. Verifique `.env` com credenciais corretas
2. Use senha de app (não senha normal)
3. Confira logs do backend
4. Teste com outro provedor de email

### Problema: Geolocalização "Desconhecido"

**Solução:**
1. Verifique conexão com internet
2. Teste APIs manualmente no navegador
3. Verifique firewall/proxy
4. Aguarde alguns segundos (timeout 5s por API)

### Problema: IP aparece como 127.0.0.1

**Solução:**
- ✅ **Normal em desenvolvimento!**
- Sistema detecta e busca IP público automaticamente
- Veja nos logs: "IP local detectado, buscando IP público"

### Problema: "Todas as APIs falharam"

**Solução:**
1. Verifique conexão com internet
2. Teste uma API manualmente:
   ```powershell
   curl http://ip-api.com/json/8.8.8.8
   ```
3. Verifique proxy/firewall corporativo
4. Sistema ainda permite login (modo degradado)

---

## 📊 Tempo Esperado

| Operação | Tempo |
|----------|-------|
| Captura de IP | < 1ms |
| Normalização | < 1ms |
| Busca IP público | 100-500ms |
| Geolocalização | 200-1000ms |
| Envio de email | 500-2000ms |
| **Total** | **1-4 segundos** |

---

## ✨ Próximos Passos

Após validar que tudo funciona:

1. **Registre novos usuários** → Email de boas-vindas
2. **Ative 2FA** → Email com código
3. **Altere perfil** → Email de notificação
4. **Monitore logs** → Identifique padrões suspeitos

---

## 🎉 Sucesso!

Se tudo funcionou:
- ✅ Sistema de geolocalização ativo
- ✅ Emails sendo enviados
- ✅ Segurança aumentada
- ✅ Usuários notificados

---

**Desenvolvido para WaterySoil 💧**  
*Agora com segurança e geolocalização inteligente!*
