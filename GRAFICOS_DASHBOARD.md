# 📊 Sistema de Gráficos do Dashboard - WaterySoil

## 🎯 Visão Geral

Implementação completa de um sistema de gráficos profissional para análise de dados dos sensores IoT com visualização **diária**, **semanal** e **mensal**.

---

## 🏗️ Arquitetura do Sistema

### **Frontend (React + TypeScript)**
```
src/
├── components/
│   ├── SensorCharts.tsx          # Componente principal de gráficos
│   └── Dashboard.tsx              # Dashboard integrado
└── services/
    └── sensorReadingService.ts    # Serviço de API
```

### **Backend (Node.js + Express)**
```
backend/
├── controllers/
│   └── sensorReadingController.js  # Lógica de negócio
├── routes/
│   └── sensorReadingRoutes.js      # Rotas da API
└── models/
    └── WaterySoilModule.js         # Modelo de dados
```

---

## 📈 Tipos de Gráficos

### **1. Gráfico de Linha (Tendências)**
- **Biblioteca:** Chart.js + react-chartjs-2
- **Tipo:** Line Chart com área preenchida
- **Dados:**
  - pH do Solo (verde)
  - Umidade do Solo (azul)
  - Temperatura (laranja)
  - NPK Médio (roxo)

### **2. Gráfico de Barras (Comparativo)**
- **Tipo:** Bar Chart
- **Comparação:** Média Atual vs. Valores Ideais
- **Sensores:** pH, Umidade, Temperatura, NPK

---

## 🔄 Períodos de Análise

### **📅 Diário (24 horas)**
- **Pontos de dados:** 12 (a cada 2 horas)
- **Labels:** "00:00", "02:00", "04:00", ..., "22:00"
- **Atualização:** A cada 30 segundos

### **📊 Semanal (7 dias)**
- **Pontos de dados:** 7 (1 por dia)
- **Labels:** "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"
- **Atualização:** A cada 30 segundos

### **📉 Mensal (30 dias)**
- **Pontos de dados:** 30 (1 por dia)
- **Labels:** "1/10", "2/10", "3/10", ..., "30/10"
- **Atualização:** A cada 30 segundos

---

## 🎨 Interface do Usuário

### **Seletor de Período**
```tsx
┌─────────────────────────────────────────┐
│  📊 Análise de Sensores                 │
│                                         │
│  [ 📅 Diário ] [ 📈 Semanal ] [ 📊 Mensal ] │
└─────────────────────────────────────────┘
```

### **Gráfico de Tendências**
```
┌─────────────────────────────────────────┐
│  Tendências - Últimas 24 Horas          │
│  Acompanhe a evolução dos parâmetros    │
│                                         │
│  [Gráfico de Linha Interativo]          │
│                                         │
│  ● pH do Solo  ● Umidade  ● Temp  ● NPK │
└─────────────────────────────────────────┘
```

### **Gráfico Comparativo**
```
┌─────────────────────────────────────────┐
│  Comparativo com Valores Ideais         │
│  Média do período vs. valores recomendados│
│                                         │
│  [Gráfico de Barras]                    │
│                                         │
│  ■ Média Atual  ■ Ideal                 │
└─────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### **1. GET /api/v1/data-sensors/aggregated**
Busca dados agregados para gráficos

**Query Parameters:**
- `sectorId` (obrigatório): ID do setor
- `timeRange`: "daily" | "weekly" | "monthly"

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": ["00:00", "02:00", "04:00", ...],
    "ph": [6.5, 6.7, 6.4, ...],
    "moisture": [65, 68, 62, ...],
    "temperature": [25, 26, 24, ...],
    "npk": [45, 47, 44, ...]
  }
}
```

### **2. GET /api/v1/data-sensors/module/:moduleId**
Busca histórico de um módulo

**Query Parameters:**
- `limit`: Limite de registros (padrão: 100)
- `page`: Página (padrão: 1)
- `startDate`: Data inicial
- `endDate`: Data final

### **3. GET /api/v1/data-sensors/stats/:moduleId**
Busca estatísticas do módulo

**Query Parameters:**
- `days`: Número de dias (padrão: 7)

**Response:**
```json
{
  "success": true,
  "data": {
    "avg_moisture": 65,
    "min_moisture": 60,
    "max_moisture": 70,
    "avg_temperature": 25,
    "min_temperature": 20,
    "max_temperature": 30,
    "avg_ph": 6.5,
    "min_ph": 6.0,
    "max_ph": 7.0,
    "avg_nitrogen": 45,
    "avg_phosphorus": 50,
    "avg_potassium": 40,
    "total_readings": 100,
    "first_reading": "2025-10-01T00:00:00.000Z",
    "last_reading": "2025-10-02T20:04:14.020Z"
  }
}
```

### **4. GET /api/v1/data-sensors/module/:moduleId/latest**
Busca últimas N leituras de um módulo

**Query Parameters:**
- `limit`: Número de leituras (padrão: 10)

---

## 💾 Estrutura de Dados MongoDB

