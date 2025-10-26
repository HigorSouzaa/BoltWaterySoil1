const DataSensor = require('../models/DataSensors');
const Sector = require('../models/Sector');
const Alert = require('../models/Alert');

/**
 * Gerar relatório anual
 * GET /api/v1/reports/annual/:sectorId/:year
 */
const getAnnualReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sectorId, year } = req.params;

    console.log('📊 Gerando relatório anual:', { userId, sectorId, year });

    // Validações
    if (!sectorId || !year) {
      console.error('❌ Parâmetros faltando:', { sectorId, year });
      return res.status(400).json({
        message: 'ID do setor e ano são obrigatórios'
      });
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > new Date().getFullYear()) {
      return res.status(400).json({
        message: 'Ano inválido'
      });
    }

    // Verificar se o setor existe e pertence ao usuário
    console.log('🔍 Buscando setor:', { _id: sectorId, user_id: userId });
    const sector = await Sector.findOne({ _id: sectorId, user_id: userId });
    console.log('📍 Setor encontrado:', sector);

    if (!sector) {
      console.error('❌ Setor não encontrado');
      return res.status(404).json({
        message: 'Setor não encontrado'
      });
    }

    // Definir intervalo de datas para o ano
    const startDate = new Date(yearNum, 0, 1); // 1º de janeiro
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59); // 31 de dezembro

    // Buscar dados de sensores do ano
    console.log('🔍 Buscando dados de sensores:', { sector_id: sectorId, startDate, endDate });
    const sensorData = await DataSensor.find({
      sector_id: sectorId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });
    console.log('📊 Dados de sensores encontrados:', sensorData.length);

    // Buscar alertas do ano
    console.log('🔍 Buscando alertas:', { user_id: userId, sector_id: sectorId });
    const alerts = await Alert.find({
      user_id: userId,
      sector_id: sectorId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
    console.log('🚨 Alertas encontrados:', alerts.length);

    // Calcular estatísticas
    console.log('📈 Calculando estatísticas...');
    const statistics = calculateStatistics(sensorData);
    console.log('📈 Estatísticas calculadas:', statistics);

    // Agrupar dados por mês
    console.log('📅 Agrupando dados por mês...');
    const monthlyData = groupByMonth(sensorData);
    console.log('📅 Dados mensais:', monthlyData.length);

    // Estatísticas de alertas
    const alertStats = {
      total: alerts.length,
      byType: {
        info: alerts.filter(a => a.type === 'info').length,
        warning: alerts.filter(a => a.type === 'warning').length,
        error: alerts.filter(a => a.type === 'error').length,
        success: alerts.filter(a => a.type === 'success').length
      },
      bySource: {
        manual: alerts.filter(a => a.source === 'manual').length,
        humidity: alerts.filter(a => a.source === 'humidity').length,
        temperature: alerts.filter(a => a.source === 'temperature').length,
        ph: alerts.filter(a => a.source === 'ph').length,
        system: alerts.filter(a => a.source === 'system').length
      },
      resolved: alerts.filter(a => a.status === 'resolved').length,
      active: alerts.filter(a => a.status === 'active').length
    };

    return res.status(200).json({
      sector: {
        id: sector._id,
        name: sector.name
      },
      year: yearNum,
      period: {
        start: startDate,
        end: endDate
      },
      statistics,
      monthlyData,
      alerts: {
        stats: alertStats,
        recent: alerts.slice(0, 20) // Últimos 20 alertas
      },
      dataPoints: sensorData.length
    });
  } catch (error) {
    console.error('❌ Erro ao gerar relatório anual:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({
      message: 'Erro ao gerar relatório anual',
      error: error.message
    });
  }
};

/**
 * Calcular estatísticas dos dados de sensores
 */
