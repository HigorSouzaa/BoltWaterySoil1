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

// GET /api/v1/data-sensors/aggregated - Buscar dados agregados para gráficos
const getAggregatedForCharts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sectorId, timeRange = 'daily' } = req.query;

    console.log('📊 [getAggregatedForCharts] Iniciando busca de dados agregados');
    console.log('📊 userId:', userId);
    console.log('📊 sectorId:', sectorId);
    console.log('📊 timeRange:', timeRange);

    let moduleIds = [];

    if (sectorId) {
      // Buscar módulos do setor específico
      const modules = await WaterySoilModule.find({
        user_id: userId,
        sector_id: sectorId,
        is_active: true
      });

      console.log('📊 Módulos encontrados no setor:', modules.length);

      if (modules.length === 0) {
        console.log('⚠️ Nenhum módulo encontrado no setor, buscando todos os módulos do usuário');
        // Se não encontrar módulos no setor, buscar todos os módulos do usuário
        const allModules = await WaterySoilModule.find({
          user_id: userId,
          is_active: true
        });
        moduleIds = allModules.map(m => m._id);
      } else {
        moduleIds = modules.map(m => m._id);
      }
    } else {
      // Se não passar sectorId, buscar todos os módulos do usuário
      console.log('📊 Buscando todos os módulos do usuário');
      const allModules = await WaterySoilModule.find({
        user_id: userId,
        is_active: true
      });
      moduleIds = allModules.map(m => m._id);
    }

    console.log('📊 Total de módulos para buscar dados:', moduleIds.length);
    console.log('📊 IDs dos módulos:', moduleIds);

    // Se não houver módulos, buscar TODOS os dados da coleção data_sensors
    let query = {};

    if (moduleIds.length > 0) {
      query.module_id = { $in: moduleIds };
    }

    // Definir período
    const now = new Date();
    let start, dataPoints, groupBy;

    if (timeRange === 'daily') {
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      dataPoints = 12; // A cada 2 horas
      groupBy = 2 * 60 * 60 * 1000; // 2 horas em ms
    } else if (timeRange === 'weekly') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dataPoints = 7; // 1 por dia
      groupBy = 24 * 60 * 60 * 1000; // 1 dia em ms
    } else {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dataPoints = 30; // 1 por dia
      groupBy = 24 * 60 * 60 * 1000; // 1 dia em ms
    }

    console.log('📊 Período de busca:', { start, now });

    // Buscar dados do período
    query.reading_timestamp = { $gte: start, $lte: now };
    query.is_active = true;
    query['validation.is_valid'] = true;

    console.log('📊 Query MongoDB:', JSON.stringify(query, null, 2));

    const sensorData = await DataSensors.find(query).sort({ reading_timestamp: 1 });

    console.log('📊 Total de leituras encontradas:', sensorData.length);

    // Se não encontrar dados no período, buscar os últimos dados disponíveis
    if (sensorData.length === 0) {
      console.log('⚠️ Nenhum dado encontrado no período, buscando últimos dados disponíveis');
      const lastData = await DataSensors.find({
        is_active: true,
        'validation.is_valid': true
      })
      .sort({ reading_timestamp: -1 })
      .limit(100);

      console.log('📊 Últimos dados encontrados:', lastData.length);

      if (lastData.length > 0) {
        // Usar os últimos dados encontrados
        sensorData.push(...lastData.reverse());
      }
    }

    // Agrupar dados por período
    const labels = [];
    const phData = [];
    const moistureData = [];
    const temperatureData = [];
    const npkData = [];

    // Criar intervalos de tempo
    for (let i = 0; i < dataPoints; i++) {
      const intervalStart = new Date(start.getTime() + i * groupBy);
      const intervalEnd = new Date(intervalStart.getTime() + groupBy);

      // Filtrar dados neste intervalo
      const intervalData = sensorData.filter(d => {
        const timestamp = new Date(d.reading_timestamp);
        return timestamp >= intervalStart && timestamp < intervalEnd;
      });

      // Calcular médias
      let phSum = 0, phCount = 0;
      let moistureSum = 0, moistureCount = 0;
      let tempSum = 0, tempCount = 0;
      let npkSum = 0, npkCount = 0;

      intervalData.forEach(data => {
        if (data.sensor_data?.ph?.value) {
          phSum += data.sensor_data.ph.value;
          phCount++;
        }
        if (data.sensor_data?.soil_moisture?.value) {
          moistureSum += data.sensor_data.soil_moisture.value;
          moistureCount++;
        }
        if (data.sensor_data?.temperature?.value) {
          tempSum += data.sensor_data.temperature.value;
          tempCount++;
        }
        if (data.sensor_data?.npk) {
          const npkAvg = (
            (data.sensor_data.npk.nitrogen || 0) +
            (data.sensor_data.npk.phosphorus || 0) +
            (data.sensor_data.npk.potassium || 0)
          ) / 3;
          npkSum += npkAvg;
          npkCount++;
        }
      });

      // Adicionar label
      if (timeRange === 'daily') {
        labels.push(intervalStart.getHours().toString().padStart(2, '0') + ':00');
      } else if (timeRange === 'weekly') {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        labels.push(days[intervalStart.getDay()]);
      } else {
        labels.push(`${intervalStart.getDate()}/${intervalStart.getMonth() + 1}`);
      }

      // Adicionar médias (ou null se não houver dados)
      phData.push(phCount > 0 ? phSum / phCount : null);
      moistureData.push(moistureCount > 0 ? moistureSum / moistureCount : null);
      temperatureData.push(tempCount > 0 ? tempSum / tempCount : null);
      npkData.push(npkCount > 0 ? npkSum / npkCount : null);
    }

    console.log('📊 Dados agregados gerados:');
    console.log('  - Labels:', labels.length);
    console.log('  - pH:', phData.filter(v => v !== null).length, 'valores');
    console.log('  - Umidade:', moistureData.filter(v => v !== null).length, 'valores');
    console.log('  - Temperatura:', temperatureData.filter(v => v !== null).length, 'valores');
    console.log('  - NPK:', npkData.filter(v => v !== null).length, 'valores');

    return res.status(200).json({
      success: true,
      data: {
        labels,
        ph: phData,
        moisture: moistureData,
        temperature: temperatureData,
        npk: npkData,
      },
      meta: {
        totalReadings: sensorData.length,
        timeRange,
        dataPoints,
        period: {
          start,
          end: now
        }
      }
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados agregados:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar dados agregados",
      error: error.message
    });
  }
};