### **Coleção: waterySoilModules**
```javascript
{
  _id: ObjectId("dee43daf4cf8af12ba9d96c3"),
  module_id: "68f7b6b4fb740ac81af8f564",
  mac_address: "AA:BB:CC:DD:EE:FF",
  serial_number: "ECOSOIL-2025-001",
  
  // Dados dos sensores (Eco-Soil Pro)
  sensor_data: {
    ph: {
      value: 6.5,
      unit: "pH"
    },
    npk: {
      nitrogen: 45,
      phosphorus: 50,
      potassium: 40
    },
    soil_moisture: {
      value: 65,
      unit: "%"
    },
    temperature: {
      value: 25,
      unit: "°C"
    }
  },
  
  // Metadados
  metadata: {
    battery_level: 85,
    signal_strength: -65
  },
  
  // Validação
  validation: {
    is_valid: true,
    errors: []
  },
  
  // Timestamps
  reading_timestamp: "2025-10-02T20:04:14.020Z",
  createdAt: "2025-10-02T20:04:14.020Z",
  updatedAt: "2025-10-02T20:04:14.020Z",
  
  // Status
  is_active: true
}
```

---

## 🚀 Como Funciona

### **1. Fluxo de Dados**

```
┌─────────────┐
│ Eco-Soil Pro│ (Sensor IoT)
└──────┬──────┘
       │ Envia dados via HTTP/MQTT
       ▼
┌─────────────────┐
│ Backend API     │
│ POST /readings  │
└──────┬──────────┘
       │ Salva no MongoDB
       ▼
┌─────────────────┐
│ MongoDB         │
│ waterySoilModules│
└──────┬──────────┘
       │ Consulta agregada
       ▼
┌─────────────────┐
│ Backend API     │
│ GET /aggregated │
└──────┬──────────┘
       │ Retorna dados formatados
       ▼
┌─────────────────┐
│ Frontend React  │
│ SensorCharts    │
└──────┬──────────┘
       │ Renderiza gráficos
       ▼
┌─────────────────┐
│ Chart.js        │
│ Visualização    │
└─────────────────┘
```

### **2. Agregação de Dados**

O backend agrupa os dados em intervalos:

**Diário (2 horas):**
```javascript
Intervalo 1: 00:00 - 02:00 → Média de todas as leituras
Intervalo 2: 02:00 - 04:00 → Média de todas as leituras
...
Intervalo 12: 22:00 - 00:00 → Média de todas as leituras
```

**Semanal (1 dia):**
```javascript
Dia 1 (Dom): Média de todas as leituras do dia
Dia 2 (Seg): Média de todas as leituras do dia
...
Dia 7 (Sáb): Média de todas as leituras do dia
```

**Mensal (1 dia):**
```javascript
Dia 1: Média de todas as leituras
Dia 2: Média de todas as leituras
...
Dia 30: Média de todas as leituras
```

---

## 🎨 Personalização

### **Cores dos Sensores**
```javascript
pH do Solo:      rgb(34, 197, 94)   // Verde
Umidade:         rgb(59, 130, 246)  // Azul
Temperatura:     rgb(251, 146, 60)  // Laranja
NPK:             rgb(168, 85, 247)  // Roxo
```

### **Valores Ideais**
```javascript
pH:              6.5
Umidade:         70%
Temperatura:     25°C
NPK:             50%
```

---

## 📱 Responsividade

- **Desktop:** Gráficos lado a lado
- **Tablet:** Gráficos empilhados
- **Mobile:** Gráficos em coluna única

---

## 🔒 Segurança

- ✅ Autenticação JWT obrigatória
- ✅ Validação de setor do usuário
- ✅ Sanitização de inputs
- ✅ Rate limiting (futuro)

---

## 🧪 Testando

### **1. Iniciar Backend**
```bash
cd backend
npm start
```

### **2. Iniciar Frontend**
```bash
npm run dev
```

### **3. Acessar Dashboard**
```
http://localhost:5173
```

### **4. Verificar Gráficos**
1. Faça login
2. Selecione um ambiente e setor
3. Veja os gráficos atualizando automaticamente
4. Alterne entre Diário, Semanal e Mensal

---

## 📊 Exemplo de Uso

```typescript
// Importar componente
import SensorCharts from './components/SensorCharts';

// Usar no Dashboard
<SensorCharts sectorId={activeSector?._id || null} />
```

---

## 🎯 Próximos Passos

- [ ] Adicionar exportação de dados (CSV, PDF)
- [ ] Implementar zoom e pan nos gráficos
- [ ] Adicionar alertas visuais quando valores saem do ideal
- [ ] Criar gráficos de pizza para distribuição NPK
- [ ] Implementar comparação entre setores
- [ ] Adicionar previsões com Machine Learning

---

## 🐛 Troubleshooting

### **Gráficos não aparecem**
- Verifique se o backend está rodando
- Verifique se há dados no MongoDB
- Verifique o console do navegador

### **Dados não atualizam**
- Verifique a conexão com a API
- Verifique o token JWT
- Verifique se o setor está selecionado

### **Erro 404 na API**
- Verifique se as rotas estão registradas no server.js
- Verifique a URL da API no frontend

---

## 📚 Tecnologias Utilizadas

- **Frontend:**
  - React 18
  - TypeScript
  - Chart.js 4
  - react-chartjs-2
  - Tailwind CSS
  - Lucide Icons

- **Backend:**
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - JWT

---

**Desenvolvido com ❤️ para WaterySoil**

