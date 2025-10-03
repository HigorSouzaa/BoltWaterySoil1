const ArduinoModule = require("../models/ArduinoModule");
const Sector = require("../models/Sector");

/**
 * Controller para gerenciamento de módulos Arduino
 */

// GET /api/v1/arduino-modules - Listar todos os módulos do usuário
const getArduinoModules = async (req, res) => {
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

    const modules = await ArduinoModule.find(filter)
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
    console.error('Erro ao buscar módulos Arduino:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// GET /api/v1/arduino-modules/:id - Buscar módulo específico
const getArduinoModuleById = async (req, res) => {
  try {
    const module = await ArduinoModule.findOne({
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
        message: "Módulo Arduino não encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: module
    });
  } catch (error) {
    console.error('Erro ao buscar módulo Arduino:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// POST /api/v1/arduino-modules - Criar novo módulo
const createArduinoModule = async (req, res) => {
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

    // Verifica se já existe um módulo com o mesmo nome no setor
    const existingModule = await ArduinoModule.findOne({
      name: name.trim(),
      sector_id: sector_id,
      user_id: req.user._id,
      is_active: true
    });

    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: "Já existe um módulo com este nome neste setor"
      });
    }

    // Se IP foi fornecido, verifica se já está em uso
    if (ip_address) {
      const existingIP = await ArduinoModule.findOne({
        ip_address: ip_address.trim(),
        user_id: req.user._id,
        is_active: true
      });

      if (existingIP) {
        return res.status(400).json({
          success: false,
          message: "Este endereço IP já está em uso"
        });
      }
    }

    // Cria o novo módulo
    const module = new ArduinoModule({
      name: name.trim(),
      module_type: module_type || 'sensor',
      sector_id,
      user_id: req.user._id,
      ip_address: ip_address?.trim() || null,
      mac_address: mac_address?.trim() || null,
      configuration: configuration || {},
      firmware_version: firmware_version?.trim() || null,
      status: 'offline'
    });

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

    return res.status(201).json({
      success: true,
      data: module,
      message: "Módulo Arduino criado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao criar módulo Arduino:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// PUT /api/v1/arduino-modules/:id - Atualizar módulo
const updateArduinoModule = async (req, res) => {
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
    const module = await ArduinoModule.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo Arduino não encontrado"
      });
    }

    // Verifica se já existe outro módulo com o mesmo nome no mesmo setor
    const existingModule = await ArduinoModule.findOne({
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
      const existingIP = await ArduinoModule.findOne({
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
      message: "Módulo Arduino atualizado com sucesso"
    });
  } catch (error) {
    console.error('Erro ao atualizar módulo Arduino:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

// PUT /api/v1/arduino-modules/:id/ping - Fazer ping no módulo
const pingArduinoModule = async (req, res) => {
  try {
    const module = await ArduinoModule.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo Arduino não encontrado"
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

// DELETE /api/v1/arduino-modules/:id - Deletar módulo (soft delete)
const deleteArduinoModule = async (req, res) => {
  try {
    const module = await ArduinoModule.findOne({
      _id: req.params.id,
      user_id: req.user._id,
      is_active: true
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Módulo Arduino não encontrado"
      });
    }

    // Soft delete - marca como inativo
    module.is_active = false;
    await module.save();

    return res.status(200).json({
      success: true,
      message: "Módulo Arduino removido com sucesso"
    });
  } catch (error) {
    console.error('Erro ao deletar módulo Arduino:', error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno do servidor" 
    });
  }
};

module.exports = {
  getArduinoModules,
  getArduinoModuleById,
  createArduinoModule,
  updateArduinoModule,
  pingArduinoModule,
  deleteArduinoModule
};
