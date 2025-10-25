const Alert = require('../models/Alert');
const User = require('../models/User');
const { enviarEmailAlerta } = require('./serviceAuthEmail');

/**
 * Serviço de Monitoramento Automático de Alertas
 * Verifica se os dados dos sensores ultrapassam os limites configurados
 * e cria alertas automáticos quando necessário
 */

// Armazenar cooldowns de alertas (em produção, usar Redis)
// Estrutura: { userId_sectorId_alertType: timestamp }
const alertCooldowns = new Map();

// Tempo de cooldown em milissegundos (30 minutos)
const COOLDOWN_TIME = 30 * 60 * 1000;

/**
 * Verifica se um alerta está em cooldown
 * @param {string} userId - ID do usuário
 * @param {string} sectorId - ID do setor
 * @param {string} alertType - Tipo de alerta (humidity, temperature, ph)
 * @returns {boolean} true se está em cooldown, false caso contrário
 */
function isInCooldown(userId, sectorId, alertType) {
  const key = `${userId}_${sectorId}_${alertType}`;
  const lastAlertTime = alertCooldowns.get(key);
  
  if (!lastAlertTime) return false;
  
  const timeSinceLastAlert = Date.now() - lastAlertTime;
  
  if (timeSinceLastAlert >= COOLDOWN_TIME) {
    // Cooldown expirado, remover da lista
    alertCooldowns.delete(key);
    return false;
  }
  
  return true;
}

/**
 * Registra um novo alerta no cooldown
 * @param {string} userId - ID do usuário
 * @param {string} sectorId - ID do setor
 * @param {string} alertType - Tipo de alerta
 */
function setCooldown(userId, sectorId, alertType) {
  const key = `${userId}_${sectorId}_${alertType}`;
  alertCooldowns.set(key, Date.now());
}

/**
 * Cria um alerta automático no banco de dados
 * @param {string} userId - ID do usuário
 * @param {string} sectorId - ID do setor
 * @param {string} alertType - Tipo de alerta (humidity, temperature, ph)
 * @param {string} message - Mensagem do alerta
 * @param {string} type - Tipo de severidade (warning, error)
 * @param {object} metadata - Dados adicionais
 * @returns {Promise<Alert>} Alerta criado
 */
async function createAutomaticAlert(userId, sectorId, alertType, message, type, metadata) {
  try {
    const alert = new Alert({
      user_id: userId,
      sector_id: sectorId,
      type: type,
      message: message,
      status: 'active',
      isAutomatic: true,
      source: alertType,
      metadata: metadata
    });

    await alert.save();
    console.log(`✅ Alerta automático criado: ${alertType} - ${message}`);
    return alert;
  } catch (error) {
    console.error('❌ Erro ao criar alerta automático:', error);
    throw error;
  }
}

/**
 * Verifica os limites de umidade
 * @param {object} user - Usuário com alertSettings
 * @param {string} sectorId - ID do setor
 * @param {string} sectorName - Nome do setor
 * @param {number} value - Valor atual da umidade
 * @param {string} timestamp - Data/hora da leitura
 */
