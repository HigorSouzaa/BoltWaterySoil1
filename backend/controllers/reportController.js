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

    // Validações
    if (!sectorId || !year) {
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
    const sector = await Sector.findOne({ _id: sectorId, user_id: userId });
    if (!sector) {
      return res.status(404).json({
        message: 'Setor não encontrado'
      });
    }

    // Definir intervalo de datas para o ano
    const startDate = new Date(yearNum, 0, 1); // 1º de janeiro
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59); // 31 de dezembro

    // Buscar dados de sensores do ano
    const sensorData = await DataSensor.find({
      sector_id: sectorId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });

    // Buscar alertas do ano
    const alerts = await Alert.find({
      user_id: userId,
      sector_id: sectorId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    // Calcular estatísticas
    const statistics = calculateStatistics(sensorData);

    // Agrupar dados por mês
    const monthlyData = groupByMonth(sensorData);

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
    console.error('Erro ao gerar relatório anual:', error);
    return res.status(500).json({
      message: 'Erro ao gerar relatório anual'
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
      ph: { min: 0, max: 0, avg: 0, count: 0 }
    };
  }

  const stats = {
    humidity: { values: [], min: 0, max: 0, avg: 0, count: 0 },
    temperature: { values: [], min: 0, max: 0, avg: 0, count: 0 },
    ph: { values: [], min: 0, max: 0, avg: 0, count: 0 }
  };

  // Coletar valores
  sensorData.forEach(data => {
    if (data.soil_moisture !== undefined && data.soil_moisture !== null) {
      stats.humidity.values.push(data.soil_moisture);
    }
    if (data.temperature !== undefined && data.temperature !== null) {
      stats.temperature.values.push(data.temperature);
    }
    if (data.ph !== undefined && data.ph !== null) {
      stats.ph.values.push(data.ph);
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
    dataPoints: 0
  }));

  // Agrupar dados por mês
  sensorData.forEach(data => {
    const month = new Date(data.timestamp).getMonth();
    monthlyData[month].dataPoints++;

    if (data.soil_moisture !== undefined && data.soil_moisture !== null) {
      monthlyData[month].humidity.values.push(data.soil_moisture);
    }
    if (data.temperature !== undefined && data.temperature !== null) {
      monthlyData[month].temperature.values.push(data.temperature);
    }
    if (data.ph !== undefined && data.ph !== null) {
      monthlyData[month].ph.values.push(data.ph);
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
  });

  return monthlyData;
}

module.exports = {
  getAnnualReport
};

