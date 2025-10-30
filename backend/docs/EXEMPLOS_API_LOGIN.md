# 📡 Exemplos de Respostas da API de Login

## 🔐 Login Bem-Sucedido (Sem 2FA)

### Request:
```http
POST http://localhost:3000/api/user/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com.br",
  "pass": "senha123"
}
```

### Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671234567890abcdef123456",
    "name": "João Silva",
    "email": "usuario@exemplo.com.br",
    "phone": "+55 11 98765-4321",
    "company": "Fazenda São João",
    "position": "Proprietário",
    "twoFactorEnabled": false,
    "avatar": "data:image/jpeg;base64,/9j/4AAQ...",
    "createdAt": "2025-10-15T10:30:00.000Z"
  }
}
```

### Console Logs (Backend):
```
🔐 Login do usuário: usuario@exemplo.com.br
🌐 IP detectado: ::ffff:127.0.0.1
⚠️  IP local detectado, buscando IP público real...
🔍 Tentando obter IP público de: https://api.ipify.org?format=json
✅ IP público encontrado: 177.45.123.45
🎯 Buscando geolocalização para IP: 177.45.123.45
📍 Buscando geolocalização...
🌍 Tentando ip-api.com...
✅ Geolocalização obtida com sucesso!
   📍 São Paulo, São Paulo - Brazil
📧 Email de notificação enviado com geolocalização
```

### Email Enviado:
```
Para: usuario@exemplo.com.br
Assunto: ✅ Novo Login Detectado - WaterySoil

[Email HTML com:]
- Conta: usuario@exemplo.com.br
- Data/Hora: 30/10/2025, 14:35:27
- IP: 177.45.123.45
- Localização: São Paulo, São Paulo - Brazil
- Fuso Horário: America/Sao_Paulo
- Provedor: Telefonica Brasil S.A
```

---

## 🔐 Login com 2FA (Primeira Etapa)

### Request:
```http
POST http://localhost:3000/api/user/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com.br",
  "pass": "senha123"
}
```

### Response:
```json
{
  "requires2FA": true,
  "message": "Código de verificação enviado para seu email"
}
```

### Console Logs:
```
🔐 Login do usuário: usuario@exemplo.com.br
🌐 IP detectado: ::ffff:192.168.1.100
⚠️  IP local detectado, buscando IP público real...
🔍 Tentando obter IP público de: https://api.ipify.org?format=json
✅ IP público encontrado: 177.45.123.45
🎯 Buscando geolocalização para IP: 177.45.123.45
📍 Buscando geolocalização...
🌍 Tentando ip-api.com...
✅ Geolocalização obtida com sucesso!
   📍 São Paulo, São Paulo - Brazil
```

### Email de 2FA Enviado:
```
Para: usuario@exemplo.com.br
Assunto: 🔐 Seu Código de Verificação - WaterySoil

[Email com código de 6 dígitos]
Código: 742856
```

---

## 🔐 Login com 2FA (Segunda Etapa - Validação)

### Request:
```http
POST http://localhost:3000/api/user/verify2fa
Content-Type: application/json

{
  "email": "usuario@exemplo.com.br",
  "code": "742856"
}
```

### Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671234567890abcdef123456",
    "name": "João Silva",
    "email": "usuario@exemplo.com.br",
    "phone": "+55 11 98765-4321",
    "company": "Fazenda São João",
    "position": "Proprietário",
    "twoFactorEnabled": true,
    "avatar": "data:image/jpeg;base64,/9j/4AAQ...",
    "createdAt": "2025-10-15T10:30:00.000Z"
  }
}
```

### Console Logs:
```
📧 Email de notificação enviado com geolocalização (após 2FA)
✅ Email enviado para usuario@exemplo.com.br: ✅ Novo Login Detectado - WaterySoil
```

### Email de Login Enviado (Após 2FA):
```
Para: usuario@exemplo.com.br
Assunto: ✅ Novo Login Detectado - WaterySoil

[Email HTML com localização armazenada durante login]
```

---

## ❌ Login Falhou (Credenciais Inválidas)

### Request:
```http
POST http://localhost:3000/api/user/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com.br",
  "pass": "senha_errada"
}
```

### Response:
```json
{
  "message": "Email ou senha incorretos"
}
```

**Status Code:** 400 Bad Request

**Sem email enviado** (login não foi bem-sucedido)

---

## ❌ Código 2FA Inválido

### Request:
```http
POST http://localhost:3000/api/user/verify2fa
Content-Type: application/json

{
  "email": "usuario@exemplo.com.br",
  "code": "000000"
}
```

### Response:
```json
{
  "message": "Código incorreto"
}
```

**Status Code:** 400 Bad Request

---

## ❌ Código 2FA Expirado

### Request:
```http
POST http://localhost:3000/api/user/verify2fa
Content-Type: application/json

{
  "email": "usuario@exemplo.com.br",
  "code": "742856"
}
```

### Response:
```json
{
  "message": "Código expirado. Solicite um novo código."
}
```

**Status Code:** 400 Bad Request

---

## 🌍 Exemplos de Dados de Geolocalização

