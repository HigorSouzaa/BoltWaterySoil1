require('dotenv').config();
const axios = require('axios');

// ========================================
// CONFIGURAÇÕES
// ========================================

const CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
  macAddress: process.env.MAC_ADDRESS || 'AA:BB:CC:DD:EE:F2',
  sendInterval: parseInt(process.env.SEND_INTERVAL) || 10000,
  simulationMode: 'good' // Sempre valores BONS
};

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          🟡 SIMULADOR ECO-SOIL PRO - VALORES BONS 🟡         ║
╠═══════════════════════════════════════════════════════════════╣
║  Este simulador gera valores BONS para todos os parâmetros   ║
║  - Umidade (VWC): 18-20% ou 30-35% (Franco/Loam)             ║
║  - Temperatura: 15-20°C ou 30-32°C                            ║
║  - Fósforo (P): 15-20 ppm ou 40-50 ppm                        ║
║  - Potássio (K): 80-100 ppm ou 150-180 ppm                    ║
║  - pH: 5.5-6.0 ou 7.0-7.5                                     ║
╚═══════════════════════════════════════════════════════════════╝
`);

// ========================================
// ESTADO DO HARDWARE
// ========================================

let hardwareState = {
  ecoSoilDevice: null,
  waterySoilModule: null,
  isConnected: false,
  lastSensorData: {
    soil_moisture: 19,    // Bom (baixo): 18-20%
    temperature: 18,      // Bom (baixo): 15-20°C
    nitrogen: 50,         // Não classificado, valor médio
    phosphorus: 18,       // Bom (baixo): 15-20 ppm
    potassium: 90,        // Bom (baixo): 80-100 ppm
    ph: 5.7               // Bom (baixo): 5.5-6.0
  }
};

// ========================================
// FUNÇÕES DE SIMULAÇÃO DE SENSORES
// ========================================

/**
 * Gera valores BONS com pequena variação
 */
function generateGoodSensorData() {
  const { lastSensorData } = hardwareState;

  // Alterna entre faixas "bom baixo" e "bom alto"
  const useLowRange = Math.random() > 0.5;

  return {
    soil_moisture: useLowRange 
      ? clamp(lastSensorData.soil_moisture + (Math.random() - 0.5) * 1, 18, 20)
      : clamp(lastSensorData.soil_moisture + (Math.random() - 0.5) * 2, 30, 35),
    temperature: useLowRange
      ? clamp(lastSensorData.temperature + (Math.random() - 0.5) * 1, 15, 20)
      : clamp(lastSensorData.temperature + (Math.random() - 0.5) * 0.5, 30, 32),
    nitrogen: clamp(lastSensorData.nitrogen + (Math.random() - 0.5) * 2, 40, 60),
    phosphorus: useLowRange
      ? clamp(lastSensorData.phosphorus + (Math.random() - 0.5) * 1, 15, 20)
      : clamp(lastSensorData.phosphorus + (Math.random() - 0.5) * 2, 40, 50),
    potassium: useLowRange
      ? clamp(lastSensorData.potassium + (Math.random() - 0.5) * 3, 80, 100)
      : clamp(lastSensorData.potassium + (Math.random() - 0.5) * 5, 150, 180),
    ph: useLowRange
      ? clamp(lastSensorData.ph + (Math.random() - 0.5) * 0.1, 5.5, 6.0)
      : clamp(lastSensorData.ph + (Math.random() - 0.5) * 0.1, 7.0, 7.5)
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
    const response = await axios.post(`${CONFIG.apiUrl}/ecosoil-pro/identify`, {
      mac_address: CONFIG.macAddress
    });

    if (response.data.success) {
      hardwareState.ecoSoilDevice = response.data.data;
      console.log(`✅ Dispositivo identificado: ${hardwareState.ecoSoilDevice.device_name}`);
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
    const response = await axios.get(`${CONFIG.apiUrl}/waterysoil-modules/by-mac/${CONFIG.macAddress}`);

    if (response.data.success && response.data.data) {
      hardwareState.waterySoilModule = response.data.data;
      console.log(`✅ Módulo vinculado encontrado: ${hardwareState.waterySoilModule.name}`);
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
    const sensorData = generateGoodSensorData();
    hardwareState.lastSensorData = sensorData;

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

    const response = await axios.put(
      `${CONFIG.apiUrl}/waterysoil-modules/${hardwareState.waterySoilModule._id}/sensor-data`,
      payload
    );

    if (response.data.success) {
      console.log(`📡 🟡 Dados BONS enviados:`, {
        umidade: `${sensorData.soil_moisture.toFixed(1)}%`,
        temperatura: `${sensorData.temperature.toFixed(1)}°C`,
        npk: `N:${sensorData.nitrogen.toFixed(1)} P:${sensorData.phosphorus.toFixed(1)} K:${sensorData.potassium.toFixed(1)}`,
        ph: sensorData.ph.toFixed(2)
      });
    }
  } catch (error) {
    console.error(`❌ Erro ao enviar dados:`, error.response?.data?.message || error.message);
  }
}

/**
 * Conecta o hardware (identifica dispositivo e busca módulo)
 */
async function connectHardware() {
  console.log(`\n🔌 Conectando hardware Eco-Soil Pro...`);
  console.log(`   MAC Address: ${CONFIG.macAddress}`);
  console.log(`   API URL: ${CONFIG.apiUrl}\n`);

  const deviceIdentified = await identifyDevice();
  if (!deviceIdentified) {
    console.log(`\n❌ Falha ao identificar dispositivo!`);
    return false;
  }

  const moduleFound = await findLinkedModule();
  if (!moduleFound) {
    console.log(`\n❌ Nenhum módulo vinculado a este MAC Address!`);
    console.log(`   Cadastre um módulo WaterySoil com este MAC Address primeiro.\n`);
    return false;
  }

  console.log(`\n✅ Hardware conectado com sucesso!\n`);
  hardwareState.isConnected = true;
  return true;
}

/**
 * Inicia o loop de envio de dados
 */
function startSendingData() {
  console.log(`📡 Iniciando envio de dados BONS a cada ${CONFIG.sendInterval}ms...\n`);
  
  sendSensorData();
  setInterval(sendSensorData, CONFIG.sendInterval);
}

// ========================================
// INICIALIZAÇÃO
// ========================================

(async () => {
  const connected = await connectHardware();
  
  if (connected) {
    startSendingData();
  } else {
    console.log(`\n❌ Não foi possível conectar o hardware. Encerrando...\n`);
    process.exit(1);
  }
})();

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});

process.on('SIGINT', () => {
  console.log(`\n\n👋 Encerrando simulador BOM...\n`);
  process.exit(0);
});

