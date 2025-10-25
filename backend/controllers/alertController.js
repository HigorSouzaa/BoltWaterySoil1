const Alert = require('../models/Alert');

/**
 * Obter todos os alertas do usuário
 * GET /api/v1/alerts
 */
const getAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, type, limit = 50 } = req.query;

    // Construir filtro
    const filter = { user_id: userId };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const alerts = await Alert.find(filter)
      .populate('sector_id', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({ alerts });
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    return res.status(500).json({ message: 'Erro ao buscar alertas' });
  }
};

/**
 * Obter um alerta específico
 * GET /api/v1/alerts/:id
 */
const getAlertById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const alert = await Alert.findOne({ _id: id, user_id: userId })
      .populate('sector_id', 'name');

    if (!alert) {
      return res.status(404).json({ message: 'Alerta não encontrado' });
    }

    return res.status(200).json({ alert });
  } catch (error) {
    console.error('Erro ao buscar alerta:', error);
    return res.status(500).json({ message: 'Erro ao buscar alerta' });
  }
};

/**
 * Criar novo alerta
 * POST /api/v1/alerts
 */
const createAlert = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, message, sector_id, source = 'manual' } = req.body;

    // Validações
    if (!type || !message) {
      return res.status(400).json({
        message: 'Tipo e mensagem são obrigatórios'
      });
    }

    if (!['info', 'warning', 'error', 'success'].includes(type)) {
      return res.status(400).json({
        message: 'Tipo inválido. Use: info, warning, error ou success'
      });
    }

    const alert = new Alert({
      user_id: userId,
      type,
      message,
      sector_id: sector_id || null,
      source,
      isAutomatic: source !== 'manual'
    });

    await alert.save();

    // Popular setor se existir
    await alert.populate('sector_id', 'name');

    return res.status(201).json({
      message: 'Alerta criado com sucesso',
      alert
    });
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    return res.status(500).json({ message: 'Erro ao criar alerta' });
  }
};

/**
 * Atualizar alerta
 * PUT /api/v1/alerts/:id
 */
const updateAlert = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { type, message, status } = req.body;

    const alert = await Alert.findOne({ _id: id, user_id: userId });

    if (!alert) {
      return res.status(404).json({ message: 'Alerta não encontrado' });
    }

    // Atualizar campos se fornecidos
    if (type) {
      if (!['info', 'warning', 'error', 'success'].includes(type)) {
        return res.status(400).json({
          message: 'Tipo inválido. Use: info, warning, error ou success'
        });
      }
      alert.type = type;
    }

    if (message) alert.message = message;

    if (status) {
      if (!['active', 'resolved'].includes(status)) {
        return res.status(400).json({
          message: 'Status inválido. Use: active ou resolved'
        });
      }
      alert.status = status;
    }

    await alert.save();
    await alert.populate('sector_id', 'name');

    return res.status(200).json({
      message: 'Alerta atualizado com sucesso',
      alert
    });
  } catch (error) {
    console.error('Erro ao atualizar alerta:', error);
    return res.status(500).json({ message: 'Erro ao atualizar alerta' });
  }
};

/**
 * Deletar alerta
 * DELETE /api/v1/alerts/:id
 */
const deleteAlert = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const alert = await Alert.findOneAndDelete({ _id: id, user_id: userId });

    if (!alert) {
      return res.status(404).json({ message: 'Alerta não encontrado' });
    }

    return res.status(200).json({
      message: 'Alerta deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar alerta:', error);
    return res.status(500).json({ message: 'Erro ao deletar alerta' });
  }
};

/**
 * Marcar alerta como resolvido
 * PATCH /api/v1/alerts/:id/resolve
 */
const resolveAlert = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const alert = await Alert.findOne({ _id: id, user_id: userId });

    if (!alert) {
      return res.status(404).json({ message: 'Alerta não encontrado' });
    }

    alert.status = 'resolved';
    await alert.save();
    await alert.populate('sector_id', 'name');

    return res.status(200).json({
      message: 'Alerta marcado como resolvido',
      alert
    });
  } catch (error) {
    console.error('Erro ao resolver alerta:', error);
    return res.status(500).json({ message: 'Erro ao resolver alerta' });
  }
};

/**
 * Obter estatísticas de alertas
 * GET /api/v1/alerts/stats
 */
const getAlertStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Alert.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          byType: {
            $push: '$type'
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, active: 0, resolved: 0, byType: [] };

    // Contar por tipo
    const typeCounts = result.byType.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      total: result.total,
      active: result.active,
      resolved: result.resolved,
      byType: typeCounts
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  resolveAlert,
  getAlertStats
};