async function checkHumidityLimits(user, sectorId, sectorName, value, timestamp) {
  const settings = user.alertSettings.humidity;
  
  if (!settings.enabled) return;
  
  const userId = user._id.toString();
  
  // Verificar limite mínimo
  if (value < settings.min) {
    if (isInCooldown(userId, sectorId, 'humidity_min')) {
      console.log(`⏳ Alerta de umidade mínima em cooldown para setor ${sectorName}`);
      return;
    }
    
    const message = `Umidade do solo abaixo do limite mínimo: ${value.toFixed(1)}% (limite: ${settings.min}%)`;
    const metadata = {
      currentValue: value,
      limitValue: settings.min,
      limitType: 'min',
      timestamp: timestamp
    };
    
    await createAutomaticAlert(userId, sectorId, 'humidity', message, 'warning', metadata);
    setCooldown(userId, sectorId, 'humidity_min');
    
    // Enviar email se habilitado
    if (user.alertSettings.emailNotifications) {
      try {
        await enviarEmailAlerta(
          user.email,
          user.name,
          'humidity',
          value,
          settings.min,
          'min',
          sectorName,
          timestamp
        );
      } catch (error) {
        console.error('❌ Erro ao enviar email de alerta:', error);
      }
    }
  }
  
  // Verificar limite máximo
  if (value > settings.max) {
    if (isInCooldown(userId, sectorId, 'humidity_max')) {
      console.log(`⏳ Alerta de umidade máxima em cooldown para setor ${sectorName}`);
      return;
    }
    
    const message = `Umidade do solo acima do limite máximo: ${value.toFixed(1)}% (limite: ${settings.max}%)`;
    const metadata = {
      currentValue: value,
      limitValue: settings.max,
      limitType: 'max',
      timestamp: timestamp
    };
    
    await createAutomaticAlert(userId, sectorId, 'humidity', message, 'warning', metadata);
    setCooldown(userId, sectorId, 'humidity_max');
    
    // Enviar email se habilitado
    if (user.alertSettings.emailNotifications) {
      try {
        await enviarEmailAlerta(
          user.email,
          user.name,
          'humidity',
          value,
          settings.max,
          'max',
          sectorName,
          timestamp
        );
      } catch (error) {
        console.error('❌ Erro ao enviar email de alerta:', error);
      }
    }
  }
}

/**
 * Verifica os limites de temperatura
 * @param {object} user - Usuário com alertSettings
 * @param {string} sectorId - ID do setor
 * @param {string} sectorName - Nome do setor
 * @param {number} value - Valor atual da temperatura
 * @param {string} timestamp - Data/hora da leitura
 */
async function checkTemperatureLimits(user, sectorId, sectorName, value, timestamp) {
  const settings = user.alertSettings.temperature;
  
  if (!settings.enabled) return;
  
  const userId = user._id.toString();
  
  // Verificar limite mínimo
  if (value < settings.min) {
    if (isInCooldown(userId, sectorId, 'temperature_min')) {
      console.log(`⏳ Alerta de temperatura mínima em cooldown para setor ${sectorName}`);
      return;
    }
    
    const message = `Temperatura abaixo do limite mínimo: ${value.toFixed(1)}°C (limite: ${settings.min}°C)`;
    const metadata = {
      currentValue: value,
      limitValue: settings.min,
      limitType: 'min',
      timestamp: timestamp
    };
    
    await createAutomaticAlert(userId, sectorId, 'temperature', message, 'warning', metadata);
    setCooldown(userId, sectorId, 'temperature_min');
    
    // Enviar email se habilitado
    if (user.alertSettings.emailNotifications) {
      try {
        await enviarEmailAlerta(
          user.email,
          user.name,
          'temperature',
          value,
          settings.min,
          'min',
          sectorName,
          timestamp
        );
      } catch (error) {
        console.error('❌ Erro ao enviar email de alerta:', error);
      }
    }
  }
  
  // Verificar limite máximo
  if (value > settings.max) {
    if (isInCooldown(userId, sectorId, 'temperature_max')) {
      console.log(`⏳ Alerta de temperatura máxima em cooldown para setor ${sectorName}`);
      return;
    }
    
    const message = `Temperatura acima do limite máximo: ${value.toFixed(1)}°C (limite: ${settings.max}°C)`;
    const metadata = {
      currentValue: value,
      limitValue: settings.max,
      limitType: 'max',
      timestamp: timestamp
    };
    
    await createAutomaticAlert(userId, sectorId, 'temperature', message, 'error', metadata);
    setCooldown(userId, sectorId, 'temperature_max');
    
    // Enviar email se habilitado
    if (user.alertSettings.emailNotifications) {
      try {
        await enviarEmailAlerta(
          user.email,
          user.name,
          'temperature',
          value,
          settings.max,
          'max',
          sectorName,
          timestamp
        );
      } catch (error) {
        console.error('❌ Erro ao enviar email de alerta:', error);
      }
    }
  }
}

