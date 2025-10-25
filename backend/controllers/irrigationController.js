const Irrigation = require('../models/Irrigation');
const Sector = require('../models/Sector');

/**
 * Iniciar irrigação
 * POST /api/v1/irrigation/start
 */
const startIrrigation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sector_id, plannedDuration = 30, notes = '' } = req.body;

    // Validações
    if (!sector_id) {
      return res.status(400).json({
        message: 'ID do setor é obrigatório'
      });
    }

    // Verificar se o setor existe e pertence ao usuário
    const sector = await Sector.findOne({ _id: sector_id, user_id: userId });
    if (!sector) {
      return res.status(404).json({
        message: 'Setor não encontrado'
      });
    }

    // Verificar se já existe irrigação ativa para este setor
    const activeIrrigation = await Irrigation.findOne({
      sector_id,
      status: 'active'
    });

    if (activeIrrigation) {
      return res.status(400).json({
        message: 'Já existe uma irrigação ativa para este setor',
        irrigation: activeIrrigation
      });
    }

    // Criar nova sessão de irrigação
    const irrigation = new Irrigation({
      user_id: userId,
      sector_id,
      plannedDuration,
      notes,
      status: 'active',
      startTime: new Date()
    });

    await irrigation.save();
    await irrigation.populate('sector_id', 'name');

    return res.status(201).json({
      message: 'Irrigação iniciada com sucesso',
      irrigation
    });
  } catch (error) {
    console.error('Erro ao iniciar irrigação:', error);
    return res.status(500).json({
      message: 'Erro ao iniciar irrigação'
    });
  }
};

/**
 * Parar irrigação
 * POST /api/v1/irrigation/stop
 */
const stopIrrigation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { irrigation_id, sector_id } = req.body;

    let irrigation;

    // Buscar por ID ou por setor ativo
    if (irrigation_id) {
      irrigation = await Irrigation.findOne({
        _id: irrigation_id,
        user_id: userId,
        status: 'active'
      });
    } else if (sector_id) {
      irrigation = await Irrigation.findOne({
        sector_id,
        user_id: userId,
        status: 'active'
      });
    } else {
      return res.status(400).json({
        message: 'ID da irrigação ou ID do setor é obrigatório'
      });
    }

    if (!irrigation) {
      return res.status(404).json({
        message: 'Irrigação ativa não encontrada'
      });
    }

    // Calcular duração real
    const endTime = new Date();
    const actualDuration = Math.round((endTime - irrigation.startTime) / 60000); // em minutos

    // Atualizar irrigação
    irrigation.status = 'completed';
    irrigation.endTime = endTime;
    irrigation.actualDuration = actualDuration;

    await irrigation.save();
    await irrigation.populate('sector_id', 'name');

    return res.status(200).json({
      message: 'Irrigação finalizada com sucesso',
      irrigation
    });
  } catch (error) {
    console.error('Erro ao parar irrigação:', error);
    return res.status(500).json({
      message: 'Erro ao parar irrigação'
    });
  }
};

/**
 * Cancelar irrigação
 * POST /api/v1/irrigation/cancel
 */
const cancelIrrigation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { irrigation_id, sector_id } = req.body;

    let irrigation;

    if (irrigation_id) {
      irrigation = await Irrigation.findOne({
        _id: irrigation_id,
        user_id: userId,
        status: 'active'
      });
    } else if (sector_id) {
      irrigation = await Irrigation.findOne({
        sector_id,
        user_id: userId,
        status: 'active'
      });
    } else {
      return res.status(400).json({
        message: 'ID da irrigação ou ID do setor é obrigatório'
      });
    }

    if (!irrigation) {
      return res.status(404).json({
        message: 'Irrigação ativa não encontrada'
      });
    }

    // Calcular duração real
    const endTime = new Date();
    const actualDuration = Math.round((endTime - irrigation.startTime) / 60000);

    // Atualizar irrigação
    irrigation.status = 'cancelled';
    irrigation.endTime = endTime;
    irrigation.actualDuration = actualDuration;

    await irrigation.save();
    await irrigation.populate('sector_id', 'name');

    return res.status(200).json({
      message: 'Irrigação cancelada com sucesso',
      irrigation
    });
  } catch (error) {
    console.error('Erro ao cancelar irrigação:', error);
    return res.status(500).json({
      message: 'Erro ao cancelar irrigação'
    });
  }
};

/**
 * Obter irrigação ativa
 * GET /api/v1/irrigation/active
 */
const getActiveIrrigation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sector_id } = req.query;

    const filter = { user_id: userId, status: 'active' };
    if (sector_id) filter.sector_id = sector_id;

    const irrigations = await Irrigation.find(filter)
      .populate('sector_id', 'name')
      .sort({ startTime: -1 });

    return res.status(200).json({ irrigations });
  } catch (error) {
    console.error('Erro ao buscar irrigações ativas:', error);
    return res.status(500).json({
      message: 'Erro ao buscar irrigações ativas'
    });
  }
};

/**
 * Obter histórico de irrigações
 * GET /api/v1/irrigation/history
 */
const getIrrigationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sector_id, limit = 20 } = req.query;

    const filter = { user_id: userId, status: { $in: ['completed', 'cancelled'] } };
    if (sector_id) filter.sector_id = sector_id;

    const irrigations = await Irrigation.find(filter)
      .populate('sector_id', 'name')
      .sort({ startTime: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({ irrigations });
  } catch (error) {
    console.error('Erro ao buscar histórico de irrigações:', error);
    return res.status(500).json({
      message: 'Erro ao buscar histórico de irrigações'
    });
  }
};

module.exports = {
  startIrrigation,
  stopIrrigation,
  cancelIrrigation,
  getActiveIrrigation,
  getIrrigationHistory
};

