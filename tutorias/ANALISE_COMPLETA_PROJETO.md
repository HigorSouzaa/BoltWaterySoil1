# 📊 Análise Completa do Projeto WaterySoil

## 🎯 Visão Geral do Sistema

**WaterySoil** é uma plataforma completa de monitoramento agrícola IoT que integra hardware (Eco-Soil Pro) com software web para análise de dados de sensores em tempo real.

### Propósito
- Monitoramento em tempo real de condições do solo (umidade, temperatura, NPK, pH)
- Gestão de ambientes agrícolas, setores e módulos de sensores
- Agendamento e controle de manutenções
- Visualização de dados históricos através de gráficos interativos

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

#### **Frontend**
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Estilização:** Tailwind CSS
- **Gráficos:** Chart.js 4 + react-chartjs-2
- **Ícones:** Lucide React
- **Estado:** Context API (AuthContext, NotificationContext)

#### **Backend**
- **Runtime:** Node.js
- **Framework:** Express 5
- **Banco de Dados:** MongoDB + Mongoose
- **Autenticação:** JWT (jsonwebtoken)
- **Segurança:** bcryptjs para hash de senhas
- **Upload:** Multer para avatares
- **Email:** Nodemailer para 2FA

#### **Simuladores IoT**
- **Linguagem:** Node.js
- **HTTP Client:** Axios
- **Configuração:** dotenv

---

## 📁 Estrutura de Diretórios

```
BoltWaterySoil1/
├── backend/                      # API REST Node.js
│   ├── config/
│   │   └── database.js          # Conexão MongoDB
│   ├── controllers/             # Lógica de negócio
│   │   ├── userController.js
│   │   ├── environmentController.js
│   │   ├── sectorController.js
│   │   ├── waterySoilModuleController.js
│   │   ├── maintenanceScheduleController.js
│   │   ├── ecoSoilProController.js
│   │   └── dataSensorsController.js
│   ├── middleware/
│   │   ├── auth.js              # Autenticação JWT
│   │   └── upload.js            # Upload de arquivos
│   ├── models/                  # Schemas Mongoose
│   │   ├── User.js
│   │   ├── Environment.js
│   │   ├── Sector.js
│   │   ├── WaterySoilModule.js
│   │   ├── MaintenanceSchedule.js
│   │   ├── EcoSoilPro.js
│   │   └── DataSensors.js
│   ├── routes/                  # Rotas da API
│   │   ├── userRoutes.js
│   │   ├── environmentRoutes.js
│   │   ├── sectorRoutes.js
│   │   ├── waterySoilModuleRoutes.js
│   │   ├── maintenanceScheduleRoutes.js
│   │   ├── ecoSoilProRoutes.js
│   │   └── dataSensorsRoutes.js
│   ├── services/                # Serviços auxiliares
│   ├── package.json
│   └── server.js                # Entry point
│
├── src/                         # Frontend React
│   ├── components/
│   │   ├── Landing.tsx          # Página inicial
│   │   ├── Auth.tsx             # Login/Registro
│   │   ├── Dashboard.tsx        # Dashboard principal
│   │   ├── EnvironmentManager.tsx
│   │   ├── WaterySoilModules.tsx
│   │   ├── MaintenanceSchedule.tsx
│   │   ├── SensorCharts.tsx     # Gráficos de dados
│   │   ├── UserSettings.tsx
│   │   ├── TwoFactorAuth.tsx
│   │   └── Notification.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Gerenciamento de autenticação
│   │   └── NotificationContext.tsx
│   ├── services/                # Serviços de API
│   │   ├── apiService.ts
│   │   ├── authService.ts
│   │   ├── environmentService.ts
│   │   ├── sectorService.ts
│   │   ├── waterySoilModuleService.ts
│   │   ├── maintenanceScheduleService.ts
│   │   ├── userService.ts
│   │   └── parameterClassification.ts
│   ├── types/
│   │   └── auth.ts
│   ├── App.tsx                  # Componente raiz
│   ├── main.tsx                 # Entry point
│   └── index.css
│
├── ecosoil-simulator/           # Simulador de hardware (versão 1)
│   ├── simulator.js
│   ├── simulator-good.js
│   ├── simulator-bad.js
│   ├── simulator-ideal.js
│   └── package.json
│
├── ecosoil-simulator2/          # Simulador de hardware (versão 2)
│   ├── simulator.js
│   ├── simulator-good.js
│   ├── badsimulator.js
│   ├── populate-historical-data.js
│   └── package.json
│
├── tutorias/                    # Documentação técnica
│   ├── GUIA_MANUTENCAO.md
│   ├── GUIA_TRATAMENTO_ERROS.md
│   ├── QUICK_START_SIMULADOR.md
│   ├── SIMULADOR_HARDWARE_ECOSOIL.md
│   ├── DASHBOARD_DADOS_REAIS.md
│   └── TESTE_MANUTENCAO.md
│
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🗄️ Modelo de Dados (MongoDB)

### 1. **User** (Usuário)
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  birthDate: String,
  company: String,
  position: String,
  avatar: String,
  twoFactorEnabled: Boolean,
  timestamps: true
}
```

