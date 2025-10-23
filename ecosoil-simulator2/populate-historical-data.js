require('dotenv').config();
const axios = require('axios');

// ========================================
// CONFIGURAÇÕES
// ========================================

const CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
  macAddress: process.env.MAC_ADDRESS || 'AA:BB:CC:DD:EE:F2',
  startDate: new Date('2025-09-21T00:00:00-03:00'), // Data inicial
  endDate: new Date(), // Data atual
  intervalMinutes: 10 // Intervalo entre leituras
};

// ========================================
// ESTADO DO HARDWARE
// ========================================

let hardwareState = {
  ecoSoilDevice: null,
  waterySoilModule: null,
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

  return {
    soil_moisture: clamp(lastSensorData.soil_moisture + (Math.random() - 0.5) * 4, 20, 90),
    temperature: clamp(lastSensorData.temperature + (Math.random() - 0.5) * 1, 18, 32),
    nitrogen: clamp(lastSensorData.nitrogen + (Math.random() - 0.5) * 2, 25, 80),
    phosphorus: clamp(lastSensorData.phosphorus + (Math.random() - 0.5) * 2, 20, 75),
    potassium: clamp(lastSensorData.potassium + (Math.random() - 0.5) * 2, 25, 70),
    ph: clamp(lastSensorData.ph + (Math.random() - 0.5) * 0.2, 5.5, 7.5)
  };
}

/**
 * Limita valor entre min e max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calcula total de leituras entre duas datas
 */
function calculateTotalReadings(startDate, endDate, intervalMinutes) {
  const diffMs = endDate - startDate;
  const diffMinutes = diffMs / (1000 * 60);
  return Math.floor(diffMinutes / intervalMinutes);
}

// ========================================
// FUNÇÕES DE COMUNICAÇÃO COM A API
// ========================================

/**
 * Identifica o dispositivo Eco-Soil Pro pelo MAC Address
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
      return true;
    }
  } catch (error) {
    console.error(`❌ Erro ao identificar dispositivo:`, error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Busca o módulo WaterySoil vinculado
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
      return true;
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar módulo:`, error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * Envia dados dos sensores com timestamp específico
 */
async function sendHistoricalSensorData(timestamp) {
  try {
    const sensorData = generateRealisticSensorData();
    hardwareState.lastSensorData = sensorData;

    const payload = {
      sensor_data: {
        soil_moisture: {
          value: parseFloat(sensorData.soil_moisture.toFixed(1)),
          last_update: timestamp
        },
        temperature: {
          value: parseFloat(sensorData.temperature.toFixed(1)),
          last_update: timestamp
        },
        npk: {
          nitrogen: parseFloat(sensorData.nitrogen.toFixed(1)),
          phosphorus: parseFloat(sensorData.phosphorus.toFixed(1)),
          potassium: parseFloat(sensorData.potassium.toFixed(1)),
          last_update: timestamp
        },
        ph: {
          value: parseFloat(sensorData.ph.toFixed(2)),
          last_update: timestamp
        }
      }
    };

    const response = await axios.put(
      `${CONFIG.apiUrl}/waterysoil-modules/${hardwareState.waterySoilModule._id}/sensor-data`,
      payload
    );

    if (response.data.success) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erro ao enviar dados:`, error.response?.data?.message || error.message);
    return false;
  }
}

// ========================================
// FUNÇÃO PRINCIPAL DE POPULAÇÃO
// ========================================

/**
 * Popula o banco de dados com leituras históricas
 */
async function populateHistoricalData() {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  🌱 POPULADOR DE DADOS HISTÓRICOS - ECO-SOIL PRO`);
  console.log(`${'='.repeat(70)}\n`);

  // Conectar ao hardware
  const deviceFound = await identifyDevice();
  if (!deviceFound) {
    console.log(`\n❌ Dispositivo não encontrado!`);
    return;
  }

  const moduleFound = await findLinkedModule();
  if (!moduleFound) {
    console.log(`\n❌ Módulo não encontrado!`);
    return;
  }

  // Calcular total de leituras
  const totalReadings = calculateTotalReadings(
    CONFIG.startDate, 
    CONFIG.endDate, 
    CONFIG.intervalMinutes
  );

  console.log(`\n📊 INFORMAÇÕES DA POPULAÇÃO:`);
  console.log(`   Data inicial: ${CONFIG.startDate.toLocaleString('pt-BR')}`);
  console.log(`   Data final: ${CONFIG.endDate.toLocaleString('pt-BR')}`);
  console.log(`   Intervalo: ${CONFIG.intervalMinutes} minutos`);
  console.log(`   Total de leituras: ${totalReadings}`);
  console.log(`   Estimativa: ${(totalReadings / 144).toFixed(1)} dias de dados`);
  console.log(`\n🚀 Iniciando população...\n`);

  let successCount = 0;
  let errorCount = 0;
  let currentDate = new Date(CONFIG.startDate);

  // Loop através de todas as datas
  for (let i = 0; i < totalReadings; i++) {
    const success = await sendHistoricalSensorData(currentDate);
    
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }

    // Log de progresso a cada 144 leituras (1 dia)
    if ((i + 1) % 144 === 0) {
      const percentComplete = ((i + 1) / totalReadings * 100).toFixed(1);
      console.log(`📡 Progresso: ${i + 1}/${totalReadings} (${percentComplete}%) - ${currentDate.toLocaleDateString('pt-BR')}`);
    }

    // Avançar para próximo timestamp
    currentDate = new Date(currentDate.getTime() + CONFIG.intervalMinutes * 60 * 1000);

    // Pequeno delay para não sobrecarregar a API (opcional, pode remover se quiser mais rápido)
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Resumo final
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ✅ POPULAÇÃO CONCLUÍDA!`);
  console.log(`${'='.repeat(70)}`);
  console.log(`\n📊 ESTATÍSTICAS:`);
  console.log(`   ✅ Leituras enviadas com sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   📈 Taxa de sucesso: ${(successCount / totalReadings * 100).toFixed(1)}%`);
  
  const days = (CONFIG.endDate - CONFIG.startDate) / (1000 * 60 * 60 * 24);
  console.log(`\n📅 RESUMO POR PERÍODO:`);
  console.log(`   Leituras por dia (média): ${(totalReadings / days).toFixed(0)}`);
  console.log(`   Leituras por semana (média): ${(totalReadings / days * 7).toFixed(0)}`);
  console.log(`   Total de dias: ${days.toFixed(1)}`);
  console.log(`\n`);
}

// ========================================
// INICIALIZAÇÃO
// ========================================

populateHistoricalData()
  .then(() => {
    console.log(`✅ Script finalizado com sucesso!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`❌ Erro fatal:`, error);
    process.exit(1);
  });

// Tratamento de erros
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
  process.exit(1);
});