function calculateStatistics(sensorData) {
  if (sensorData.length === 0) {
    return {
      humidity: { min: 0, max: 0, avg: 0, count: 0 },
      temperature: { min: 0, max: 0, avg: 0, count: 0 },
      ph: { min: 0, max: 0, avg: 0, count: 0 },
      npk: {
        nitrogen: { min: 0, max: 0, avg: 0, count: 0 },
        phosphorus: { min: 0, max: 0, avg: 0, count: 0 },
        potassium: { min: 0, max: 0, avg: 0, count: 0 }
      }
    };
  }

  const stats = {
    humidity: { values: [], min: 0, max: 0, avg: 0, count: 0 },
    temperature: { values: [], min: 0, max: 0, avg: 0, count: 0 },
    ph: { values: [], min: 0, max: 0, avg: 0, count: 0 },
    npk: {
      nitrogen: { values: [], min: 0, max: 0, avg: 0, count: 0 },
      phosphorus: { values: [], min: 0, max: 0, avg: 0, count: 0 },
      potassium: { values: [], min: 0, max: 0, avg: 0, count: 0 }
    }
  };

  // Coletar valores (estrutura aninhada do DataSensors)
  sensorData.forEach(data => {
    // Acessar valores aninhados em sensor_data
    const soilMoisture = data.sensor_data?.soil_moisture?.value;
    const temperature = data.sensor_data?.temperature?.value;
    const ph = data.sensor_data?.ph?.value;
    const nitrogen = data.sensor_data?.npk?.nitrogen;
    const phosphorus = data.sensor_data?.npk?.phosphorus;
    const potassium = data.sensor_data?.npk?.potassium;

    if (soilMoisture !== undefined && soilMoisture !== null) {
      stats.humidity.values.push(soilMoisture);
    }
    if (temperature !== undefined && temperature !== null) {
      stats.temperature.values.push(temperature);
    }
    if (ph !== undefined && ph !== null) {
      stats.ph.values.push(ph);
    }
    if (nitrogen !== undefined && nitrogen !== null) {
      stats.npk.nitrogen.values.push(nitrogen);
    }
    if (phosphorus !== undefined && phosphorus !== null) {
      stats.npk.phosphorus.values.push(phosphorus);
    }
    if (potassium !== undefined && potassium !== null) {
      stats.npk.potassium.values.push(potassium);
    }
  });

  // Calcular estatísticas para cada parâmetro
  ['humidity', 'temperature', 'ph'].forEach(param => {
    const values = stats[param].values;
    if (values.length > 0) {
      stats[param].min = Math.min(...values);
      stats[param].max = Math.max(...values);
      stats[param].avg = values.reduce((a, b) => a + b, 0) / values.length;
      stats[param].count = values.length;
    }
    delete stats[param].values; // Remover array de valores
  });

  // Calcular estatísticas para NPK
  ['nitrogen', 'phosphorus', 'potassium'].forEach(nutrient => {
    const values = stats.npk[nutrient].values;
    if (values.length > 0) {
      stats.npk[nutrient].min = Math.min(...values);
      stats.npk[nutrient].max = Math.max(...values);
      stats.npk[nutrient].avg = values.reduce((a, b) => a + b, 0) / values.length;
      stats.npk[nutrient].count = values.length;
    }
    delete stats.npk[nutrient].values; // Remover array de valores
  });

  return stats;
}

/**
 * Agrupar dados por mês
 */
function groupByMonth(sensorData) {
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' }),
    humidity: { values: [], avg: 0, min: 0, max: 0 },
    temperature: { values: [], avg: 0, min: 0, max: 0 },
    ph: { values: [], avg: 0, min: 0, max: 0 },
    npk: {
      nitrogen: { values: [], avg: 0, min: 0, max: 0 },
      phosphorus: { values: [], avg: 0, min: 0, max: 0 },
      potassium: { values: [], avg: 0, min: 0, max: 0 }
    },
    dataPoints: 0
  }));

  // Agrupar dados por mês
  sensorData.forEach(data => {
    // Usar reading_timestamp ao invés de timestamp
    const timestamp = data.reading_timestamp || data.timestamp;
    if (!timestamp) {
      console.warn('⚠️ Dado sem timestamp:', data);
      return;
    }

    const month = new Date(timestamp).getMonth();

    // Validar se o mês é válido (0-11)
    if (month < 0 || month > 11) {
      console.warn('⚠️ Mês inválido:', month, 'para timestamp:', timestamp);
      return;
    }

    monthlyData[month].dataPoints++;

    // Acessar valores aninhados em sensor_data
    const soilMoisture = data.sensor_data?.soil_moisture?.value;
    const temperature = data.sensor_data?.temperature?.value;
    const ph = data.sensor_data?.ph?.value;
    const nitrogen = data.sensor_data?.npk?.nitrogen;
    const phosphorus = data.sensor_data?.npk?.phosphorus;
    const potassium = data.sensor_data?.npk?.potassium;

    if (soilMoisture !== undefined && soilMoisture !== null) {
      monthlyData[month].humidity.values.push(soilMoisture);
    }
    if (temperature !== undefined && temperature !== null) {
      monthlyData[month].temperature.values.push(temperature);
    }
    if (ph !== undefined && ph !== null) {
      monthlyData[month].ph.values.push(ph);
    }
    if (nitrogen !== undefined && nitrogen !== null) {
      monthlyData[month].npk.nitrogen.values.push(nitrogen);
    }
    if (phosphorus !== undefined && phosphorus !== null) {
      monthlyData[month].npk.phosphorus.values.push(phosphorus);
    }
    if (potassium !== undefined && potassium !== null) {
      monthlyData[month].npk.potassium.values.push(potassium);
    }
  });

  // Calcular estatísticas mensais
  monthlyData.forEach(monthData => {
    ['humidity', 'temperature', 'ph'].forEach(param => {
      const values = monthData[param].values;
      if (values.length > 0) {
        monthData[param].avg = values.reduce((a, b) => a + b, 0) / values.length;
        monthData[param].min = Math.min(...values);
        monthData[param].max = Math.max(...values);
      }
      delete monthData[param].values; // Remover array de valores
    });

    // Calcular estatísticas mensais para NPK
    ['nitrogen', 'phosphorus', 'potassium'].forEach(nutrient => {
      const values = monthData.npk[nutrient].values;
      if (values.length > 0) {
        monthData.npk[nutrient].avg = values.reduce((a, b) => a + b, 0) / values.length;
        monthData.npk[nutrient].min = Math.min(...values);
        monthData.npk[nutrient].max = Math.max(...values);
      }
      delete monthData.npk[nutrient].values; // Remover array de valores
    });
  });

  return monthlyData;
}

module.exports = {
  getAnnualReport
};

