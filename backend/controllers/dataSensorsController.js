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
      if (modules.length > 0) {
        console.log('📊 Detalhes dos módulos:', modules.map(m => ({
          id: m._id,
          name: m.name,
          mac: m.mac_address,
          user_id: m.user_id
        })));
      }

      // ✅ CORREÇÃO: Se não houver módulos no setor, retornar vazio
      // Não buscar módulos de outros setores!
      if (modules.length === 0) {
        console.log('⚠️ Nenhum módulo encontrado no setor selecionado');
        return res.status(200).json({
          success: true,
          data: {
            labels: [],
            ph: [],
            moisture: [],
            temperature: [],
            npk: []
          },
          message: "Nenhum módulo encontrado neste setor"
        });
      }

      moduleIds = modules.map(m => m._id);
    } else {
      // Se não passar sectorId, buscar todos os módulos do usuário
      console.log('📊 Buscando todos os módulos do usuário');
      const allModules = await WaterySoilModule.find({
        user_id: userId,
        is_active: true
      });
      console.log('📊 Total de módulos do usuário:', allModules.length);
      if (allModules.length > 0) {
        console.log('📊 Detalhes dos módulos:', allModules.map(m => ({
          id: m._id,
          name: m.name,
          mac: m.mac_address,
          user_id: m.user_id
        })));
      }
      moduleIds = allModules.map(m => m._id);
    }

    console.log('📊 Total de módulos para buscar dados:', moduleIds.length);
    console.log('📊 IDs dos módulos:', moduleIds);

    // ⚠️ IMPORTANTE: Se o usuário não tem módulos, retornar vazio
    if (moduleIds.length === 0) {
      console.log('⚠️ Usuário não possui módulos cadastrados');
      return res.status(200).json({
        success: true,
        data: {
          labels: [],
          ph: [],
          moisture: [],
          temperature: [],
          npk: []
        },
        message: "Nenhum módulo encontrado para este usuário"
      });
    }

    // Query SEMPRE filtra por módulos do usuário
    let query = {
      module_id: { $in: moduleIds }
    };

    // ✅ CORREÇÃO: Se sectorId foi especificado, filtrar também por sector_id
    // Isso garante que apenas dados do setor correto sejam retornados
    if (sectorId) {
      query.sector_id = sectorId;
      console.log('📊 Filtrando também por sector_id:', sectorId);
    }

    // Definir período
    const now = new Date();
    let start, dataPoints, groupBy, labels = [];

    if (timeRange === 'daily') {
      // Últimas 24 horas - de 00:00 até 23:59 (12 pontos de 2 em 2 horas)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Início do dia (00:00)
      start = today;

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999); // Fim do dia (23:59)
      now.setTime(endOfDay.getTime());

      dataPoints = 12; // 00:00, 02:00, 04:00, ..., 22:00
      groupBy = 2 * 60 * 60 * 1000; // 2 horas em ms

      // Gerar labels fixos: 00:00, 02:00, 04:00, ..., 22:00
      for (let i = 0; i < dataPoints; i++) {
        const hour = i * 2;
        labels.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    } else if (timeRange === 'weekly') {
      // Semana ISO: Segunda a Domingo
      // Encontrar a segunda-feira da semana atual
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Dom, 1 = Seg, ..., 6 = Sáb
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Se domingo, volta 6 dias

      const monday = new Date(today);
      monday.setDate(today.getDate() + daysToMonday);
      monday.setHours(0, 0, 0, 0);
      start = monday;

      dataPoints = 7; // Segunda a Domingo
      groupBy = 24 * 60 * 60 * 1000; // 1 dia em ms

      // Gerar labels: Seg, Ter, Qua, Qui, Sex, Sáb, Dom
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      labels = [...days];
    } else if (timeRange === 'monthly') {
      // Mês civil: do dia 01 até o último dia do mês
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      firstDay.setHours(0, 0, 0, 0);
      start = firstDay;

      // Último dia do mês (dia 0 do próximo mês)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      dataPoints = lastDay.getDate(); // 28, 29, 30 ou 31
      groupBy = 24 * 60 * 60 * 1000; // 1 dia em ms

      // Gerar labels: 01, 02, 03, ..., 28/29/30/31
      for (let i = 1; i <= dataPoints; i++) {
        labels.push(i.toString().padStart(2, '0'));
      }
    } else if (timeRange === 'yearly') {
      // Anual: últimos 12 meses
      const today = new Date();
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // 1º de janeiro
      firstDayOfYear.setHours(0, 0, 0, 0);
      start = firstDayOfYear;

      dataPoints = 12; // 12 meses
      groupBy = 30 * 24 * 60 * 60 * 1000; // ~30 dias em ms (aproximado)

      // Gerar labels: Jan, Fev, Mar, ..., Dez
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      labels = [...months];
    } else {
      // Fallback: últimos 30 dias
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dataPoints = 30; // 1 por dia
      groupBy = 24 * 60 * 60 * 1000; // 1 dia em ms

      // Gerar labels: DD/MM
      for (let i = 0; i < dataPoints; i++) {
        const date = new Date(start.getTime() + i * groupBy);
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      }
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

      // ✅ CORREÇÃO: Construir query de fallback com os mesmos filtros
      const fallbackQuery = {
        module_id: { $in: moduleIds },
        is_active: true,
        'validation.is_valid': true
      };

      // Se sectorId foi especificado, manter o filtro no fallback
      if (sectorId) {
        fallbackQuery.sector_id = sectorId;
        console.log('📊 Fallback também filtrando por sector_id:', sectorId);
      }

      const lastData = await DataSensors.find(fallbackQuery)
        .sort({ reading_timestamp: -1 })
        .limit(100);

      console.log('📊 Últimos dados encontrados:', lastData.length);

      if (lastData.length > 0) {
        // Usar os últimos dados encontrados
        sensorData.push(...lastData.reverse());
      }
    }

    // Agrupar dados por período
    const phData = [];
    const moistureData = [];
    const temperatureData = [];
    const npkData = [];

    // Criar intervalos de tempo
    for (let i = 0; i < dataPoints; i++) {
      let intervalStart, intervalEnd;

      if (timeRange === 'yearly') {
        // Para anual, usar meses completos
        const year = start.getFullYear();
        intervalStart = new Date(year, i, 1); // Primeiro dia do mês
        intervalEnd = new Date(year, i + 1, 1); // Primeiro dia do próximo mês
      } else {
        // Para outros períodos, usar groupBy
        intervalStart = new Date(start.getTime() + i * groupBy);
        intervalEnd = new Date(intervalStart.getTime() + groupBy);
      }

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
    const userId = req.user._id;
    const { limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    console.log('📊 [getAllSensorData] Buscando todos os dados');
    console.log('📊 userId:', userId);
    console.log('📊 Limit:', limit, 'Page:', page);

    // 1. Buscar módulos do usuário
    const modules = await WaterySoilModule.find({
      user_id: userId,
      is_active: true
    });

    const moduleIds = modules.map(m => m._id);

    console.log('📊 Total de módulos do usuário:', moduleIds.length);

    // Se não houver módulos, retornar vazio
    if (moduleIds.length === 0) {
      console.log('⚠️ Usuário não possui módulos cadastrados');
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        },
        message: "Nenhum módulo encontrado para este usuário"
      });
    }

    // 2. Buscar dados APENAS dos módulos do usuário
    const sensorData = await DataSensors.find({
      module_id: { $in: moduleIds },
      is_active: true,
      'validation.is_valid': true
    })
    .sort({ reading_timestamp: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean(); // .lean() retorna objetos JavaScript simples (mais rápido)

    // Contar total de documentos do usuário
    const total = await DataSensors.countDocuments({
      module_id: { $in: moduleIds },
      is_active: true,
      'validation.is_valid': true
    });

    console.log('📊 Total de documentos do usuário:', total);
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

