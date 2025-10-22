require('dotenv').config();
const axios = require('axios');

const CONFIG = {
    apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
    macAddress: process.env.MAC_ADDRESS || 'AA:BB:CC:DD:EE:FF',
    sendInterval: parseInt(process.env.SEND_INTERVAL) || 10000,
    simulationMode: process.env.SIMULATION_MODE || 'realistic'
  };

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
        console.log(`✅ Dispositivo encontrado: ${hardwareState.ecoSoilDevice}`);
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