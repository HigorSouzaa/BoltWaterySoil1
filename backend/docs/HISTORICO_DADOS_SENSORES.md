# 📊 Sistema de Histórico de Dados dos Sensores

## 🎯 Objetivo

Armazenar **todas as leituras** enviadas pelos hardwares Eco-Soil Pro em um histórico permanente, permitindo análises, gráficos e relatórios.

**Intervalo padrão: 10 minutos** (144 leituras/dia por módulo)

---

## 🗂️ Estrutura

### **Antes:**
```
WaterySoilModule
└─> sensor_data (apenas valores atuais)
```

### **Agora:**
```
WaterySoilModule
└─> sensor_data (valores atuais - última leitura)

DataSensors (NOVO!)
└─> Histórico completo de todas as leituras
    ├─> Leitura 1 (10:00:00)
    ├─> Leitura 2 (10:00:10)
    ├─> Leitura 3 (10:00:20)
    └─> ...
```

---

## 📋 Schema DataSensors

### **Campos Principais:**

```javascript
{
  // Identificação
  module_id: ObjectId,           // Referência ao WaterySoilModule
  mac_address: String,           // MAC do hardware
  serial_number: String,         // Serial do Eco-Soil Pro
  reading_timestamp: Date,       // Data/hora da leitura
  
  // Dados dos sensores
  sensor_data: {
    soil_moisture: { value, unit },
    temperature: { value, unit },
    npk: { nitrogen, phosphorus, potassium, unit },
    ph: { value, unit }
  },
  
  // Metadados (opcionais)
  metadata: {
    signal_strength: Number,     // Qualidade do sinal (0-100)
    battery_level: Number,       // Nível de bateria (0-100)
    firmware_version: String,    // Versão do firmware
    ip_address: String,          // IP do hardware
    location: {                  // GPS (se disponível)
      latitude: Number,
      longitude: Number
    },
    notes: String                // Observações
  },
  
  // Validação
  status: String,                // valid, warning, error, calibration
  validation: {
    is_valid: Boolean,           // Se os valores são válidos
    messages: [String]           // Mensagens de validação
  },
  
  // Timestamps automáticos
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Fluxo de Dados

### **1. Hardware Envia Dados**

```javascript
PUT /api/v1/waterysoil-modules/:id/sensor-data

{
  "sensor_data": {
    "soil_moisture": { "value": 51.2, "last_update": "2024-01-15T10:00:00Z" },
    "temperature": { "value": 25.3, "last_update": "2024-01-15T10:00:00Z" },
    "npk": { "nitrogen": 40.5, "phosphorus": 30.2, "potassium": 35.1 },
    "ph": { "value": 6.52, "last_update": "2024-01-15T10:00:00Z" }
  },
  "metadata": {
    "signal_strength": 85,
    "battery_level": 92,
    "firmware_version": "1.0.0"
  }
}
```

### **2. Backend Processa**

```javascript
// A) Salva no histórico (DataSensors)
const historicalData = new DataSensors({
  module_id: module._id,
  mac_address: module.mac_address,
  serial_number: ecoSoilDevice.serial_number,
  reading_timestamp: new Date(),
  sensor_data: sensor_data,
  metadata: metadata
});
await historicalData.save();

// B) Atualiza valores atuais (WaterySoilModule)
module.sensor_data = sensor_data;
module.status = 'operational';
module.last_ping = new Date();
await module.save();
```

### **3. Validação Automática**

O sistema valida automaticamente os valores:

```javascript
// Umidade
if (moisture < 10) → "Umidade muito baixa - solo seco"
if (moisture > 90) → "Umidade muito alta - solo encharcado"

// Temperatura
if (temp < 5) → "Temperatura muito baixa"
if (temp > 45) → "Temperatura muito alta"

// pH
if (ph < 4) → "pH muito ácido"
if (ph > 9) → "pH muito alcalino"
```

---

## 🛠️ APIs Disponíveis

### **1. Buscar Histórico de um Módulo**

```http
GET /api/v1/data-sensors/module/:moduleId?limit=100&page=1&startDate=2024-01-01&endDate=2024-01-31
```

**Resposta:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 1500,
    "page": 1,
    "limit": 100,
    "pages": 15
  }
}
```

---

### **2. Buscar Últimas N Leituras**

```http
GET /api/v1/data-sensors/module/:moduleId/latest?limit=10
```