// GET /api/v1/data-sensors/all - Buscar TODOS os dados em formato de array
const getAllSensorData = async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    console.log('📊 [getAllSensorData] Buscando todos os dados');
    console.log('📊 Limit:', limit, 'Page:', page);

    // Buscar todos os dados da coleção data_sensors
    const sensorData = await DataSensors.find({
      is_active: true,
      'validation.is_valid': true
    })
    .sort({ reading_timestamp: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean(); // .lean() retorna objetos JavaScript simples (mais rápido)

    // Contar total de documentos
    const total = await DataSensors.countDocuments({
      is_active: true,
      'validation.is_valid': true
    });

    console.log('📊 Total de documentos:', total);
    console.log('📊 Documentos retornados:', sensorData.length);

    // Formatar dados em array simples para facilitar leitura
    const formattedData = sensorData.map(reading => ({
      id: reading._id,
      moduleId: reading.module_id,
      macAddress: reading.mac_address,
      serialNumber: reading.serial_number,
      timestamp: reading.reading_timestamp,
      ph: reading.sensor_data?.ph?.value || null,
      moisture: reading.sensor_data?.soil_moisture?.value || null,
      temperature: reading.sensor_data?.temperature?.value || null,
      nitrogen: reading.sensor_data?.npk?.nitrogen || null,
      phosphorus: reading.sensor_data?.npk?.phosphorus || null,
      potassium: reading.sensor_data?.npk?.potassium || null,
      batteryLevel: reading.metadata?.battery_level || null,
      signalStrength: reading.metadata?.signal_strength || null,
      isValid: reading.validation?.is_valid || false,
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("❌ Erro ao buscar todos os dados:", error);
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar dados dos sensores",
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
  deleteReading,
  getAggregatedForCharts,
  getAllSensorData
};