### 2. **Environment** (Ambiente)
```javascript
{
  name: String,
  description: String,
  user_id: ObjectId (ref: User),
  is_active: Boolean,
  timestamps: true
}
```

### 3. **Sector** (Setor)
```javascript
{
  name: String,
  description: String,
  environment_id: ObjectId (ref: Environment),
  user_id: ObjectId (ref: User),
  is_active: Boolean,
  area_size: Number,
  location: { latitude, longitude },
  soil_type: Enum ['sand', 'loam', 'clay'],
  timestamps: true
}
```

### 4. **WaterySoilModule** (Módulo de Sensor)
```javascript
{
  name: String,
  module_type: Enum ['sensor', 'actuator', 'controller', 'monitor'],
  sector_id: ObjectId (ref: Sector),
  user_id: ObjectId (ref: User),
  status: Enum ['operational', 'offline', 'error', 'maintenance'],
  ip_address: String,
  mac_address: String,
  last_ping: Date,
  configuration: Mixed,
  firmware_version: String,
  sensor_data: {
    soil_moisture: { value, last_update },
    temperature: { value, last_update },
    npk: { nitrogen, phosphorus, potassium, last_update },
    ph: { value, last_update }
  },
  soil_type: Enum ['sand', 'loam', 'clay'],
  is_active: Boolean,
  timestamps: true
}
```

### 5. **EcoSoilPro** (Dispositivo Físico)
```javascript
{
  mac_address: String (unique),
  serial_number: String (unique),
  firmware_version: String,
  hardware_version: String,
  manufacturing_date: Date,
  status: Enum ['registered', 'in_use', 'maintenance', 'deactivated'],
  last_connection: Date,
  notes: String,
  timestamps: true
}
```

### 6. **DataSensors** (Histórico de Leituras)
```javascript
{
  module_id: ObjectId (ref: WaterySoilModule),
  mac_address: String,
  sector_id: ObjectId (ref: Sector),
  serial_number: String,
  reading_timestamp: Date,
  sensor_data: {
    soil_moisture: { value, unit },
    temperature: { value, unit },
    npk: { nitrogen, phosphorus, potassium, unit },
    ph: { value, unit }
  },
  timestamps: true
}
```

### 7. **MaintenanceSchedule** (Cronograma de Manutenção)
```javascript
{
  title: String,
  description: String,
  sector_id: ObjectId (ref: Sector),
  arduino_module_id: ObjectId (ref: WaterySoilModule),
  user_id: ObjectId (ref: User),
  scheduled_date: Date,
  completed_date: Date,
  status: Enum ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'],
  priority: Enum ['low', 'medium', 'high', 'critical'],
  estimated_duration: Number,
  actual_duration: Number,
  assigned_to: String,
  notes: String,
  recurring: { enabled, frequency, end_date },
  timestamps: true
}
```

---

## 🔌 API REST - Endpoints

### Base URL: `http://localhost:3000/api/v1`

### **Autenticação** (`/users`)
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/register` | ❌ | Registrar novo usuário |
| POST | `/login` | ❌ | Login (retorna JWT) |
| POST | `/verify-2fa` | ❌ | Verificar código 2FA |
| GET | `/verify-token` | ✅ | Verificar validade do token |
| POST | `/toggle-2fa` | ✅ | Ativar/desativar 2FA |
| PUT | `/profile` | ✅ | Atualizar perfil |
| POST | `/avatar` | ✅ | Upload de avatar |
| GET | `/profile` | ✅ | Obter perfil |
| PUT | `/password` | ✅ | Alterar senha |

### **Ambientes** (`/environments`)
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ✅ | Listar ambientes do usuário |
| GET | `/:id` | ✅ | Buscar ambiente específico |
| POST | `/` | ✅ | Criar ambiente |
| PUT | `/:id` | ✅ | Atualizar ambiente |
| DELETE | `/:id` | ✅ | Deletar ambiente |

### **Setores** (`/sectors`)
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ✅ | Listar setores do usuário |
| GET | `/:id` | ✅ | Buscar setor específico |
| POST | `/` | ✅ | Criar setor |
| PUT | `/:id` | ✅ | Atualizar setor |
| DELETE | `/:id` | ✅ | Deletar setor |

### **Módulos WaterySoil** (`/waterysoil-modules`)
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ✅ | Listar módulos do usuário |
| GET | `/:id` | ✅ | Buscar módulo específico |
| GET | `/by-mac/:mac_address` | ❌ | Buscar por MAC (hardware) |
| POST | `/` | ✅ | Criar módulo |
| PUT | `/:id` | ✅ | Atualizar módulo |
| PUT | `/:id/sensor-data` | ❌ | Atualizar dados sensores (hardware) |
| POST | `/:id/ping` | ✅ | Ping no módulo |
| GET | `/:id/monitoring-status` | ✅ | Status de monitoramento |
| DELETE | `/:id` | ✅ | Deletar módulo |

### **Dispositivos Eco-Soil Pro** (`/ecosoil-devices`)
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/` | ❌ | Registrar dispositivo |
| GET | `/` | ❌ | Listar dispositivos |
| GET | `/mac/:mac_address` | ❌ | Buscar por MAC |
| PUT | `/:id/status` | ❌ | Atualizar status |