### Brasil (São Paulo):
```json
{
  "ip": "177.45.123.45",
  "country": "Brazil",
  "countryCode": "BR",
  "region": "São Paulo",
  "regionCode": "SP",
  "city": "São Paulo",
  "zip": "01310-100",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "timezone": "America/Sao_Paulo",
  "isp": "Telefonica Brasil S.A"
}
```

### Brasil (Rio de Janeiro):
```json
{
  "ip": "189.123.45.67",
  "country": "Brazil",
  "countryCode": "BR",
  "region": "Rio de Janeiro",
  "regionCode": "RJ",
  "city": "Rio de Janeiro",
  "zip": "20040-020",
  "latitude": -22.9068,
  "longitude": -43.1729,
  "timezone": "America/Sao_Paulo",
  "isp": "Claro S.A."
}
```

### Brasil (Belo Horizonte):
```json
{
  "ip": "200.98.76.54",
  "country": "Brazil",
  "countryCode": "BR",
  "region": "Minas Gerais",
  "regionCode": "MG",
  "city": "Belo Horizonte",
  "zip": "30140-071",
  "latitude": -19.9167,
  "longitude": -43.9345,
  "timezone": "America/Sao_Paulo",
  "isp": "Oi S.A."
}
```

### EUA (Califórnia):
```json
{
  "ip": "142.250.185.78",
  "country": "United States",
  "countryCode": "US",
  "region": "California",
  "regionCode": "CA",
  "city": "Mountain View",
  "zip": "94043",
  "latitude": 37.4056,
  "longitude": -122.0775,
  "timezone": "America/Los_Angeles",
  "isp": "Google LLC"
}
```

### Portugal (Lisboa):
```json
{
  "ip": "85.240.12.34",
  "country": "Portugal",
  "countryCode": "PT",
  "region": "Lisboa",
  "regionCode": "11",
  "city": "Lisboa",
  "zip": "1000-001",
  "latitude": 38.7223,
  "longitude": -9.1393,
  "timezone": "Europe/Lisbon",
  "isp": "MEO - Servicos de Comunicacoes e Multimedia S.A."
}
```

### API Falhou (Dados Padrão):
```json
{
  "ip": "123.45.67.89",
  "country": "Desconhecido",
  "countryCode": "N/A",
  "region": "Desconhecido",
  "regionCode": "N/A",
  "city": "Desconhecida",
  "zip": "N/A",
  "latitude": null,
  "longitude": null,
  "timezone": "N/A",
  "isp": "Desconhecido"
}
```

---

## 📊 Estrutura do Email HTML

### Dados Sempre Presentes:
```html
📧 CONTA:
usuario@exemplo.com.br

🕐 DATA E HORA:
30/10/2025, 14:35:27
```

### Dados Condicionais (se disponíveis):
```html
🌐 ENDEREÇO IP:
177.45.123.45

📍 LOCALIZAÇÃO:
São Paulo, São Paulo - Brazil

⏰ FUSO HORÁRIO:
America/Sao_Paulo

🏢 PROVEDOR (ISP):
Telefonica Brasil S.A
```

---

## 🧪 Testando com cURL (PowerShell)

### Login Simples:
```powershell
$body = @{
    email = "usuario@exemplo.com.br"
    pass = "senha123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/user/login" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

### Login com 2FA:
```powershell
# Passo 1: Solicitar código
$body = @{
    email = "usuario@exemplo.com.br"
    pass = "senha123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/user/login" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"

# Passo 2: Validar código (após receber no email)
$body2fa = @{
    email = "usuario@exemplo.com.br"
    code = "742856"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/user/verify2fa" `
  -Method Post `
  -Body $body2fa `
  -ContentType "application/json"
```

---

## 📝 Headers da Requisição

O sistema captura o IP de várias formas:

```javascript
// Headers que o sistema verifica:
req.headers['x-forwarded-for']  // Proxy/Load Balancer
req.headers['x-real-ip']         // Nginx
req.connection.remoteAddress     // Conexão direta
req.socket.remoteAddress         // Socket
req.ip                           // Express
```

### Exemplo de Headers:
```http
POST /api/user/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json
User-Agent: Mozilla/5.0 ...
X-Forwarded-For: 177.45.123.45
X-Real-IP: 177.45.123.45

{
  "email": "usuario@exemplo.com.br",
  "pass": "senha123"
}
```

---

## 🎯 Fluxo Completo com Timings

```
[00:00.000] POST /api/user/login
[00:00.010] ✅ Credenciais validadas
[00:00.015] 🌐 IP capturado: ::ffff:127.0.0.1
[00:00.020] ⚠️  IP local detectado
[00:00.120] ✅ IP público: 177.45.123.45
[00:00.125] 🎯 Buscando geolocalização...
[00:00.350] ✅ Geolocalização obtida (ip-api.com)
[00:00.355] 🔑 Token JWT gerado
[00:01.500] 📧 Email enviado
[00:01.510] ✅ Response enviado ao cliente
```

**Total: ~1.5 segundos**

---

**Desenvolvido para WaterySoil 💧**