**Resposta:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "...",
      "reading_timestamp": "2024-01-15T10:00:30Z",
      "sensor_data": {
        "soil_moisture": { "value": 51.2 },
        "temperature": { "value": 25.3 },
        ...
      }
    },
    ...
  ]
}
```

---

### **3. Calcular Média em um Período**

```http
GET /api/v1/data-sensors/module/:moduleId/average?startDate=2024-01-01&endDate=2024-01-31
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "avg_moisture": 52.3,
    "avg_temperature": 25.1,
    "avg_nitrogen": 40.2,
    "avg_phosphorus": 30.5,
    "avg_potassium": 35.0,
    "avg_ph": 6.5,
    "count": 1500
  },
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  }
}
```

---

### **4. Estatísticas do Módulo**

```http
GET /api/v1/data-sensors/stats/:moduleId?days=7
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "avg_moisture": 52.3,
    "min_moisture": 45.0,
    "max_moisture": 60.0,
    "avg_temperature": 25.1,
    "min_temperature": 20.0,
    "max_temperature": 30.0,
    "avg_ph": 6.5,
    "min_ph": 6.0,
    "max_ph": 7.0,
    "total_readings": 1008,
    "first_reading": "2024-01-08T00:00:00Z",
    "last_reading": "2024-01-15T10:00:00Z"
  },
  "period": {
    "days": 7,
    "start": "2024-01-08T00:00:00Z",
    "end": "2024-01-15T10:00:00Z"
  }
}
```

---

### **5. Buscar por MAC Address**

```http
GET /api/v1/data-sensors/mac/:macAddress?limit=100
```

---

### **6. Deletar Registro**

```http
DELETE /api/v1/data-sensors/:id
```

---

## 📊 Casos de Uso

### **1. Gráfico de Umidade (Últimas 24h)**

```javascript
// Frontend
const response = await fetch(
  `/api/v1/data-sensors/module/${moduleId}/latest?limit=144`
);
const data = await response.json();

// Plotar gráfico com data.data
const chartData = data.data.map(reading => ({
  timestamp: reading.reading_timestamp,
  value: reading.sensor_data.soil_moisture.value
}));
```

---

### **2. Relatório Mensal**

```javascript
const startDate = '2024-01-01';
const endDate = '2024-01-31';

const response = await fetch(
  `/api/v1/data-sensors/module/${moduleId}/average?startDate=${startDate}&endDate=${endDate}`
);
const averages = await response.json();

console.log(`Média de umidade em janeiro: ${averages.data.avg_moisture}%`);
```

---

### **3. Dashboard com Estatísticas**

```javascript
const response = await fetch(
  `/api/v1/data-sensors/stats/${moduleId}?days=7`
);
const stats = await response.json();

// Mostrar no dashboard:
// - Média da semana
// - Valores mín/máx
// - Total de leituras
```

---

## 🔍 Índices do Banco de Dados

Para performance otimizada:

```javascript
// Índices simples
module_id (index)
mac_address (index)
reading_timestamp (index)
is_active (index)

// Índices compostos
{ module_id: 1, reading_timestamp: -1 }
{ mac_address: 1, reading_timestamp: -1 }
{ reading_timestamp: -1, is_active: 1 }
```

---

## ✅ Validações Automáticas

### **Umidade do Solo:**
- ❌ < 10% → "Umidade muito baixa - solo seco"
- ✅ 10-90% → Válido
- ❌ > 90% → "Umidade muito alta - solo encharcado"

### **Temperatura:**
- ❌ < 5°C → "Temperatura muito baixa"
- ✅ 5-45°C → Válido
- ❌ > 45°C → "Temperatura muito alta"

### **pH:**
- ❌ < 4 → "pH muito ácido"
- ✅ 4-9 → Válido
- ❌ > 9 → "pH muito alcalino"

---

## 🎯 Benefícios

### **1. Histórico Completo**
- Todas as leituras são salvas permanentemente
- Possibilidade de análise histórica

### **2. Análises Avançadas**
- Médias, mínimos, máximos
- Tendências ao longo do tempo
- Comparações entre períodos

### **3. Gráficos e Relatórios**
- Dados prontos para visualização
- Exportação para Excel/PDF

### **4. Rastreabilidade**
- Saber exatamente quando cada leitura foi feita
- Identificar qual hardware enviou os dados
- Metadados adicionais (bateria, sinal, GPS)

### **5. Validação de Qualidade**
- Identificar leituras inválidas
- Alertas automáticos para valores fora do normal

---

## 🚀 Próximos Passos

### **Frontend:**
1. Criar página de histórico com tabela paginada
2. Implementar gráficos (Chart.js ou Recharts)
3. Adicionar filtros por data
4. Exportar dados para CSV/Excel

### **Backend:**
1. ✅ Schema DataSensors criado
2. ✅ Controller com todas as funções
3. ✅ Rotas configuradas
4. ✅ Integração com updateSensorData

---

## 📝 Exemplo de Uso Completo

```javascript
// 1. Hardware envia dados (a cada 10s)
PUT /api/v1/waterysoil-modules/123/sensor-data
{ sensor_data: {...}, metadata: {...} }

// 2. Backend salva no histórico + atualiza módulo
✅ DataSensors.save()
✅ WaterySoilModule.save()

// 3. Frontend busca últimas 24h para gráfico
GET /api/v1/data-sensors/module/123/latest?limit=144

// 4. Frontend mostra estatísticas da semana
GET /api/v1/data-sensors/stats/123?days=7

// 5. Usuário exporta relatório mensal
GET /api/v1/data-sensors/module/123?startDate=2024-01-01&endDate=2024-01-31
```

---

**Desenvolvido para o projeto WaterySoil** 🌱

