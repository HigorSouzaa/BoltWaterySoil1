require('dotenv').config();
const axios = require('axios');

// ========================================
// CONFIGURAÇÕES
// ========================================

const CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
  macAddress: process.env.MAC_ADDRESS || 'AA:BB:CC:DD:EE:F2',
  sendInterval: parseInt(process.env.SEND_INTERVAL) || 2000, // ⚡ 2 segundos
  simulationMode: 'bad' // Sempre valores RUINS
};

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          🔴 SIMULADOR ECO-SOIL PRO - VALORES RUINS 🔴        ║
╠═══════════════════════════════════════════════════════════════╣
║  Este simulador gera valores RUINS para todos os parâmetros  ║
║  - Umidade (VWC): <18% ou >35% (Franco/Loam)                 ║
║  - Temperatura: <15°C ou >32°C                                ║
║  - Fósforo (P): <15 ppm ou >50 ppm                            ║
║  - Potássio (K): <80 ppm ou >180 ppm                          ║
║  - pH: <5.5 ou >7.5                                           ║
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
    soil_moisture: 10,    // Ruim (muito baixo): <18%
    temperature: 35,      // Ruim (muito alto): >32°C
    nitrogen: 50,         // Não classificado, valor médio
    phosphorus: 10,       // Ruim (muito baixo): <15 ppm
    potassium: 60,        // Ruim (muito baixo): <80 ppm
    ph: 4.5               // Ruim (muito ácido): <5.5
  }
};

// ========================================
// FUNÇÕES DE SIMULAÇÃO DE SENSORES
// ========================================

/**
 * Gera valores RUINS com pequena variação
 */
function generateBadSensorData() {
  const { lastSensorData } = hardwareState;

  // Alterna entre valores muito baixos e muito altos
  const useLowRange = Math.random() > 0.5;

  return {
    soil_moisture: useLowRange 
      ? clamp(lastSensorData.soil_moisture + (Math.random() - 0.5) * 2, 5, 17)
      : clamp(lastSensorData.soil_moisture + (Math.random() - 0.5) * 3, 36, 50),
    temperature: useLowRange
      ? clamp(lastSensorData.temperature + (Math.random() - 0.5) * 1, 10, 14)
      : clamp(lastSensorData.temperature + (Math.random() - 0.5) * 1, 33, 38),
    nitrogen: clamp(lastSensorData.nitrogen + (Math.random() - 0.5) * 2, 40, 60),
    phosphorus: useLowRange
      ? clamp(lastSensorData.phosphorus + (Math.random() - 0.5) * 1, 5, 14)
      : clamp(lastSensorData.phosphorus + (Math.random() - 0.5) * 2, 51, 70),
    potassium: useLowRange
      ? clamp(lastSensorData.potassium + (Math.random() - 0.5) * 3, 40, 79)
      : clamp(lastSensorData.potassium + (Math.random() - 0.5) * 5, 181, 220),
    ph: useLowRange
      ? clamp(lastSensorData.ph + (Math.random() - 0.5) * 0.2, 4.0, 5.4)
      : clamp(lastSensorData.ph + (Math.random() - 0.5) * 0.2, 7.6, 8.5)
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
    const sensorData = generateBadSensorData();
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
      console.log(`📡 🔴 Dados RUINS enviados:`, {
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
  console.log(`\n🚀 Iniciando Hardware Eco-Soil Pro...`);
  console.log(`   MAC Address: ${CONFIG.macAddress}`);
  console.log(`   Modo: bad`);
  console.log(`   Intervalo: ${CONFIG.sendInterval}ms\n`);

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
  return true;
}

/**
 * Inicia o loop de envio de dados
 */
function startSendingData() {
  console.log(`📡 Iniciando envio de dados RUINS a cada ${CONFIG.sendInterval}ms...\n`);
  
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
  console.log(`\n\n👋 Encerrando simulador RUIM...\n`);
  process.exit(0);
});

