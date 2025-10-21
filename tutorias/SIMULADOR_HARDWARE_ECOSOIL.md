# 🔧 Tutorial: Simulador de Hardware Eco-Soil Pro

## 📋 Objetivo

Criar uma API/Servidor que simula o hardware Eco-Soil Pro enviando dados de sensores para o banco de dados, como se fosse o dispositivo físico real.

---

## 🎯 Como Funciona

1. **Hardware (simulado) liga** e se identifica pelo MAC Address
2. **Busca no banco** qual dispositivo Eco-Soil Pro ele é
3. **Encontra o WaterySoilModule** vinculado a esse MAC Address
4. **Envia dados dos sensores** periodicamente (ex: a cada 10 segundos)
5. **Atualiza o banco** com novos valores simulados

---

## 🗂️ Estrutura do Projeto

```
ecosoil-simulator/
├── package.json
├── .env
├── simulator.js          # Arquivo principal
└── README.md
```

---

## 📦 1. Configuração Inicial

### **package.json**

```json
{
  "name": "ecosoil-hardware-simulator",
  "version": "1.0.0",
  "description": "Simulador de Hardware Eco-Soil Pro",
  "main": "simulator.js",
  "scripts": {
    "start": "node simulator.js",
    "dev": "nodemon simulator.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### **Instalar dependências:**

```bash
npm install
```

---

## 🔐 2. Configuração (.env)

Crie um arquivo `.env` na raiz:

```env
# URL da API do WaterySoil
API_URL=http://localhost:3000/api/v1

# MAC Address do dispositivo (cada hardware tem um único)
MAC_ADDRESS=AA:BB:CC:DD:EE:FF

# Intervalo de envio de dados (em milissegundos)
SEND_INTERVAL=10000

# Modo de simulação (random = valores aleatórios, realistic = valores realistas)
SIMULATION_MODE=realistic
```

---

## 💻 3. Código do Simulador (simulator.js)

```javascript
require('dotenv').config();
const axios = require('axios');

// ========================================
// CONFIGURAÇÕES
// ========================================

const CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
  macAddress: process.env.MAC_ADDRESS || 'AA:BB:CC:DD:EE:FF',
  sendInterval: parseInt(process.env.SEND_INTERVAL) || 10000,
  simulationMode: process.env.SIMULATION_MODE || 'realistic'
};

// ========================================
// ESTADO DO HARDWARE
// ========================================

let hardwareState = {
  ecoSoilDevice: null,      // Dispositivo Eco-Soil Pro registrado
  waterySoilModule: null,   // Módulo vinculado
  isConnected: false,
  lastSensorData: {
    soil_moisture: 50,
    temperature: 25,
    nitrogen: 40,
    phosphorus: 30,
    potassium: 35,
    ph: 6.5
  }
};

// ========================================
// FUNÇÕES DE SIMULAÇÃO DE SENSORES
// ========================================

/**
 * Gera valores realistas de sensores com variação gradual
 */
function generateRealisticSensorData() {
  const { lastSensorData } = hardwareState;

  // Variação pequena e gradual (±2% para umidade, ±0.5°C para temperatura, etc.)
  return {
    soil_moisture: clamp(lastSensorData.soil_moisture + (Math.random() - 0.5) * 4, 0, 100),
    temperature: clamp(lastSensorData.temperature + (Math.random() - 0.5) * 1, 15, 35),
    nitrogen: clamp(lastSensorData.nitrogen + (Math.random() - 0.5) * 2, 0, 100),
    phosphorus: clamp(lastSensorData.phosphorus + (Math.random() - 0.5) * 2, 0, 100),
    potassium: clamp(lastSensorData.potassium + (Math.random() - 0.5) * 2, 0, 100),
    ph: clamp(lastSensorData.ph + (Math.random() - 0.5) * 0.2, 0, 14)
  };
}

/**
 * Gera valores completamente aleatórios
 */
function generateRandomSensorData() {
  return {
    soil_moisture: Math.random() * 100,
    temperature: 15 + Math.random() * 20,
    nitrogen: Math.random() * 100,
    phosphorus: Math.random() * 100,
    potassium: Math.random() * 100,
    ph: Math.random() * 14
  };
}

/**
 * Limita valor entre min e max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ========================================
// FUNÇÕES DE COMUNICAÇÃO COM A API
// ========================================

/**
 * 1. Identifica o dispositivo Eco-Soil Pro pelo MAC Address
 */
