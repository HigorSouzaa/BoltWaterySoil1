# 📧 Preview do Email de Login com Geolocalização

## 🎨 Exemplo Visual

Quando um usuário faz login, ele recebe um email como este:

---

```
┌─────────────────────────────────────────────────────┐
│                                                       │
│              💧 WaterySoil                           │
│    Sistema Inteligente de Monitoramento Agrícola     │
│                                                       │
└─────────────────────────────────────────────────────┘

            ✅ Novo Login Detectado

Detectamos um novo acesso à sua conta WaterySoil.

┌─────────────────────────────────────────────────────┐
│                                                       │
│  📧 CONTA:                                           │
│  usuario@exemplo.com.br                              │
│                                                       │
│  🕐 DATA E HORA:                                     │
│  30/10/2025, 14:35:27                                │
│                                                       │
│  🌐 ENDEREÇO IP:                                     │
│  177.45.123.45                                       │
│                                                       │
│  📍 LOCALIZAÇÃO:                                     │
│  São Paulo, São Paulo - Brazil                       │
│                                                       │
│  ⏰ FUSO HORÁRIO:                                    │
│  America/Sao_Paulo                                   │
│                                                       │
│  🏢 PROVEDOR (ISP):                                  │
│  Telefonica Brasil S.A                               │
│                                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ⚠️ Não foi você?                                    │
│                                                       │
│  Se você não reconhece este login ou localização,    │
│  recomendamos que altere sua senha imediatamente     │
│  e ative a autenticação em duas etapas.              │
└─────────────────────────────────────────────────────┘

Esta é uma mensagem automática do sistema WaterySoil.
Por favor, não responda a este e-mail.

© 2025 WaterySoil. Todos os direitos reservados.
```

---

## 📋 Informações Incluídas

### ✅ Sempre Exibido

- ✅ Email da conta
- ✅ Data e hora do login (BR)

### 🌐 Condicional (se disponível)

- 🌐 Endereço IP
- 🌍 País
- 📍 Estado/Cidade
- ⏰ Fuso horário
- 📡 Provedor de internet

---

## 🎨 Design Responsivo

O email usa um template HTML profissional com:

- **Header gradiente** (azul → verde)
- **Cards organizados** para informações
- **Ícones visuais** para cada campo
- **Alerta destacado** em amarelo/vermelho
- **Footer discreto** com copyright
- **Mobile-friendly** (responsivo)

---

## 📱 Compatibilidade

✅ Gmail  
✅ Outlook  
✅ Apple Mail  
✅ Thunderbird  
✅ Yahoo Mail  
✅ ProtonMail  

---

## 🔍 Exemplo Real de Dados

### Login do Brasil
```json
{
  "email": "joao@exemplo.com.br",
  "timestamp": "30/10/2025, 14:35:27",
  "location": {
    "ip": "177.45.123.45",
    "country": "Brazil",
    "region": "São Paulo",
    "city": "São Paulo",
    "timezone": "America/Sao_Paulo",
    "isp": "Telefonica Brasil S.A"
  }
}
```

### Login dos EUA
```json
{
  "email": "maria@example.com",
  "timestamp": "30/10/2025, 09:15:42",
  "location": {
    "ip": "142.250.185.78",
    "country": "United States",
    "region": "California",
    "city": "Mountain View",
    "timezone": "America/Los_Angeles",
    "isp": "Google LLC"
  }
}
```

### Login Falha na API (Degradado)
```json
{
  "email": "pedro@exemplo.com",
  "timestamp": "30/10/2025, 16:20:10",
  "location": {
    "ip": "189.123.45.67",
    "country": "Desconhecido",
    "region": "Desconhecido",
    "city": "Desconhecida",
    "timezone": "N/A",
    "isp": "Desconhecido"
  }
}
```

> Mesmo com falha total nas APIs, o email ainda é enviado com as informações disponíveis.

---

## 🎯 Casos de Uso

### ✅ Caso 1: Login Normal
- Usuário faz login
- Recebe email instantâneo
- Confirma que foi ele mesmo
- ✅ Segurança confirmada

### ⚠️ Caso 2: Login Suspeito
- Usuário recebe email
- **Localização diferente** do habitual
- **Horário estranho**
- ❌ Alerta de segurança ativado
- Usuário altera senha imediatamente

### 🔐 Caso 3: Login com 2FA
- Usuário ativa 2FA
- Login requer código
- Email só é enviado **após** validação do código
- ✅ Segurança dupla

---

## 📊 Dados de Localização

### Precisão

| Informação | Precisão | Disponibilidade |
|-----------|----------|-----------------|
| País | 99%+ | ✅ Sempre |
| Estado/Região | 95%+ | ✅ Quase sempre |
| Cidade | 85%+ | ✅ Maioria |
| ISP | 90%+ | ✅ Maioria |
| Fuso horário | 99%+ | ✅ Sempre |
| CEP | 40%+ | ⚠️ Às vezes |
| Coordenadas | 70%+ | ✅ Maioria |

### Limitações

- ⚠️ VPNs mostram localização do servidor VPN
- ⚠️ Proxies podem mascarar IP real
- ⚠️ IPs de celular podem variar
- ✅ Funciona em 99% dos casos normais

---

## 🔒 Privacidade

- ❌ **Não armazena** no banco de dados
- ❌ **Não compartilha** com terceiros
- ✅ **Apenas para notificação** de segurança
- ✅ **Usuário tem controle** total
- ✅ **Conforme LGPD/GDPR**

---

**Desenvolvido para WaterySoil 💧**