/**
 * Verifica os limites de pH
 * @param {object} user - Usuário com alertSettings
 * @param {string} sectorId - ID do setor
 * @param {string} sectorName - Nome do setor
 * @param {number} value - Valor atual do pH
 * @param {string} timestamp - Data/hora da leitura
 */
async function checkPHLimits(user, sectorId, sectorName, value, timestamp) {
  const settings = user.alertSettings.ph;
  
  if (!settings.enabled) return;
  
  const userId = user._id.toString();
  
  // Verificar limite mínimo
  if (value < settings.min) {
    if (isInCooldown(userId, sectorId, 'ph_min')) {
      console.log(`⏳ Alerta de pH mínimo em cooldown para setor ${sectorName}`);
      return;
    }
    
    const message = `pH do solo abaixo do limite mínimo: ${value.toFixed(2)} (limite: ${settings.min})`;
    const metadata = {
      currentValue: value,
      limitValue: settings.min,
      limitType: 'min',
      timestamp: timestamp
    };
    
    await createAutomaticAlert(userId, sectorId, 'ph', message, 'warning', metadata);
    setCooldown(userId, sectorId, 'ph_min');
    
    // Enviar email se habilitado
    if (user.alertSettings.emailNotifications) {
      try {
        await enviarEmailAlerta(
          user.email,
          user.name,
          'ph',
          value,
          settings.min,
          'min',
          sectorName,
          timestamp
        );
      } catch (error) {
        console.error('❌ Erro ao enviar email de alerta:', error);
      }
    }
  }
  
  // Verificar limite máximo
  if (value > settings.max) {
    if (isInCooldown(userId, sectorId, 'ph_max')) {
      console.log(`⏳ Alerta de pH máximo em cooldown para setor ${sectorName}`);
      return;
    }
    
    const message = `pH do solo acima do limite máximo: ${value.toFixed(2)} (limite: ${settings.max})`;
    const metadata = {
      currentValue: value,
      limitValue: settings.max,
      limitType: 'max',
      timestamp: timestamp
    };
    
    await createAutomaticAlert(userId, sectorId, 'ph', message, 'warning', metadata);
    setCooldown(userId, sectorId, 'ph_max');
    
    // Enviar email se habilitado
    if (user.alertSettings.emailNotifications) {
      try {
        await enviarEmailAlerta(
          user.email,
          user.name,
          'ph',
          value,
          settings.max,
          'max',
          sectorName,
          timestamp
        );
      } catch (error) {
        console.error('❌ Erro ao enviar email de alerta:', error);
      }
    }
  }
}

/**
 * Função principal de monitoramento
 * Verifica todos os parâmetros de um sensor
 * @param {string} userId - ID do usuário
 * @param {string} sectorId - ID do setor
 * @param {string} sectorName - Nome do setor
 * @param {object} sensorData - Dados do sensor { soil_moisture, temperature, ph }
 * @param {string} timestamp - Data/hora da leitura
 */
async function monitorSensorData(userId, sectorId, sectorName, sensorData, timestamp) {
  try {
    // Buscar usuário com configurações de alertas
    const user = await User.findById(userId);
    
    if (!user || !user.alertSettings) {
      console.log(`⚠️ Usuário ${userId} não encontrado ou sem configurações de alertas`);
      return;
    }
    
    // Verificar umidade
    if (sensorData.soil_moisture !== undefined && sensorData.soil_moisture !== null) {
      await checkHumidityLimits(user, sectorId, sectorName, sensorData.soil_moisture, timestamp);
    }
    
    // Verificar temperatura
    if (sensorData.temperature !== undefined && sensorData.temperature !== null) {
      await checkTemperatureLimits(user, sectorId, sectorName, sensorData.temperature, timestamp);
    }
    
    // Verificar pH
    if (sensorData.ph !== undefined && sensorData.ph !== null) {
      await checkPHLimits(user, sectorId, sectorName, sensorData.ph, timestamp);
    }
    
  } catch (error) {
    console.error('❌ Erro no monitoramento de sensores:', error);
  }
}

module.exports = {
  monitorSensorData
};