async function identifyDevice() {
  try {
    console.log(`🔍 Identificando dispositivo com MAC: ${CONFIG.macAddress}...`);
    
    const response = await axios.get(
      `${CONFIG.apiUrl}/ecosoil-devices/mac/${CONFIG.macAddress}`
    );

    if (response.data.success) {
      hardwareState.ecoSoilDevice = response.data.data;
      console.log(`✅ Dispositivo encontrado: ${hardwareState.ecoSoilDevice.serial_number}`);
      console.log(`   Status: ${hardwareState.ecoSoilDevice.status}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Erro ao identificar dispositivo:`, error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 2. Busca o módulo WaterySoil vinculado a este MAC Address
 */
async function findLinkedModule() {
  try {
    console.log(`🔍 Buscando módulo vinculado ao MAC: ${CONFIG.macAddress}...`);
    
    // Nota: Esta rota precisa ser criada no backend (ver seção 4 deste tutorial)
    const response = await axios.get(
      `${CONFIG.apiUrl}/waterysoil-modules/by-mac/${CONFIG.macAddress}`
    );

    if (response.data.success) {
      hardwareState.waterySoilModule = response.data.data;
      console.log(`✅ Módulo encontrado: ${hardwareState.waterySoilModule.name}`);
      console.log(`   ID: ${hardwareState.waterySoilModule._id}`);
      hardwareState.isConnected = true;
      return true;
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar módulo:`, error.response?.data?.message || error.message);
    console.log(`⚠️  Certifique-se de que um módulo foi cadastrado com este MAC Address`);
    return false;
  }
}

/**
 * 3. Envia dados dos sensores para o módulo
 */
async function sendSensorData() {
  if (!hardwareState.isConnected || !hardwareState.waterySoilModule) {
    console.log(`⚠️  Hardware não conectado. Tentando reconectar...`);
    await connectHardware();
    return;
  }

  try {
    // Gera novos dados dos sensores
    const sensorData = CONFIG.simulationMode === 'realistic' 
      ? generateRealisticSensorData()
      : generateRandomSensorData();

    // Atualiza o estado local
    hardwareState.lastSensorData = sensorData;

    // Prepara payload para enviar
    const payload = {
      sensor_data: {
        soil_moisture: {
          value: parseFloat(sensorData.soil_moisture.toFixed(1)),
          last_update: new Date()
        },
        temperature: {
          value: parseFloat(sensorData.temperature.toFixed(1)),
          last_update: new Date()
        },
        npk: {
          nitrogen: parseFloat(sensorData.nitrogen.toFixed(1)),
          phosphorus: parseFloat(sensorData.phosphorus.toFixed(1)),
          potassium: parseFloat(sensorData.potassium.toFixed(1)),
          last_update: new Date()
        },
        ph: {
          value: parseFloat(sensorData.ph.toFixed(2)),
          last_update: new Date()
        }
      }
    };

    // Envia para a API
    // Nota: Esta rota precisa ser criada no backend (ver seção 4 deste tutorial)
    const response = await axios.put(
      `${CONFIG.apiUrl}/waterysoil-modules/${hardwareState.waterySoilModule._id}/sensor-data`,
      payload
    );

    if (response.data.success) {
      console.log(`📡 Dados enviados com sucesso:`, {
        umidade: `${sensorData.soil_moisture.toFixed(1)}%`,
        temperatura: `${sensorData.temperature.toFixed(1)}°C`,
        npk: `N:${sensorData.nitrogen.toFixed(1)} P:${sensorData.phosphorus.toFixed(1)} K:${sensorData.potassium.toFixed(1)}`,
        ph: sensorData.ph.toFixed(2)
      });
    }
  } catch (error) {
    console.error(`❌ Erro ao enviar dados:`, error.response?.data?.message || error.message);
    
    // Se erro 404, o módulo pode ter sido deletado
    if (error.response?.status === 404) {
      console.log(`⚠️  Módulo não encontrado. Reconectando...`);
      hardwareState.isConnected = false;
    }
  }
}

// ========================================
// FUNÇÕES DE CONTROLE DO HARDWARE
// ========================================

/**
 * Conecta o hardware ao sistema
 */
async function connectHardware() {
  console.log(`\n🚀 Iniciando Hardware Eco-Soil Pro...`);
  console.log(`   MAC Address: ${CONFIG.macAddress}`);
  console.log(`   Modo: ${CONFIG.simulationMode}`);
  console.log(`   Intervalo: ${CONFIG.sendInterval}ms\n`);

  // Passo 1: Identificar dispositivo
  const deviceFound = await identifyDevice();
  if (!deviceFound) {
    console.log(`\n❌ Dispositivo não encontrado no banco de dados!`);
    console.log(`   Registre o dispositivo primeiro em: http://localhost:5173/register-ecosoil.html\n`);
    return false;
  }

  // Passo 2: Buscar módulo vinculado
  const moduleFound = await findLinkedModule();
  if (!moduleFound) {
    console.log(`\n❌ Nenhum módulo vinculado a este MAC Address!`);
    console.log(`   Cadastre um módulo WaterySoil com este MAC Address primeiro.\n`);
    return false;
  }

  console.log(`\n✅ Hardware conectado com sucesso!\n`);
  return true;
}

/**
 * Inicia o loop de envio de dados
 */
function startSendingData() {
  console.log(`📡 Iniciando envio de dados a cada ${CONFIG.sendInterval}ms...\n`);
  
  // Envia imediatamente
  sendSensorData();
  
  // Depois envia periodicamente
  setInterval(sendSensorData, CONFIG.sendInterval);
}

// ========================================
// INICIALIZAÇÃO
// ========================================

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  🌱 SIMULADOR DE HARDWARE ECO-SOIL PRO`);
  console.log(`${'='.repeat(60)}\n`);

  const connected = await connectHardware();
  
  if (connected) {
    startSendingData();
  } else {
    console.log(`❌ Falha ao conectar. Encerrando...\n`);
    process.exit(1);
  }
}

// Inicia o simulador
main();

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});
```

---

## 🔌 4. Rotas Necessárias no Backend

Você precisa adicionar 2 novas rotas no backend do WaterySoil:

### **A) Buscar módulo por MAC Address**

**Arquivo:** `backend/controllers/waterySoilModuleController.js`

Adicione esta função:

```javascript
// GET /api/v1/waterysoil-modules/by-mac/:mac_address - Buscar módulo por MAC (SEM autenticação)
const getWaterySoilModuleByMAC = async (req, res) => {
  try {
    const { mac_address } = req.params;

    const module = await WaterySoilModule.findOne({
      mac_address: mac_address.toUpperCase(),
      is_active: true
    })
      .populate('sector_id', 'name environment_id')
      .populate({
        path: 'sector_id',
        populate: {
          path: 'environment_id',
          select: 'name'
        }
      });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Nenhum módulo encontrado com este MAC Address"
      });
    }

    return res.status(200).json({
      success: true,
      data: module
    });
  } catch (error) {
    console.error('Erro ao buscar módulo por MAC:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};
```

### **B) Atualizar dados dos sensores**

Adicione esta função no mesmo arquivo:

```javascript
// PUT /api/v1/waterysoil-modules/:id/sensor-data - Atualizar dados dos sensores (SEM autenticação)
const updateSensorData = async (req, res) => {
  try {
    const { sensor_data } = req.body;

    const module = await WaterySoilModule.findOne({
      _id: req.params.id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo não encontrado"
      });
    }

    // Atualiza os dados dos sensores
    module.sensor_data = sensor_data;
    module.status = 'operational'; // Marca como operacional
    module.last_ping = new Date();

    await module.save();

    return res.status(200).json({
      success: true,
      data: module,
      message: "Dados dos sensores atualizados com sucesso"
    });
  } catch (error) {
    console.error('Erro ao atualizar dados dos sensores:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};
```

### **C) Exportar as novas funções**

No final do arquivo `waterySoilModuleController.js`:

```javascript
module.exports = {
  getWaterySoilModules,
  getWaterySoilModuleById,
  createWaterySoilModule,
  updateWaterySoilModule,
  pingWaterySoilModule,
  deleteWaterySoilModule,
  getWaterySoilModuleByMAC,    // ← NOVO
  updateSensorData              // ← NOVO
};
```

### **D) Adicionar rotas públicas**

**Arquivo:** `backend/routes/waterySoilModuleRoutes.js`

Adicione ANTES das rotas protegidas:

```javascript
// Rotas PÚBLICAS (sem autenticação) - para o hardware
router.get('/by-mac/:mac_address', waterySoilModuleController.getWaterySoilModuleByMAC);
router.put('/:id/sensor-data', waterySoilModuleController.updateSensorData);

// Rotas protegidas (com autenticação)
router.use(authMiddleware);
// ... resto das rotas
```

---

## 🚀 5. Como Usar

### **Passo 1: Registrar o dispositivo Eco-Soil Pro**

Abra `register-ecosoil.html` e cadastre:
- MAC Address: `AA:BB:CC:DD:EE:FF`
- Serial Number: `ECOSOIL-2024-001`

### **Passo 2: Cadastrar um módulo WaterySoil**

No sistema principal, cadastre um módulo usando o mesmo MAC Address.

### **Passo 3: Configurar o simulador**

Edite o `.env`:
```env
MAC_ADDRESS=AA:BB:CC:DD:EE:FF
SEND_INTERVAL=10000
SIMULATION_MODE=realistic
```

### **Passo 4: Executar o simulador**

```bash
npm start
```

### **Saída esperada:**

```
============================================================
  🌱 SIMULADOR DE HARDWARE ECO-SOIL PRO
============================================================

🚀 Iniciando Hardware Eco-Soil Pro...
   MAC Address: AA:BB:CC:DD:EE:FF
   Modo: realistic
   Intervalo: 10000ms

🔍 Identificando dispositivo com MAC: AA:BB:CC:DD:EE:FF...
✅ Dispositivo encontrado: ECOSOIL-2024-001
   Status: in_use

🔍 Buscando módulo vinculado ao MAC: AA:BB:CC:DD:EE:FF...
✅ Módulo encontrado: Sensor Eco-Soil Pro
   ID: 67890abcdef12345

✅ Hardware conectado com sucesso!

📡 Iniciando envio de dados a cada 10000ms...

📡 Dados enviados com sucesso: {
  umidade: '51.2%',
  temperatura: '25.3°C',
  npk: 'N:40.5 P:30.2 K:35.1',
  ph: '6.52'
}
```

---

## 📊 6. Modos de Simulação

### **Modo Realistic (Recomendado)**

```env
SIMULATION_MODE=realistic
```

- Valores variam gradualmente (±2% por leitura)
- Simula comportamento real de sensores
- Valores ficam dentro de faixas realistas

### **Modo Random**

```env
SIMULATION_MODE=random
```

- Valores completamente aleatórios
- Útil para testes de stress
- Pode gerar valores irrealistas

---

## 🔧 7. Múltiplos Hardwares

Para simular vários dispositivos, crie múltiplas instâncias:

```bash
# Terminal 1
MAC_ADDRESS=AA:BB:CC:DD:EE:01 npm start

# Terminal 2
MAC_ADDRESS=AA:BB:CC:DD:EE:02 npm start

# Terminal 3
MAC_ADDRESS=AA:BB:CC:DD:EE:03 npm start
```

---

## ✅ Checklist de Implementação

- [ ] Criar projeto `ecosoil-simulator`
- [ ] Instalar dependências (`npm install`)
- [ ] Criar arquivo `.env` com configurações
- [ ] Copiar código do `simulator.js`
- [ ] Adicionar rotas no backend (`getWaterySoilModuleByMAC` e `updateSensorData`)
- [ ] Registrar dispositivo Eco-Soil Pro
- [ ] Cadastrar módulo WaterySoil com MAC Address
- [ ] Executar simulador (`npm start`)
- [ ] Verificar dados no Dashboard

---

## 🐛 Troubleshooting

### Erro: "Dispositivo não encontrado"
- Verifique se o MAC Address está correto no `.env`
- Registre o dispositivo em `register-ecosoil.html`

### Erro: "Nenhum módulo vinculado"
- Cadastre um módulo WaterySoil com o MAC Address
- Verifique se o módulo está ativo

### Erro: "Erro ao enviar dados"
- Verifique se o backend está rodando
- Confirme que as rotas foram adicionadas corretamente
- Verifique a URL da API no `.env`

---

## 📝 Notas Finais

- O simulador **não precisa de autenticação** (rotas públicas)
- Os dados são enviados **diretamente ao banco** via API
- O Dashboard **atualiza automaticamente** a cada 10 segundos
- Você pode **parar e reiniciar** o simulador a qualquer momento

---

**Desenvolvido para o projeto WaterySoil** 🌱