### **Dados dos Sensores** (`/data-sensors`)
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/all` | ✅ | Buscar todos os dados |
| GET | `/aggregated` | ✅ | Dados agregados para gráficos |
| GET | `/module/:moduleId` | ✅ | Histórico de um módulo |
| GET | `/module/:moduleId/latest` | ✅ | Últimas N leituras |
| GET | `/module/:moduleId/average` | ✅ | Média em período |
| GET | `/stats/:moduleId` | ✅ | Estatísticas do módulo |
| GET | `/mac/:macAddress` | ✅ | Histórico por MAC |
| DELETE | `/:id` | ✅ | Deletar registro |

### **Manutenções** (`/maintenance-schedules`)
| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/` | ✅ | Listar manutenções |
| GET | `/:id` | ✅ | Buscar manutenção específica |
| POST | `/` | ✅ | Criar manutenção |
| PUT | `/:id` | ✅ | Atualizar manutenção |
| PUT | `/:id/complete` | ✅ | Marcar como concluída |
| DELETE | `/:id` | ✅ | Deletar manutenção |

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação
1. **Registro:** POST `/api/v1/users/register`
   - Senha é hasheada com bcryptjs
   - Retorna usuário + token JWT

2. **Login:** POST `/api/v1/users/login`
   - Valida email/senha
   - Se 2FA ativo, envia código por email
   - Retorna token JWT

3. **2FA (Opcional):**
   - Código de 6 dígitos enviado por email
   - Válido por tempo limitado
   - POST `/api/v1/users/verify-2fa`

4. **Middleware de Autenticação:**
   - Verifica header `Authorization: Bearer <token>`
   - Valida JWT com `JWT_SECRET`
   - Adiciona `req.user` para rotas protegidas

### Armazenamento
- **Token:** `localStorage.setItem('token', jwt)`
- **Usuário:** `localStorage.setItem('user', JSON.stringify(user))`

---

## 🌐 Fluxo de Dados IoT

### 1. Registro do Hardware (Empresa)
```
Empresa → POST /api/v1/ecosoil-devices
{
  mac_address: "AA:BB:CC:DD:EE:FF",
  serial_number: "ECOSOIL-2024-001",
  firmware_version: "1.0.0",
  hardware_version: "v1"
}
→ Status: "registered"
```

### 2. Cadastro do Módulo (Cliente)
```
Cliente → POST /api/v1/waterysoil-modules
{
  name: "Sensor Setor A",
  mac_address: "AA:BB:CC:DD:EE:FF",
  sector_id: "..."
}
→ EcoSoilPro.status muda para "in_use"
```

### 3. Hardware Envia Dados
```
Simulador/Hardware:
1. GET /api/v1/ecosoil-devices/mac/:mac → Identifica dispositivo
2. GET /api/v1/waterysoil-modules/by-mac/:mac → Encontra módulo
3. PUT /api/v1/waterysoil-modules/:id/sensor-data → Envia leituras
   {
     soil_moisture: 51.2,
     temperature: 25.3,
     npk: { nitrogen: 40, phosphorus: 30, potassium: 35 },
     ph: 6.5
   }
4. Salva em DataSensors (histórico)
5. Atualiza WaterySoilModule.sensor_data (último valor)
```

### 4. Dashboard Exibe Dados
```
Frontend:
1. GET /api/v1/waterysoil-modules → Lista módulos
2. Exibe sensor_data de cada módulo
3. GET /api/v1/data-sensors/aggregated → Gráficos históricos
```

---

## 📊 Sistema de Gráficos

### Componente: `SensorCharts.tsx`

**Funcionalidades:**
- Visualização diária, semanal e mensal
- 4 gráficos: Umidade, Temperatura, NPK, pH
- Filtros por setor
- Atualização automática

**Endpoint:** `GET /api/v1/data-sensors/aggregated`

**Query Params:**
- `period`: 'daily' | 'weekly' | 'monthly'
- `sector_id`: ID do setor

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-10-24T10:00:00Z",
      "soil_moisture": 51.2,
      "temperature": 25.3,
      "nitrogen": 40,
      "phosphorus": 30,
      "potassium": 35,
      "ph": 6.5
    }
  ]
}
```


