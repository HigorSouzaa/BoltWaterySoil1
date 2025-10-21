const DataSensors = require("../models/DataSensors");
const WaterySoilModule = require("../models/WaterySoilModule");

/**
 * Controller para gerenciamento de histórico de dados dos sensores
 */

// GET /api/v1/data-sensors/module/:moduleId - Buscar histórico de um módulo
const getModuleHistory = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { limit = 100, page = 1, startDate, endDate } = req.query;

    // Verifica se o módulo pertence ao usuário
    const module = await WaterySoilModule.findOne({
      _id: moduleId,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo não encontrado"
      });
    }

    // Filtros
    const filters = {
      module_id: moduleId,
      is_active: true
    };

    // Filtro por período
    if (startDate || endDate) {
      filters.reading_timestamp = {};
      if (startDate) filters.reading_timestamp.$gte = new Date(startDate);
      if (endDate) filters.reading_timestamp.$lte = new Date(endDate);
    }

    // Paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [data, total] = await Promise.all([
      DataSensors.find(filters)
        .sort({ reading_timestamp: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      DataSensors.countDocuments(filters)
    ]);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar histórico",
      error: error.message
    });
  }
};

// GET /api/v1/data-sensors/module/:moduleId/latest - Buscar últimas N leituras
const getLatestReadings = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { limit = 10 } = req.query;

    // Verifica se o módulo pertence ao usuário
    const module = await WaterySoilModule.findOne({
      _id: moduleId,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo não encontrado"
      });
    }

    const data = await DataSensors.getLatestReadings(moduleId, parseInt(limit));

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Erro ao buscar últimas leituras:', error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar últimas leituras",
      error: error.message
    });
  }
};

// GET /api/v1/data-sensors/module/:moduleId/average - Calcular média em um período
const getAverageReadings = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { startDate, endDate } = req.query;

    // Verifica se o módulo pertence ao usuário
    const module = await WaterySoilModule.findOne({
      _id: moduleId,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo não encontrado"
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate e endDate são obrigatórios"
      });
    }

    const averages = await DataSensors.getAverageReadings(
      moduleId,
      new Date(startDate),
      new Date(endDate)
    );

    return res.status(200).json({
      success: true,
      data: averages[0] || null,
      period: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error) {
    console.error('Erro ao calcular médias:', error);
    return res.status(500).json({
      success: false,
      message: "Erro ao calcular médias",
      error: error.message
    });
  }
};

// GET /api/v1/data-sensors/mac/:macAddress - Buscar histórico por MAC Address
const getHistoryByMAC = async (req, res) => {
  try {
    const { macAddress } = req.params;
    const { limit = 100 } = req.query;

    // Busca o módulo com esse MAC que pertence ao usuário
    const module = await WaterySoilModule.findOne({
      mac_address: macAddress.toUpperCase(),
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo não encontrado com este MAC Address"
      });
    }

    const data = await DataSensors.getReadingsByMAC(macAddress, parseInt(limit));

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Erro ao buscar histórico por MAC:', error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar histórico por MAC",
      error: error.message
    });
  }
};

// GET /api/v1/data-sensors/stats/:moduleId - Estatísticas do módulo
const getModuleStats = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { days = 7 } = req.query;

    // Verifica se o módulo pertence ao usuário
    const module = await WaterySoilModule.findOne({
      _id: moduleId,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo não encontrado"
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await DataSensors.aggregate([
      {
        $match: {
          module_id: module._id,
          reading_timestamp: { $gte: startDate },
          is_active: true,
          'validation.is_valid': true
        }
      },
      {
        $group: {
          _id: null,
          // Umidade
          avg_moisture: { $avg: "$sensor_data.soil_moisture.value" },
          min_moisture: { $min: "$sensor_data.soil_moisture.value" },
          max_moisture: { $max: "$sensor_data.soil_moisture.value" },
          // Temperatura
          avg_temperature: { $avg: "$sensor_data.temperature.value" },
          min_temperature: { $min: "$sensor_data.temperature.value" },
          max_temperature: { $max: "$sensor_data.temperature.value" },
          // NPK
          avg_nitrogen: { $avg: "$sensor_data.npk.nitrogen" },
          avg_phosphorus: { $avg: "$sensor_data.npk.phosphorus" },
          avg_potassium: { $avg: "$sensor_data.npk.potassium" },
          // pH
          avg_ph: { $avg: "$sensor_data.ph.value" },
          min_ph: { $min: "$sensor_data.ph.value" },
          max_ph: { $max: "$sensor_data.ph.value" },
          // Contadores
          total_readings: { $sum: 1 },
          first_reading: { $min: "$reading_timestamp" },
          last_reading: { $max: "$reading_timestamp" }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: stats[0] || null,
      period: {
        days: parseInt(days),
        start: startDate,
        end: new Date()
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar estatísticas",
      error: error.message
    });
  }
};

// DELETE /api/v1/data-sensors/:id - Deletar registro (soft delete)
const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    const reading = await DataSensors.findById(id);

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: "Registro não encontrado"
      });
    }

    // Verifica se o módulo pertence ao usuário
    const module = await WaterySoilModule.findOne({
      _id: reading.module_id,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para deletar este registro"
      });
    }

    reading.is_active = false;
    await reading.save();

    return res.status(200).json({
      success: true,
      message: "Registro deletado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    return res.status(500).json({
      success: false,
      message: "Erro ao deletar registro",
      error: error.message
    });
  }
};

module.exports = {
  getModuleHistory,
  getLatestReadings,
  getAverageReadings,
  getHistoryByMAC,
  getModuleStats,
  deleteReading
};

