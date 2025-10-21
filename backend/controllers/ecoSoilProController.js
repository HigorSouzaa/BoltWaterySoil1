const EcoSoilPro = require("../models/EcoSoilPro");

/**
 * Registrar novo dispositivo Eco-Soil Pro
 * Rota pública (sem autenticação) para a empresa registrar dispositivos
 */
exports.registerDevice = async (req, res) => {
  try {
    const { mac_address, serial_number, firmware_version, hardware_version, notes } = req.body;

    // Validação básica
    if (!mac_address || !serial_number) {
      return res.status(400).json({
        success: false,
        message: "MAC Address e Número de Série são obrigatórios"
      });
    }

    // Verifica se o MAC Address já está registrado
    const existingMAC = await EcoSoilPro.findOne({ 
      mac_address: mac_address.trim().toUpperCase() 
    });

    if (existingMAC) {
      return res.status(400).json({
        success: false,
        message: "Este MAC Address já está registrado",
        device: existingMAC
      });
    }

    // Verifica se o Serial Number já está registrado
    const existingSerial = await EcoSoilPro.findOne({ 
      serial_number: serial_number.trim().toUpperCase() 
    });

    if (existingSerial) {
      return res.status(400).json({
        success: false,
        message: "Este Número de Série já está registrado",
        device: existingSerial
      });
    }

    // Cria o novo dispositivo com valores padrão dos sensores
    const device = new EcoSoilPro({
      mac_address: mac_address.trim().toUpperCase(),
      serial_number: serial_number.trim().toUpperCase(),
      firmware_version: firmware_version?.trim() || '1.0.0',
      hardware_version: hardware_version?.trim() || 'v1',
      notes: notes?.trim() || '',
      status: 'registered',
      sensor_data: {
        soil_moisture: {
          value: 50,
          unit: '%',
          last_update: new Date()
        },
        temperature: {
          value: 25,
          unit: '°C',
          last_update: new Date()
        },
        npk: {
          nitrogen: 40,
          phosphorus: 30,
          potassium: 35,
          unit: 'mg/kg',
          last_update: new Date()
        },
        ph: {
          value: 6.5,
          unit: 'pH',
          last_update: new Date()
        }
      }
    });

    await device.save();

    res.status(201).json({
      success: true,
      message: "Dispositivo Eco-Soil Pro registrado com sucesso!",
      device
    });

  } catch (error) {
    console.error("Erro ao registrar dispositivo:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao registrar dispositivo",
      error: error.message
    });
  }
};

/**
 * Listar todos os dispositivos registrados
 * Rota pública (sem autenticação)
 */
exports.getAllDevices = async (req, res) => {
  try {
    const { status, is_active } = req.query;

    // Filtros opcionais
    const filters = {};
    if (status) filters.status = status;
    if (is_active !== undefined) filters.is_active = is_active === 'true';

    const devices = await EcoSoilPro.find(filters).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: devices.length,
      devices
    });

  } catch (error) {
    console.error("Erro ao buscar dispositivos:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar dispositivos",
      error: error.message
    });
  }
};

/**
 * Buscar dispositivo por MAC Address
 * Rota pública (sem autenticação)
 */
exports.getDeviceByMAC = async (req, res) => {
  try {
    const { mac_address } = req.params;

    const device = await EcoSoilPro.findOne({ 
      mac_address: mac_address.toUpperCase() 
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Dispositivo não encontrado"
      });
    }

    res.status(200).json({
      success: true,
      data: device
    });

  } catch (error) {
    console.error("Erro ao buscar dispositivo:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar dispositivo",
      error: error.message
    });
  }
};

/**
 * Buscar dispositivo por Serial Number
 * Rota pública (sem autenticação)
 */
exports.getDeviceBySerial = async (req, res) => {
  try {
    const { serial_number } = req.params;

    const device = await EcoSoilPro.findOne({ 
      serial_number: serial_number.toUpperCase() 
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Dispositivo não encontrado"
      });
    }

    res.status(200).json({
      success: true,
      device
    });

  } catch (error) {
    console.error("Erro ao buscar dispositivo:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar dispositivo",
      error: error.message
    });
  }
};

/**
 * Atualizar status do dispositivo
 * Rota pública (sem autenticação)
 */
exports.updateDeviceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['registered', 'in_use', 'maintenance', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status inválido. Use: ${validStatuses.join(', ')}`
      });
    }

    const device = await EcoSoilPro.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Dispositivo não encontrado"
      });
    }

    res.status(200).json({
      success: true,
      message: "Status atualizado com sucesso",
      device
    });

  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar status",
      error: error.message
    });
  }
};

/**
 * Deletar dispositivo (soft delete)
 * Rota pública (sem autenticação)
 */
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await EcoSoilPro.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Dispositivo não encontrado"
      });
    }

    res.status(200).json({
      success: true,
      message: "Dispositivo desativado com sucesso",
      device
    });

  } catch (error) {
    console.error("Erro ao deletar dispositivo:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao deletar dispositivo",
      error: error.message
    });
  }
};

