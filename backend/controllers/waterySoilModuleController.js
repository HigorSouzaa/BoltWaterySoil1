const WaterySoilModule = require("../models/WaterySoilModule");
const Sector = require("../models/Sector");
const EcoSoilPro = require("../models/EcoSoilPro");

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

module.exports = {
  getWaterySoilModules,
  getWaterySoilModuleById,
  createWaterySoilModule,
  updateWaterySoilModule,
  pingWaterySoilModule,
  deleteWaterySoilModule
};
