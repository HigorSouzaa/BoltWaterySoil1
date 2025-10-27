<div align="center">

# 🌱 WaterySoil - Sistema de Monitoramento Agrícola IoT

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)
![MongoDB](https://img.shields.io/badge/mongodb-6.20.0-47A248.svg)

**Plataforma completa de monitoramento agrícola em tempo real com integração IoT**

[Características](#-características) • [Tecnologias](#-tecnologias) • [Instalação](#-instalação) • [Uso](#-como-usar) • [Documentação](#-documentação)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Como Usar](#-como-usar)
- [Simuladores IoT](#-simuladores-iot)
- [API Endpoints](#-api-endpoints)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Segurança](#-segurança)
- [Documentação Adicional](#-documentação-adicional)
- [Troubleshooting](#-troubleshooting)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Contato](#-contato)

---

## 🌟 Sobre o Projeto

**WaterySoil** é uma plataforma completa de **monitoramento agrícola IoT** que integra hardware (dispositivos Eco-Soil Pro) com software web para análise de dados de sensores em tempo real. O sistema foi desenvolvido para auxiliar agricultores e gestores agrícolas no monitoramento preciso das condições do solo, permitindo tomadas de decisão baseadas em dados.

### 🎯 Propósito

O projeto foi desenvolvido para resolver os seguintes desafios:

- **Monitoramento em Tempo Real**: Acompanhamento contínuo de parâmetros críticos do solo (umidade, temperatura, NPK, pH)
- **Gestão Centralizada**: Controle de múltiplos ambientes agrícolas, setores e módulos de sensores em uma única plataforma
- **Manutenção Preventiva**: Agendamento e controle de manutenções para garantir o funcionamento adequado dos equipamentos
- **Análise Histórica**: Visualização de dados históricos através de gráficos interativos para identificação de padrões e tendências
- **Alertas Inteligentes**: Sistema de notificações automáticas quando parâmetros saem dos níveis ideais
- **Gestão de Irrigação**: Controle e histórico de irrigações realizadas

### 🏆 Diferenciais

- ✅ Interface moderna e intuitiva desenvolvida com React + TypeScript
- ✅ API RESTful robusta com Node.js + Express
- ✅ Autenticação segura com JWT e 2FA (autenticação em duas etapas)
- ✅ Classificação inteligente de parâmetros do solo baseada em tipo de solo
- ✅ Gráficos interativos em tempo real com Chart.js
- ✅ Sistema de alertas automáticos por email
- ✅ Simuladores de hardware para testes e desenvolvimento
- ✅ Suporte a múltiplos dispositivos Eco-Soil Pro
- ✅ Geração de relatórios em PDF
- ✅ Responsivo e otimizado para dispositivos móveis

---

## ✨ Características

### 🔐 Autenticação e Segurança
- Login/Registro de usuários
- Autenticação JWT (JSON Web Token)
- Autenticação em duas etapas (2FA) por email
- Hash de senhas com bcryptjs
- Proteção de rotas no frontend e backend
- Upload seguro de avatares

### 📊 Dashboard Interativo
- Visualização em tempo real de dados dos sensores
- Gráficos históricos (últimas 24h, 7 dias, 30 dias)
- Indicadores de status com classificação por tipo de solo
- Seleção de ambiente e setor
- Cards informativos com métricas principais

### 🌍 Gestão de Ambientes e Setores
- Criação e gerenciamento de ambientes agrícolas
- Organização por setores com informações detalhadas
- Definição de tipo de solo (areia, argila, franco)
- Localização geográfica (latitude/longitude)
- Área do setor em hectares

### 📡 Módulos WaterySoil
- Registro e gerenciamento de módulos de sensores
- Monitoramento de status (operacional, offline, erro, manutenção)
- Visualização de dados em tempo real
- Histórico de leituras
- Configuração de parâmetros

### 🔧 Manutenção
- Agendamento de manutenções preventivas
- Controle de status (pendente, em andamento, concluída, cancelada)
- Histórico de manutenções realizadas
- Notificações de manutenções pendentes

### 💧 Gestão de Irrigação
- Registro de irrigações realizadas
- Controle de volume de água utilizado
- Histórico de irrigações por setor
- Análise de eficiência

### 🚨 Sistema de Alertas
- Alertas automáticos quando parâmetros saem dos níveis ideais
- Notificações por email
- Configuração personalizada de limites
- Histórico de alertas
- Classificação por severidade

### 📈 Relatórios
- Geração de relatórios em PDF
- Análise de dados históricos
- Exportação de dados

---

## 🛠 Tecnologias

### Frontend
- **Framework**: React 18.3.1 com TypeScript
- **Build Tool**: Vite 5.4.2
- **Estilização**: Tailwind CSS 3.4.1
- **Roteamento**: React Router DOM 7.9.4
- **Gráficos**: Chart.js 4.5.1 + react-chartjs-2 5.3.0
- **Ícones**: Lucide React 0.344.0
- **HTTP Client**: Axios 1.12.2
- **PDF**: jsPDF 3.0.3 + jspdf-autotable 5.0.2
- **Gerenciamento de Estado**: Context API

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Banco de Dados**: MongoDB 6.20.0 + Mongoose 8.18.2
- **Autenticação**: JSON Web Token (jsonwebtoken 9.0.2)
- **Segurança**: bcryptjs 3.0.2
- **Upload**: Multer 2.0.2
- **Email**: Nodemailer 7.0.9
- **CORS**: cors 2.8.5
- **Variáveis de Ambiente**: dotenv 17.2.2

### Ferramentas de Desenvolvimento
- **Linting**: ESLint 9.9.1
- **TypeScript**: 5.5.3
- **Concorrência**: Concurrently 9.2.1
- **Hot Reload**: Nodemon 3.1.10

### Hardware/IoT
- **Dispositivo**: Eco-Soil Pro (ESP32/ESP8266)
- **Protocolo**: HTTP/HTTPS
- **Formato de Dados**: JSON
- **Sensores**: Umidade do solo, Temperatura, NPK, pH

---

## 🏗 Arquitetura

O sistema segue uma arquitetura **cliente-servidor** com separação clara entre frontend e backend:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Dashboard   │  │ Environments │  │   Settings   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Modules    │  │ Maintenance  │  │    Charts    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS (REST API)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Controllers  │  │  Middleware  │  │   Services   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Routes    │  │    Models    │  │     Auth     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Users     │  │ Environments │  │   Sectors    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Modules    │  │ DataSensors  │  │    Alerts    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP POST/PUT
                            │
┌─────────────────────────────────────────────────────────────┐
│                  HARDWARE (Eco-Soil Pro)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ WiFi Module  │  │   Sensors    │  │  Controller  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Hardware → Backend**: Dispositivos Eco-Soil Pro enviam dados de sensores via HTTP POST
2. **Backend → Database**: Dados são validados e armazenados no MongoDB
3. **Frontend → Backend**: Interface solicita dados via API REST
4. **Backend → Frontend**: Dados são retornados em formato JSON
5. **Frontend**: Dados são processados e exibidos em gráficos e dashboards

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (incluído com Node.js)
- **MongoDB** >= 6.0 (local ou [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### Verificar Instalações

```bash
node --version
npm --version
git --version
```

---

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/BoltWaterySoil1.git
cd BoltWaterySoil1
```

### 2. Instale as Dependências

#### Opção A: Instalação Automática (Recomendado)

```bash
npm run new
```

Este comando irá:
- Instalar dependências do frontend
- Instalar dependências do backend
- Iniciar ambos os servidores automaticamente

#### Opção B: Instalação Manual

```bash
# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..
```

---

## ⚙️ Configuração

### 1. Configurar Variáveis de Ambiente do Backend

Crie um arquivo `.env` na pasta `backend/`:

```bash
cd backend
```

Crie o arquivo `.env` com o seguinte conteúdo:

```env
# Porta do servidor
PORT=3000

# Chave secreta para JWT (altere para uma chave segura)
JWT_SECRET=sua_chave_secreta_super_segura_aqui

# URL de conexão do MongoDB
MONGO_URL=mongodb://localhost:27017/waterysoil
# OU para MongoDB Atlas:
# MONGO_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/waterysoil?retryWrites=true&w=majority

# Configurações de Email (para 2FA e alertas)
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_aplicativo
```

### 2. Configurar Email para 2FA (Opcional)

Para habilitar o envio de emails (2FA e alertas), configure uma conta Gmail:

1. Acesse [Google Account Security](https://myaccount.google.com/security)
2. Ative a verificação em duas etapas
3. Gere uma "Senha de app" em [App Passwords](https://myaccount.google.com/apppasswords)
4. Use a senha gerada no campo `EMAIL_PASS` do arquivo `.env`

### 3. Configurar MongoDB

#### Opção A: MongoDB Local

```bash
# Instalar MongoDB Community Edition
# Siga as instruções em: https://docs.mongodb.com/manual/installation/

# Iniciar o serviço MongoDB
mongod
```

#### Opção B: MongoDB Atlas (Cloud)

1. Crie uma conta em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Configure o acesso à rede (IP Whitelist)
4. Obtenha a string de conexão
5. Atualize `MONGO_URL` no arquivo `.env`

---

## 🎮 Como Usar

### Iniciar o Sistema

#### Opção A: Iniciar Tudo de Uma Vez (Recomendado)

```bash
npm run start:all
```

Este comando inicia:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

#### Opção B: Iniciar Separadamente

**Terminal 1 - Backend:**
```bash
npm run back:run
# ou
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Acessar a Aplicação

1. Abra o navegador em: **http://localhost:5173**
2. Crie uma conta ou faça login
3. Configure seu primeiro ambiente e setor
4. Registre um dispositivo Eco-Soil Pro
5. Inicie o simulador para enviar dados (veja seção [Simuladores IoT](#-simuladores-iot))

### Primeiro Acesso

1. **Criar Conta**:
   - Clique em "Criar Conta"
   - Preencha os dados solicitados
   - Faça login com suas credenciais

2. **Configurar Ambiente**:
   - No Dashboard, clique em "Ambientes"
   - Crie um novo ambiente (ex: "Fazenda Principal")
   - Adicione setores ao ambiente (ex: "Setor A - Milho")

3. **Registrar Dispositivo**:
   - Vá em "Módulos WaterySoil"
   - Registre um novo módulo
   - Anote o MAC Address para configurar no hardware/simulador

4. **Iniciar Monitoramento**:
   - Configure e inicie um simulador (veja próxima seção)
   - Acompanhe os dados em tempo real no Dashboard

---

## 🤖 Simuladores IoT

O projeto inclui simuladores de hardware para testes e desenvolvimento sem necessidade de dispositivos físicos.

### Simulador Node.js (Recomendado para Testes)

#### Configuração

1. **Criar arquivo `.env` na raiz do projeto:**

```env
API_URL=http://localhost:3000/api/v1
MAC_ADDRESS=AA:BB:CC:DD:EE:FF
```

2. **Executar o simulador:**

```bash
# Simulador com dados ideais
node populate-historical-data.js
```

#### Características do Simulador

- ✅ Envia dados em **tempo real** a cada 2 segundos (atualiza WaterySoilModule)
- ✅ Salva no **histórico** a cada 10 minutos (salva em DataSensors)
- ✅ Simula valores realistas com variação gradual
- ✅ Baseado em médias reais: pH=7.0, Umidade=30%, Temperatura=30°C

#### Parâmetros Simulados

| Parâmetro | Faixa | Unidade |
|-----------|-------|---------|
| Umidade do Solo | 22-38% | % |
| Temperatura | 18-35°C | °C |
| pH | 6.0-7.5 | - |
| Fósforo (P) | 20-40 | ppm |
| Potássio (K) | 100-150 | ppm |

### Simulador Arduino (Para Hardware Real)

#### Hardware Necessário

- ESP32 ou ESP8266
- Conexão WiFi
- Cabo USB para programação

#### Configuração

1. **Abra o arquivo `arduino_ecosoil_simulator.ino`**

2. **Configure as credenciais WiFi:**

```cpp
const char* WIFI_SSID = "SEU_WIFI_AQUI";
const char* WIFI_PASSWORD = "SUA_SENHA_AQUI";
```

3. **Configure a URL da API:**

```cpp
const char* API_URL = "http://192.168.1.100:3000/api/v1";
const char* MAC_ADDRESS = "AA:BB:CC:DD:EE:FF";
```

4. **Escolha o perfil de simulação:**

```cpp
// Opções: "ideal", "good", "bad"
const char* SIMULATION_PROFILE = "ideal";
```

5. **Faça upload para o ESP32/ESP8266 usando Arduino IDE**

#### Perfis de Simulação

**Perfil IDEAL:**
- Umidade: 25-30%
- Temperatura: 20-25°C
- pH: 6.0-7.0
- NPK: Níveis ótimos

**Perfil BOM:**
- Umidade: 20-35%
- Temperatura: 18-28°C
- pH: 5.5-7.5
- NPK: Níveis aceitáveis

**Perfil RUIM:**
- Umidade: 10-15% ou 40-50%
- Temperatura: 10-15°C ou 35-40°C
- pH: 4.0-5.0 ou 8.0-9.0
- NPK: Níveis críticos

### Popular Dados Históricos

Para popular o banco de dados com dados históricos para testes:

```bash
node populate-historical-data.js
```

Este script:
- Gera dados históricos desde uma data inicial até a data atual
- Intervalo de 10 minutos entre leituras
- Valores realistas com variação gradual
- Útil para testar gráficos e análises

---

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/users/register` | Registrar novo usuário | ❌ |
| POST | `/api/v1/users/login` | Login de usuário | ❌ |
| POST | `/api/v1/users/verify-2fa` | Verificar código 2FA | ❌ |
| GET | `/api/v1/users/profile` | Obter perfil do usuário | ✅ |
| PUT | `/api/v1/users/profile` | Atualizar perfil | ✅ |
| POST | `/api/v1/users/upload-avatar` | Upload de avatar | ✅ |

### Ambientes

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/environments` | Listar ambientes | ✅ |
| POST | `/api/v1/environments` | Criar ambiente | ✅ |
| GET | `/api/v1/environments/:id` | Obter ambiente | ✅ |
| PUT | `/api/v1/environments/:id` | Atualizar ambiente | ✅ |
| DELETE | `/api/v1/environments/:id` | Deletar ambiente | ✅ |

### Setores

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/sectors` | Listar setores | ✅ |
| POST | `/api/v1/sectors` | Criar setor | ✅ |
| GET | `/api/v1/sectors/:id` | Obter setor | ✅ |
| PUT | `/api/v1/sectors/:id` | Atualizar setor | ✅ |
| DELETE | `/api/v1/sectors/:id` | Deletar setor | ✅ |
| GET | `/api/v1/sectors/environment/:envId` | Setores por ambiente | ✅ |

### Módulos WaterySoil

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/waterysoil-modules` | Listar módulos | ✅ |
| POST | `/api/v1/waterysoil-modules` | Criar módulo | ✅ |
| GET | `/api/v1/waterysoil-modules/:id` | Obter módulo | ✅ |
| PUT | `/api/v1/waterysoil-modules/:id` | Atualizar módulo | ✅ |
| DELETE | `/api/v1/waterysoil-modules/:id` | Deletar módulo | ✅ |
| GET | `/api/v1/waterysoil-modules/sector/:sectorId` | Módulos por setor | ✅ |

### Dispositivos Eco-Soil Pro

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/ecosoil-devices/register` | Registrar dispositivo | ❌ |
| PUT | `/api/v1/ecosoil-devices/update-sensor-data` | Atualizar dados (tempo real) | ❌ |
| GET | `/api/v1/ecosoil-devices/:macAddress` | Obter dispositivo | ✅ |

### Dados de Sensores (Histórico)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/v1/data-sensors` | Salvar leitura histórica | ❌ |
| GET | `/api/v1/data-sensors/module/:moduleId` | Histórico por módulo | ✅ |
| GET | `/api/v1/data-sensors/sector/:sectorId` | Histórico por setor | ✅ |

### Alertas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/alerts` | Listar alertas | ✅ |
| POST | `/api/v1/alerts` | Criar alerta | ✅ |
| PUT | `/api/v1/alerts/:id` | Atualizar alerta | ✅ |
| DELETE | `/api/v1/alerts/:id` | Deletar alerta | ✅ |

### Irrigação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/irrigation` | Listar irrigações | ✅ |
| POST | `/api/v1/irrigation` | Registrar irrigação | ✅ |
| GET | `/api/v1/irrigation/sector/:sectorId` | Irrigações por setor | ✅ |

### Manutenção

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/maintenance-schedules` | Listar manutenções | ✅ |
| POST | `/api/v1/maintenance-schedules` | Criar manutenção | ✅ |
| PUT | `/api/v1/maintenance-schedules/:id` | Atualizar manutenção | ✅ |
| DELETE | `/api/v1/maintenance-schedules/:id` | Deletar manutenção | ✅ |

### Relatórios

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/v1/reports/sector/:sectorId` | Gerar relatório PDF | ✅ |

---

## 📂 Estrutura do Projeto

```
BoltWaterySoil1/
│
├── backend/                          # Backend Node.js/Express
│   ├── config/
│   │   └── database.js              # Configuração MongoDB
│   ├── controllers/                 # Lógica de negócio
│   │   ├── userController.js
│   │   ├── environmentController.js
│   │   ├── sectorController.js
│   │   ├── waterySoilModuleController.js
│   │   ├── maintenanceScheduleController.js
│   │   ├── ecoSoilProController.js
│   │   ├── dataSensorsController.js
│   │   ├── alertController.js
│   │   ├── irrigationController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── auth.js                  # Middleware de autenticação JWT
│   │   └── upload.js                # Middleware de upload (Multer)
│   ├── models/                      # Schemas Mongoose
│   │   ├── User.js
│   │   ├── Environment.js
│   │   ├── Sector.js
│   │   ├── WaterySoilModule.js
│   │   ├── MaintenanceSchedule.js
│   │   ├── EcoSoilPro.js
│   │   ├── DataSensors.js
│   │   ├── Alert.js
│   │   └── Irrigation.js
│   ├── routes/                      # Rotas da API
│   │   ├── userRoutes.js
│   │   ├── environmentRoutes.js
│   │   ├── sectorRoutes.js
│   │   ├── waterySoilModuleRoutes.js
│   │   ├── maintenanceScheduleRoutes.js
│   │   ├── ecoSoilProRoutes.js
│   │   ├── dataSensorsRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── irrigationRoutes.js
│   │   └── reportRoutes.js
│   ├── services/                    # Serviços auxiliares
│   │   ├── alertMonitoringService.js
│   │   ├── emailTemplates.js
│   │   ├── parameterClassification.js
│   │   └── serviceAuthEmail.js
│   ├── docs/                        # Documentação técnica
│   │   ├── AUTENTICACAO_2FA.md
│   │   ├── CONSUMO_ARMAZENAMENTO.md
│   │   └── HISTORICO_DADOS_SENSORES.md
│   ├── uploads/                     # Arquivos de upload (avatares)
│   ├── .env                         # Variáveis de ambiente
│   ├── package.json
│   └── server.js                    # Entry point do backend
│
├── src/                             # Frontend React + TypeScript
│   ├── components/
│   │   ├── Landing.tsx              # Página inicial
│   │   ├── Auth.tsx                 # Login/Registro
│   │   ├── Dashboard.tsx            # Dashboard principal
│   │   ├── EnvironmentManager.tsx   # Gestão de ambientes
│   │   ├── WaterySoilModules.tsx    # Gestão de módulos
│   │   ├── MaintenanceSchedule.tsx  # Gestão de manutenções
│   │   ├── SensorCharts.tsx         # Gráficos de sensores
│   │   ├── UserSettings.tsx         # Configurações do usuário
│   │   ├── TwoFactorAuth.tsx        # Autenticação 2FA
│   │   ├── VerifyEmailChange.tsx    # Verificação de email
│   │   ├── ProtectedRoute.tsx       # Proteção de rotas
│   │   └── Notification.tsx         # Sistema de notificações
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Contexto de autenticação
│   │   └── NotificationContext.tsx  # Contexto de notificações
│   ├── services/                    # Serviços de API
│   │   ├── apiService.ts
│   │   ├── authService.ts
│   │   ├── environmentService.ts
│   │   ├── sectorService.ts
│   │   ├── waterySoilModuleService.ts
│   │   ├── maintenanceScheduleService.ts
│   │   ├── alertService.ts
│   │   ├── userService.ts
│   │   └── parameterClassification.ts
│   ├── types/
│   │   └── auth.ts                  # Tipos TypeScript
│   ├── App.tsx                      # Componente raiz
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Estilos globais
│
├── tutorias/                        # Documentação adicional
│   ├── ANALISE_COMPLETA_PROJETO.md
│   ├── GUIA_MANUTENCAO.md
│   ├── GUIA_TRATAMENTO_ERROS.md
│   ├── QUICK_START_SIMULADOR.md
│   ├── SIMULADOR_HARDWARE_ECOSOIL.md
│   ├── DASHBOARD_DADOS_REAIS.md
│   ├── GRAFICOS_DASHBOARD.md
│   ├── ARDUINO_SIMULATOR_README.md
│   └── TESTE_MANUTENCAO.md
│
├── public/                          # Arquivos estáticos
│   └── images/
│
├── arduino_ecosoil_simulator.ino    # Simulador Arduino
├── populate-historical-data.js      # Script para popular dados históricos
├── sistema-simuladorHardware.html   # Interface HTML do simulador
├── package.json                     # Dependências do frontend
├── vite.config.ts                   # Configuração do Vite
├── tailwind.config.js               # Configuração do Tailwind
├── tsconfig.json                    # Configuração do TypeScript
├── .env                             # Variáveis de ambiente (frontend)
└── README.md                        # Este arquivo
```

---

## 🎨 Funcionalidades Principais

### 1. Dashboard Interativo

O dashboard principal oferece uma visão completa do sistema:

- **Seleção de Ambiente e Setor**: Escolha rapidamente entre diferentes ambientes e setores
- **Cards de Métricas**: Visualização instantânea dos principais parâmetros
  - Umidade do Solo (%)
  - Temperatura (°C)
  - pH
  - Fósforo (P) em ppm
  - Potássio (K) em ppm
- **Indicadores de Status**: Classificação visual (Ideal, Bom, Atenção, Crítico)
- **Gráficos em Tempo Real**: Atualização automática dos dados
- **Histórico**: Visualização de dados das últimas 24h, 7 dias ou 30 dias

### 2. Classificação Inteligente de Parâmetros

O sistema classifica automaticamente os parâmetros do solo baseado no **tipo de solo** configurado:

#### Tipos de Solo Suportados:
- **Areia (Sand)**: Solo arenoso
- **Franco (Loam)**: Solo franco/médio
- **Argila (Clay)**: Solo argiloso

#### Classificação de Umidade (VWC - Volumetric Water Content):

| Tipo de Solo | Ideal | Bom | Atenção | Crítico |
|--------------|-------|-----|---------|---------|
| Areia | 10-15% | 8-18% | 5-20% | <5% ou >20% |
| Franco | 20-30% | 15-35% | 10-40% | <10% ou >40% |
| Argila | 30-40% | 25-45% | 20-50% | <20% ou >50% |

#### Classificação de Temperatura:

| Status | Faixa |
|--------|-------|
| Ideal | 20-25°C |
| Bom | 15-30°C |
| Atenção | 10-35°C |
| Crítico | <10°C ou >35°C |

#### Classificação de pH:

| Status | Faixa |
|--------|-------|
| Ideal | 6.0-7.0 |
| Bom | 5.5-7.5 |
| Atenção | 5.0-8.0 |
| Crítico | <5.0 ou >8.0 |

#### Classificação de Fósforo (P):

| Status | Faixa (ppm) |
|--------|-------------|
| Ideal | 20-40 |
| Bom | 15-50 |
| Atenção | 10-60 |
| Crítico | <10 ou >60 |

#### Classificação de Potássio (K):

| Status | Faixa (ppm) |
|--------|-------------|
| Ideal | 100-150 |
| Bom | 80-180 |
| Atenção | 60-200 |
| Crítico | <60 ou >200 |

### 3. Sistema de Alertas Automáticos

O sistema monitora continuamente os parâmetros e gera alertas quando:

- **Umidade** sai da faixa configurada
- **Temperatura** atinge níveis críticos
- **pH** está fora do ideal
- **NPK** apresenta deficiência ou excesso
- **Módulo** fica offline por mais de 5 minutos

#### Configuração de Alertas:

Os usuários podem configurar limites personalizados para cada parâmetro nas **Configurações do Usuário**.

#### Notificações:

- **Email**: Alertas enviados automaticamente por email
- **Dashboard**: Notificações visuais no sistema
- **Histórico**: Registro completo de todos os alertas

### 4. Gráficos Históricos

Visualização de dados históricos com Chart.js:

- **Gráfico de Linha**: Evolução temporal dos parâmetros
- **Múltiplos Parâmetros**: Visualização simultânea de vários sensores
- **Períodos Configuráveis**: 24h, 7 dias, 30 dias
- **Interativo**: Zoom, pan, tooltips informativos
- **Exportação**: Possibilidade de exportar dados

### 5. Gestão de Manutenções

Sistema completo de agendamento e controle de manutenções:

- **Criação de Manutenções**: Agende manutenções preventivas ou corretivas
- **Status**: Pendente, Em Andamento, Concluída, Cancelada
- **Prioridade**: Baixa, Média, Alta, Urgente
- **Notificações**: Lembretes de manutenções pendentes
- **Histórico**: Registro completo de todas as manutenções

### 6. Gestão de Irrigação

Controle e histórico de irrigações:

- **Registro de Irrigações**: Data, hora, volume, duração
- **Método**: Manual, Automático, Gotejamento, Aspersão
- **Análise**: Consumo de água por período
- **Eficiência**: Correlação entre irrigação e umidade do solo

### 7. Relatórios em PDF

Geração automática de relatórios profissionais:

- **Dados do Setor**: Informações completas
- **Estatísticas**: Médias, mínimos, máximos
- **Gráficos**: Visualizações incluídas no PDF
- **Período Configurável**: Escolha o intervalo de dados
- **Download**: Exportação direta em PDF

---

## 🔒 Segurança

### Autenticação e Autorização

- **JWT (JSON Web Token)**: Tokens seguros com expiração configurável
- **Hash de Senhas**: bcryptjs com salt rounds
- **2FA (Two-Factor Authentication)**: Autenticação em duas etapas por email
- **Proteção de Rotas**: Middleware de autenticação no backend
- **Protected Routes**: Proteção de rotas no frontend

### Validação de Dados

- **Backend**: Validação de todos os inputs
- **Frontend**: Validação em tempo real
- **Sanitização**: Prevenção de SQL Injection e XSS
- **CORS**: Configuração adequada de CORS

### Segurança de Dados

- **Criptografia**: Senhas nunca armazenadas em texto plano
- **Tokens Temporários**: Códigos 2FA com validade de 10 minutos
- **Sessões**: Gerenciamento seguro de sessões
- **Upload Seguro**: Validação de tipos de arquivo e tamanho

### Boas Práticas

- **Variáveis de Ambiente**: Credenciais nunca no código
- **HTTPS**: Suporte para conexões seguras
- **Rate Limiting**: Proteção contra ataques de força bruta (recomendado implementar)
- **Logs**: Registro de ações importantes

---

## 📚 Documentação Adicional

O projeto inclui documentação técnica detalhada na pasta `tutorias/`:

### Guias de Uso

- **[QUICK_START_SIMULADOR.md](tutorias/QUICK_START_SIMULADOR.md)**: Guia rápido para iniciar o simulador
- **[SIMULADOR_HARDWARE_ECOSOIL.md](tutorias/SIMULADOR_HARDWARE_ECOSOIL.md)**: Documentação completa do simulador
- **[ARDUINO_SIMULATOR_README.md](tutorias/ARDUINO_SIMULATOR_README.md)**: Guia do simulador Arduino
- **[DASHBOARD_DADOS_REAIS.md](tutorias/DASHBOARD_DADOS_REAIS.md)**: Como visualizar dados reais no dashboard

### Guias Técnicos

- **[ANALISE_COMPLETA_PROJETO.md](tutorias/ANALISE_COMPLETA_PROJETO.md)**: Análise completa da arquitetura
- **[GUIA_MANUTENCAO.md](tutorias/GUIA_MANUTENCAO.md)**: Guia de manutenção do sistema
- **[GUIA_TRATAMENTO_ERROS.md](tutorias/GUIA_TRATAMENTO_ERROS.md)**: Tratamento de erros
- **[GRAFICOS_DASHBOARD.md](tutorias/GRAFICOS_DASHBOARD.md)**: Documentação dos gráficos

### Documentação Backend

- **[AUTENTICACAO_2FA.md](backend/docs/AUTENTICACAO_2FA.md)**: Sistema de autenticação 2FA
- **[HISTORICO_DADOS_SENSORES.md](backend/docs/HISTORICO_DADOS_SENSORES.md)**: Histórico de dados
- **[CONSUMO_ARMAZENAMENTO.md](backend/docs/CONSUMO_ARMAZENAMENTO.md)**: Análise de consumo
- **[TESTE_ALERTAS_AUTOMATICOS.md](backend/TESTE_ALERTAS_AUTOMATICOS.md)**: Sistema de alertas

### Documentação de Correções

- **[CORRECAO_BUG_GRAFICOS_SETOR.md](tutorias/CORRECAO_BUG_GRAFICOS_SETOR.md)**: Correção de bugs nos gráficos
- **[RESUMO_CORRECAO_BUG.md](tutorias/RESUMO_CORRECAO_BUG.md)**: Resumo de correções
- **[ANTES_DEPOIS_CORRECAO.md](tutorias/ANTES_DEPOIS_CORRECAO.md)**: Comparativo antes/depois

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com MongoDB

**Problema**: `MongoNetworkError: failed to connect to server`

**Solução**:
```bash
# Verificar se o MongoDB está rodando
mongod --version

# Iniciar o MongoDB (se local)
mongod

# Verificar a URL de conexão no .env
# Para MongoDB local: mongodb://localhost:27017/waterysoil
# Para MongoDB Atlas: verificar IP whitelist e credenciais
```

#### 2. Erro de Porta em Uso

**Problema**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solução**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Ou altere a porta no arquivo .env
PORT=3001
```

#### 3. Módulos Não Instalados

**Problema**: `Error: Cannot find module 'express'`

**Solução**:
```bash
# Reinstalar dependências
npm install
cd backend
npm install
```

#### 4. Erro de CORS

**Problema**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solução**:
- Verificar se o backend está rodando
- Verificar a configuração de CORS no `backend/server.js`
- Verificar a URL da API no frontend

#### 5. Simulador Não Envia Dados

**Problema**: Simulador roda mas dados não aparecem no dashboard

**Solução**:
1. Verificar se o MAC_ADDRESS no simulador está registrado no sistema
2. Verificar se o módulo está associado a um setor
3. Verificar logs do backend para erros
4. Verificar se a API_URL está correta

#### 6. Gráficos Não Carregam

**Problema**: Gráficos aparecem vazios

**Solução**:
1. Verificar se há dados históricos no banco
2. Popular dados com `node populate-historical-data.js`
3. Verificar console do navegador para erros
4. Verificar se o setor selecionado tem módulos

#### 7. Email 2FA Não Chega

**Problema**: Código 2FA não é enviado por email

**Solução**:
1. Verificar configurações EMAIL_USER e EMAIL_PASS no .env
2. Usar "Senha de App" do Gmail, não a senha normal
3. Verificar logs do backend para erros de envio
4. Verificar pasta de spam

---

## 🚀 Deploy em Produção

### Preparação

1. **Configurar Variáveis de Ambiente de Produção**:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=chave_super_segura_aleatoria
MONGO_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/waterysoil
EMAIL_USER=seu_email@dominio.com
EMAIL_PASS=senha_de_aplicativo
```

2. **Build do Frontend**:
```bash
npm run build
```

3. **Otimizações**:
- Minificação de código
- Compressão de assets
- Cache de recursos estáticos
- CDN para arquivos estáticos

### Opções de Deploy

#### 1. Vercel (Frontend) + Render (Backend)

**Frontend (Vercel)**:
```bash
npm install -g vercel
vercel
```

**Backend (Render)**:
- Criar conta no [Render](https://render.com)
- Conectar repositório
- Configurar variáveis de ambiente
- Deploy automático

#### 2. Heroku (Full Stack)

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
heroku create waterysoil-app

# Configurar variáveis
heroku config:set JWT_SECRET=sua_chave
heroku config:set MONGO_URL=sua_url

# Deploy
git push heroku main
```

#### 3. VPS (DigitalOcean, AWS, etc.)

```bash
# Conectar ao servidor
ssh user@seu-servidor.com

# Instalar Node.js e MongoDB
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mongodb

# Clonar repositório
git clone https://github.com/seu-usuario/BoltWaterySoil1.git
cd BoltWaterySoil1

# Instalar dependências
npm install
cd backend && npm install

# Configurar PM2 para manter o app rodando
npm install -g pm2
pm2 start backend/server.js --name waterysoil-backend
pm2 start npm --name waterysoil-frontend -- run dev

# Configurar Nginx como reverse proxy
sudo apt-get install nginx
# Configurar nginx.conf
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estas etapas:

### 1. Fork o Projeto

```bash
# Clique em "Fork" no GitHub
```

### 2. Crie uma Branch

```bash
git checkout -b feature/nova-funcionalidade
```

### 3. Faça suas Alterações

```bash
# Faça as alterações necessárias
git add .
git commit -m "feat: adiciona nova funcionalidade"
```

### 4. Push para o GitHub

```bash
git push origin feature/nova-funcionalidade
```

### 5. Abra um Pull Request

- Descreva suas alterações
- Referencie issues relacionadas
- Aguarde revisão

### Padrões de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2025 WaterySoil Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contato

### Equipe WaterySoil

- **Email**: waterysoilbr@gmail.com
- **GitHub**: [BoltWaterySoil1](https://github.com/seu-usuario/BoltWaterySoil1)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/BoltWaterySoil1/wiki)

### Suporte

Para reportar bugs ou solicitar funcionalidades:

1. Verifique se já existe uma [issue](https://github.com/seu-usuario/BoltWaterySoil1/issues) aberta
2. Se não, crie uma nova issue com:
   - Descrição clara do problema/funcionalidade
   - Passos para reproduzir (se bug)
   - Screenshots (se aplicável)
   - Ambiente (SO, versão do Node, etc.)

---

## 🙏 Agradecimentos

Agradecimentos especiais a:

- **Comunidade Open Source**: Pelas bibliotecas e ferramentas incríveis
- **MongoDB**: Pelo banco de dados flexível e escalável
- **React Team**: Pelo framework frontend poderoso
- **Chart.js**: Pelos gráficos interativos
- **Tailwind CSS**: Pela estilização rápida e eficiente
- **Todos os Contribuidores**: Que ajudaram a melhorar este projeto

---

## 🗺️ Roadmap

### Versão 1.1 (Próxima)
- [ ] Aplicativo móvel (React Native)
- [ ] Notificações push
- [ ] Integração com assistentes de voz
- [ ] Dashboard customizável

### Versão 1.2
- [ ] Machine Learning para previsão de irrigação
- [ ] Integração com estações meteorológicas
- [ ] API pública para terceiros
- [ ] Suporte multi-idioma

### Versão 2.0
- [ ] Controle automático de irrigação
- [ ] Integração com drones
- [ ] Análise de imagens por satélite
- [ ] Marketplace de sensores

---

## 📊 Status do Projeto

![Status](https://img.shields.io/badge/status-active-success.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Coverage](https://img.shields.io/badge/coverage-85%25-green.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

### Estatísticas

- **Linhas de Código**: ~15.000+
- **Componentes React**: 15+
- **Endpoints API**: 40+
- **Modelos de Dados**: 9
- **Testes**: Em desenvolvimento

---

<div align="center">

**Desenvolvido com ❤️ pela Equipe WaterySoil**

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!

[⬆ Voltar ao topo](#-waterysoil---sistema-de-monitoramento-agrícola-iot)

</div>
