const WaterySoilModule = require("../models/WaterySoilModule");
const Sector = require("../models/Sector");
const EcoSoilPro = require("../models/EcoSoilPro");
const DataSensors = require("../models/DataSensors");

/**
 * Controller para gerenciamento de módulos WaterySoil
 */

// GET /api/v1/waterysoil-modules - Listar todos os módulos do usuário
const getWaterySoilModules = async (req, res) => {
  try {
    const { sector_id, status } = req.query;

    let filter = {
      user_id: req.user._id,
      is_active: true
    };

    // Se sector_id foi fornecido, filtra por ele
    if (sector_id) {
      filter.sector_id = sector_id;
    }

    // Se status foi fornecido, filtra por ele
    if (status) {
      filter.status = status;
    }

    const modules = await WaterySoilModule.find(filter)
      .populate('sector_id', 'name environment_id')
      .populate({
        path: 'sector_id',
        populate: {
          path: 'environment_id',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: modules,
      count: modules.length
    });
  } catch (error) {
    console.error('Erro ao buscar módulos WaterySoil:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

// GET /api/v1/waterysoil-modules/:id - Buscar módulo específico
const getWaterySoilModuleById = async (req, res) => {
  try {
    const module = await WaterySoilModule.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    }).populate('sector_id', 'name environment_id')
      .populate({
        path: 'sector_id',
        populate: {
          path: 'environment_id',
          select: 'name'
        }
      });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo WaterySoil não encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: module
    });
  } catch (error) {
    console.error('Erro ao buscar módulo WaterySoil:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

// POST /api/v1/waterysoil-modules - Criar novo módulo
const createWaterySoilModule = async (req, res) => {
  try {
    const { 
      name, 
      module_type, 
      sector_id, 
      ip_address, 
      mac_address, 
      configuration, 
      firmware_version 
    } = req.body;

    // Validação básica
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nome do módulo é obrigatório"
      });
    }

    if (!sector_id) {
      return res.status(400).json({
        success: false,
        message: "ID do setor é obrigatório"
      });
    }

    // Verifica se o setor existe e pertence ao usuário
    const sector = await Sector.findOne({
      _id: sector_id,
      user_id: req.user._id,
      is_active: true
    });

    if (!sector) {
      return res.status(400).json({
        success: false,
        message: "Setor não encontrado ou não pertence ao usuário"
      });
    }

    // VALIDAÇÃO OBRIGATÓRIA: MAC Address é obrigatório para Eco-Soil Pro
    if (!mac_address || mac_address.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "MAC Address é obrigatório para registrar um módulo Eco-Soil Pro"
      });
    }

    // VALIDAÇÃO 1: Verifica se existe um dispositivo Eco-Soil Pro registrado com este MAC
    const ecoSoilDevice = await EcoSoilPro.findOne({
      mac_address: mac_address.trim().toUpperCase(),
      is_active: true
    });

    if (!ecoSoilDevice) {
      return res.status(404).json({
        success: false,
        message: "Nenhum dispositivo Eco-Soil Pro encontrado com este MAC Address. Por favor, registre o hardware primeiro."
      });
    }

    // VALIDAÇÃO 2: Verifica se este MAC Address já está sendo usado por outro módulo
    const existingModule = await WaterySoilModule.findOne({
      mac_address: mac_address.trim().toUpperCase(),
      is_active: true
    });

    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: "Este MAC Address já está vinculado a outro módulo. Cada dispositivo Eco-Soil Pro pode ser usado apenas uma vez."
      });
    }

    // VALIDAÇÃO 3: Verifica se o dispositivo Eco-Soil Pro já está em uso
    if (ecoSoilDevice.status === 'in_use') {
      return res.status(400).json({
        success: false,
        message: "Este dispositivo Eco-Soil Pro já está em uso. Escolha outro dispositivo."
      });
    }

    // Cria o novo módulo vinculado ao Eco-Soil Pro
    const module = new WaterySoilModule({
      name: name.trim(),
      module_type: module_type || 'sensor',
      sector_id,
      user_id: req.user._id,
      ip_address: ip_address?.trim() || null,
      mac_address: mac_address.trim().toUpperCase(),
      configuration: configuration || {},
      firmware_version: ecoSoilDevice.firmware_version, // Usa a versão do dispositivo
      status: 'offline',
      sensor_data: {
        soil_moisture: ecoSoilDevice.sensor_data.soil_moisture,
        temperature: ecoSoilDevice.sensor_data.temperature,
        npk: ecoSoilDevice.sensor_data.npk,
        ph: ecoSoilDevice.sensor_data.ph
      }
    });

    await module.save();

    // Atualiza o status do dispositivo Eco-Soil Pro para "in_use"
    ecoSoilDevice.status = 'in_use';
    await ecoSoilDevice.save();

    // Popula as referências antes de retornar
    await module.populate('sector_id', 'name environment_id');
    await module.populate({
      path: 'sector_id',
      populate: {
        path: 'environment_id',
        select: 'name'
      }
    });

    return res.status(201).json({
      success: true,
      data: module,
      message: `Módulo WaterySoil criado com sucesso e vinculado ao dispositivo Eco-Soil Pro (${ecoSoilDevice.serial_number})`
    });
  } catch (error) {
    console.error('Erro ao criar módulo WaterySoil:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

// PUT /api/v1/waterysoil-modules/:id - Atualizar módulo
const updateWaterySoilModule = async (req, res) => {
  try {
    const { 
      name, 
      module_type, 
      ip_address, 
      mac_address, 
      configuration, 
      firmware_version,
      status
    } = req.body;

    // Validação básica
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nome do módulo é obrigatório"
      });
    }

    // Verifica se o módulo existe e pertence ao usuário
    const module = await WaterySoilModule.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo WaterySoil não encontrado"
      });
    }

    // Verifica se já existe outro módulo com o mesmo nome no mesmo setor
    const existingModule = await WaterySoilModule.findOne({
      name: name.trim(),
      sector_id: module.sector_id,
      user_id: req.user._id,
      is_active: true,
      _id: { $ne: req.params.id }
    });

    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: "Já existe um módulo com este nome neste setor"
      });
    }

    // Se IP foi fornecido e é diferente do atual, verifica se já está em uso
    if (ip_address && ip_address.trim() !== module.ip_address) {
      const existingIP = await WaterySoilModule.findOne({
        ip_address: ip_address.trim(),
        user_id: req.user._id,
        is_active: true,
        _id: { $ne: req.params.id }
      });

      if (existingIP) {
        return res.status(400).json({
          success: false,
          message: "Este endereço IP já está em uso"
        });
      }
    }

    // Atualiza o módulo
    module.name = name.trim();
    module.module_type = module_type || module.module_type;
    module.ip_address = ip_address?.trim() || null;
    module.mac_address = mac_address?.trim() || null;
    module.configuration = configuration || module.configuration;
    module.firmware_version = firmware_version?.trim() || null;
    
    if (status && ['operational', 'offline', 'error', 'maintenance'].includes(status)) {
      module.status = status;
    }
    
    await module.save();

    // Popula as referências antes de retornar
    await module.populate('sector_id', 'name environment_id');
    await module.populate({
      path: 'sector_id',
      populate: {
        path: 'environment_id',
        select: 'name'
      }
    });

    return res.status(200).json({
      success: true,
      data: module,
      message: "Módulo WaterySoil atualizado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao atualizar módulo WaterySoil:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

// PUT /api/v1/waterysoil-modules/:id/ping - Fazer ping no módulo
const pingWaterySoilModule = async (req, res) => {
  try {
    const module = await WaterySoilModule.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo WaterySoil não encontrado"
      });
    }

    // Atualiza o último ping e status
    module.last_ping = new Date();
    module.status = 'operational';

    await module.save();

    return res.status(200).json({
      success: true,
      data: module,
      message: "Ping realizado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao fazer ping no módulo:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

// DELETE /api/v1/waterysoil-modules/:id - Deletar módulo (soft delete)
const deleteWaterySoilModule = async (req, res) => {
  try {
    const module = await WaterySoilModule.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo WaterySoil não encontrado"
      });
    }

    // Soft delete - marca como inativo
    module.is_active = false;
    await module.save();

    // Libera o dispositivo Eco-Soil Pro se houver MAC Address vinculado
    if (module.mac_address) {
      const ecoSoilDevice = await EcoSoilPro.findOne({
        mac_address: module.mac_address,
        is_active: true
      });

      if (ecoSoilDevice && ecoSoilDevice.status === 'in_use') {
        ecoSoilDevice.status = 'registered';
        await ecoSoilDevice.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Módulo WaterySoil removido com sucesso. O dispositivo Eco-Soil Pro foi liberado para novo uso."
    });
  } catch (error) {
    console.error('Erro ao deletar módulo WaterySoil:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

// GET /api/v1/waterysoil-modules/by-mac/:mac_address - Buscar módulo por MAC (SEM autenticação - para hardware)
const getWaterySoilModuleByMAC = async (req, res) => {
  try {
    const { mac_address } = req.params;

    const module = await WaterySoilModule.findOne({
      mac_address: mac_address.toUpperCase(),
      is_active: true
    })
      .populate('sector_id', 'name environment_id')
      .populate({
        path: 'sector_id',
        populate: {
          path: 'environment_id',
          select: 'name'
        }
      });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Nenhum módulo encontrado com este MAC Address"
      });
    }

    return res.status(200).json({
      success: true,
      data: module
    });
  } catch (error) {
    console.error('Erro ao buscar módulo por MAC:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
};

// PUT /api/v1/waterysoil-modules/:id/sensor-data - Atualizar dados dos sensores
const updateSensorData = async (req, res) => {
  try {
    const { sensor_data, metadata, reading_timestamp } = req.body;

    const module = await WaterySoilModule.findOne({
      _id: req.params.id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo não encontrado"
      });
    }

    // Busca o dispositivo Eco-Soil Pro para pegar o serial_number
    const ecoSoilDevice = await EcoSoilPro.findOne({
      mac_address: module.mac_address,
      is_active: true
    });

    // ========================================
    // DETERMINAR O TIMESTAMP DA LEITURA
    // ========================================
    
    // Prioridade:
    // 1. reading_timestamp enviado no body
    // 2. last_update do primeiro sensor disponível
    // 3. Data atual como fallback
    
    let timestampToUse = new Date();
    
    if (reading_timestamp) {
      timestampToUse = new Date(reading_timestamp);
    } else if (sensor_data?.soil_moisture?.last_update) {
      timestampToUse = new Date(sensor_data.soil_moisture.last_update);
    } else if (sensor_data?.temperature?.last_update) {
      timestampToUse = new Date(sensor_data.temperature.last_update);
    } else if (sensor_data?.npk?.last_update) {
      timestampToUse = new Date(sensor_data.npk.last_update);
    } else if (sensor_data?.ph?.last_update) {
      timestampToUse = new Date(sensor_data.ph.last_update);
    }

    // ========================================
    // 1. SALVAR NO HISTÓRICO (DataSensors)
    // ========================================

    const historicalData = new DataSensors({
      module_id: module._id,
      mac_address: module.mac_address,
      serial_number: ecoSoilDevice?.serial_number || null,
      reading_timestamp: timestampToUse, // ✅ Usa o timestamp correto!
      sensor_data: sensor_data,
      metadata: {
        firmware_version: ecoSoilDevice?.firmware_version || module.firmware_version,
        ip_address: module.ip_address,
        signal_strength: metadata?.signal_strength,
        battery_level: metadata?.battery_level,
        location: metadata?.location,
        notes: metadata?.notes
      },
      status: 'valid'
    });

    // Salva no histórico
    await historicalData.save();

    // ========================================
    // 2. ATUALIZAR DADOS ATUAIS DO MÓDULO
    // ========================================

    module.sensor_data = sensor_data;
    module.status = 'operational';
    module.last_ping = new Date(); // Este pode continuar usando a data atual

    await module.save();

    // ========================================
    // 3. RETORNAR RESPOSTA
    // ========================================

    return res.status(200).json({
      success: true,
      data: {
        module: module,
        historical_record: {
          id: historicalData._id,
          timestamp: historicalData.reading_timestamp,
          is_valid: historicalData.validation.is_valid,
          validation_messages: historicalData.validation.messages
        }
      },
      message: "Dados dos sensores atualizados e salvos no histórico com sucesso"
    });
  } catch (error) {
    console.error('Erro ao atualizar dados dos sensores:', error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};


module.exports = {
  getWaterySoilModules,
  getWaterySoilModuleById,
  createWaterySoilModule,
  updateWaterySoilModule,
  pingWaterySoilModule,
  deleteWaterySoilModule,
  getWaterySoilModuleByMAC,    // NOVO - Para hardware encontrar o módulo
  updateSensorData              // NOVO - Para hardware enviar dados
};
